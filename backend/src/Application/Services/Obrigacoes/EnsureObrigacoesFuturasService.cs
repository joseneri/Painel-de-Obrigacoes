using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class EnsureObrigacoesFuturasService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    ObrigacaoRulesEngine rulesEngine,
    VencimentoCalculator vencimentoCalculator,
    TimeProvider timeProvider)
{
    private const int HorizonMonths = 12;

    public async Task<int> EnsureForTodasEmpresasAsync(CancellationToken cancellationToken)
    {
        var empresas = await empresaRepository.GetAllAsync(cancellationToken);
        var totalCriadas = 0;

        foreach (var empresa in empresas)
        {
            totalCriadas += await EnsureForEmpresaAsync(empresa, cancellationToken);
        }

        return totalCriadas;
    }

    public async Task<int> EnsureForEmpresaAsync(Empresa empresa, CancellationToken cancellationToken)
    {
        var competenciaAtual = CompetenciaAtual();
        var inicio = new Competencia(competenciaAtual.Ano, 1);
        var fim = AddMonths(competenciaAtual, HorizonMonths - 1);
        var existentes = await obrigacaoRepository.GetByEmpresaEPeriodoAsync(
            empresa.Id,
            inicio,
            fim,
            cancellationToken);
        var existentesPorChave = existentes.ToDictionary(o => (o.Tipo, o.CompetenciaAno, o.CompetenciaMes));
        var novas = GenerateObrigacoes(empresa, inicio, fim, existentesPorChave).ToArray();

        if (novas.Length == 0)
        {
            await obrigacaoRepository.SaveChangesAsync(cancellationToken);
            return 0;
        }

        await obrigacaoRepository.AddRangeAsync(novas, cancellationToken);
        await obrigacaoRepository.SaveChangesAsync(cancellationToken);

        return novas.Length;
    }

    private IEnumerable<Obrigacao> GenerateObrigacoes(
        Empresa empresa,
        Competencia inicio,
        Competencia fim,
        Dictionary<(TipoObrigacao Tipo, int Ano, int Mes), Obrigacao> existentesPorChave)
    {
        var competencia = inicio;

        while (competencia.CompareTo(fim) <= 0)
        {
            foreach (var tipo in rulesEngine.GetObrigacoesAplicaveis(empresa.RegimeTributario, competencia))
            {
                var chave = (tipo, competencia.Ano, competencia.Mes);
                var periodicidade = rulesEngine.GetPeriodicidade(tipo);
                var vencimento = vencimentoCalculator.CalcularVencimento(tipo, competencia);

                if (existentesPorChave.TryGetValue(chave, out var existente))
                {
                    existente.AtualizarRegra(vencimento, periodicidade);
                    continue;
                }

                yield return new Obrigacao(
                    Guid.NewGuid(),
                    empresa.Id,
                    tipo,
                    competencia,
                    vencimento,
                    periodicidade);
            }

            competencia = competencia.ProximoMes();
        }
    }

    private Competencia CompetenciaAtual()
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        return new Competencia(today.Year, today.Month);
    }

    private static Competencia AddMonths(Competencia competencia, int months)
    {
        for (var index = 0; index < months; index++)
        {
            competencia = competencia.ProximoMes();
        }

        return competencia;
    }
}
