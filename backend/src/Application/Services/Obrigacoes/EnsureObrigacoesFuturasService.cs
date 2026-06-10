using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class EnsureObrigacoesFuturasService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    IFeriadoNacionalRepository feriadoRepository,
    ObrigacaoRulesEngine rulesEngine,
    VencimentoCalculator vencimentoCalculator,
    TimeProvider timeProvider,
    IQueryCache queryCache)
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
        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var competenciaAtual = new Competencia(today.Year, today.Month);
        var inicio = new Competencia(competenciaAtual.Ano, 1);
        var fim = AddMonths(competenciaAtual, HorizonMonths - 1);
        var existentes = await obrigacaoRepository.GetByEmpresaEPeriodoAsync(
            empresa.Id,
            inicio,
            fim,
            cancellationToken);
        var existentesPorChave = existentes.ToDictionary(o => (o.Tipo, o.CompetenciaAno, o.CompetenciaMes));
        var feriadosNacionais = await GetFeriadosNacionaisAsync(inicio, fim, cancellationToken);
        var novas = GenerateObrigacoes(
            empresa,
            inicio,
            fim,
            existentesPorChave,
            feriadosNacionais,
            today).ToArray();

        if (novas.Length == 0)
        {
            await obrigacaoRepository.SaveChangesAsync(cancellationToken);
            queryCache.RemoveByPrefix(QueryCacheKeys.AllPrefix);
            return 0;
        }

        await obrigacaoRepository.AddRangeAsync(novas, cancellationToken);
        await obrigacaoRepository.SaveChangesAsync(cancellationToken);
        queryCache.RemoveByPrefix(QueryCacheKeys.AllPrefix);

        return novas.Length;
    }

    private IEnumerable<Obrigacao> GenerateObrigacoes(
        Empresa empresa,
        Competencia inicio,
        Competencia fim,
        Dictionary<(TipoObrigacao Tipo, int Ano, int Mes), Obrigacao> existentesPorChave,
        IReadOnlySet<DateTime> feriadosNacionais,
        DateTime today)
    {
        var competencia = inicio;

        while (competencia.CompareTo(fim) <= 0)
        {
            foreach (var tipo in rulesEngine.GetObrigacoesAplicaveis(empresa.RegimeTributario, competencia))
            {
                var chave = (tipo, competencia.Ano, competencia.Mes);
                var periodicidade = rulesEngine.GetPeriodicidade(tipo);
                var vencimento = vencimentoCalculator.CalcularVencimento(
                    tipo,
                    competencia,
                    feriadosNacionais);

                if (existentesPorChave.TryGetValue(chave, out var existente))
                {
                    existente.AtualizarRegra(vencimento, periodicidade);
                    existente.RecalcularStatus(today);
                    continue;
                }

                var obrigacao = new Obrigacao(
                    Guid.NewGuid(),
                    empresa.Id,
                    tipo,
                    competencia,
                    vencimento,
                    periodicidade);

                obrigacao.RecalcularStatus(today);
                yield return obrigacao;
            }

            competencia = competencia.ProximoMes();
        }
    }

    private async Task<IReadOnlySet<DateTime>> GetFeriadosNacionaisAsync(
        Competencia inicio,
        Competencia fim,
        CancellationToken cancellationToken)
    {
        var inicioConsulta = new DateTime(inicio.Ano, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var fimConsulta = new DateTime(fim.Ano + 1, 12, 31, 0, 0, 0, DateTimeKind.Utc);
        var feriados = await feriadoRepository.GetByPeriodoAsync(
            inicioConsulta,
            fimConsulta,
            cancellationToken);

        return feriados.Select(feriado => feriado.Data).ToHashSet();
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
