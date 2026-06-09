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
        var inicio = CompetenciaAtual();
        var fim = AddMonths(inicio, HorizonMonths - 1);
        var existentes = await obrigacaoRepository.GetByEmpresaEPeriodoAsync(
            empresa.Id,
            inicio,
            fim,
            cancellationToken);
        var chavesExistentes = existentes
            .Select(o => (o.Tipo, o.CompetenciaAno, o.CompetenciaMes))
            .ToHashSet();
        var novas = GenerateObrigacoes(empresa, inicio, chavesExistentes).ToArray();

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
        HashSet<(TipoObrigacao Tipo, int Ano, int Mes)> chavesExistentes)
    {
        var competencia = inicio;

        for (var index = 0; index < HorizonMonths; index++)
        {
            foreach (var tipo in rulesEngine.GetObrigacoesAplicaveis(empresa.RegimeTributario, competencia))
            {
                var chave = (tipo, competencia.Ano, competencia.Mes);
                if (chavesExistentes.Contains(chave))
                {
                    continue;
                }

                yield return new Obrigacao(
                    Guid.NewGuid(),
                    empresa.Id,
                    tipo,
                    competencia,
                    vencimentoCalculator.CalcularVencimento(tipo, competencia),
                    rulesEngine.GetPeriodicidade(tipo));
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
