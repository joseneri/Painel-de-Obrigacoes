using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Infrastructure.Persistence.Seed;

public sealed class DatabaseSeeder(
    AppDbContext dbContext,
    ObrigacaoRulesEngine rulesEngine,
    VencimentoCalculator vencimentoCalculator,
    TimeProvider timeProvider)
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await dbContext.Empresas.AnyAsync(cancellationToken))
        {
            return;
        }

        var today = timeProvider.GetUtcNow().UtcDateTime.Date;
        var empresas = CreateEmpresas();
        var obrigacoes = empresas.SelectMany(empresa => GenerateObrigacoes(empresa, today)).ToList();
        var entregas = CreateEntregas(obrigacoes, today);

        await dbContext.Empresas.AddRangeAsync(empresas, cancellationToken);
        await dbContext.Obrigacoes.AddRangeAsync(obrigacoes, cancellationToken);
        await dbContext.Entregas.AddRangeAsync(entregas, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Empresa[] CreateEmpresas()
    {
        return
        [
            new(Guid.NewGuid(), "Barbearia do João ME", "12345678000199", RegimeTributario.SimplesNacional),
            new(Guid.NewGuid(), "Salão Beleza & Arte ME", "23456789000111", RegimeTributario.SimplesNacional),
            new(Guid.NewGuid(), "Tech Startup Ltda", "34567890000122", RegimeTributario.SimplesNacional),
            new(Guid.NewGuid(), "Construtora Mega Ltda", "45678901000133", RegimeTributario.LucroPresumido),
            new(Guid.NewGuid(), "Distribuidora Norte Ltda", "56789012000144", RegimeTributario.LucroPresumido),
            new(Guid.NewGuid(), "Banco Digital S.A.", "67890123000155", RegimeTributario.LucroReal),
            new(Guid.NewGuid(), "Indústria Nacional S.A.", "78901234000166", RegimeTributario.LucroReal),
            new(Guid.NewGuid(), "ONG Futuro Melhor", "89012345000177", RegimeTributario.ImuneIsento)
        ];
    }

    private IEnumerable<Obrigacao> GenerateObrigacoes(Empresa empresa, DateTime today)
    {
        var competenciaAtual = new Competencia(today.Year, today.Month);
        var competencia = new Competencia(today.Year, 1);
        var fim = AddMonths(competenciaAtual, 11);

        while (competencia.CompareTo(fim) <= 0)
        {
            foreach (var tipo in rulesEngine.GetObrigacoesAplicaveis(empresa.RegimeTributario, competencia))
            {
                var obrigacao = new Obrigacao(
                    Guid.NewGuid(),
                    empresa.Id,
                    tipo,
                    competencia,
                    vencimentoCalculator.CalcularVencimento(tipo, competencia),
                    rulesEngine.GetPeriodicidade(tipo));

                obrigacao.RecalcularStatus(today);
                yield return obrigacao;
            }

            competencia = competencia.ProximoMes();
        }
    }

    private static Competencia AddMonths(Competencia competencia, int months)
    {
        for (var index = 0; index < months; index++)
        {
            competencia = competencia.ProximoMes();
        }

        return competencia;
    }

    private static IReadOnlyCollection<Entrega> CreateEntregas(List<Obrigacao> obrigacoes, DateTime today)
    {
        var vencidas = obrigacoes
            .Where(o => o.DataVencimento.Date < today && o.Status != StatusObrigacao.Entregue)
            .OrderBy(o => o.DataVencimento)
            .ToArray();

        var entregas = new List<Entrega>();
        foreach (var obrigacao in vencidas.Where((_, index) => index % 2 == 0))
        {
            var dataConclusao = obrigacao.DataVencimento.AddDays(-1);
            entregas.Add(new Entrega(Guid.NewGuid(), obrigacao.Id, dataConclusao, "Seed automático."));
            obrigacao.MarcarComoEntregue();
        }

        return entregas;
    }
}
