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
        var empresas = CreateEmpresas(today);
        var obrigacoes = empresas.SelectMany(empresa => GenerateObrigacoes(empresa, today)).ToList();
        var entregas = CreateEntregas(obrigacoes, today);

        await dbContext.Empresas.AddRangeAsync(empresas, cancellationToken);
        await dbContext.Obrigacoes.AddRangeAsync(obrigacoes, cancellationToken);
        await dbContext.Entregas.AddRangeAsync(entregas, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static Empresa[] CreateEmpresas(DateTime today)
    {
        return SeedEmpresas()
            .Select(seed => new Empresa(
                Guid.NewGuid(),
                seed.RazaoSocial,
                seed.Cnpj,
                seed.Regime,
                today.AddDays(-seed.DiasDesdeCadastro)))
            .ToArray();
    }

    private static SeedEmpresa[] SeedEmpresas()
    {
        return
        [
            new("Padaria Aurora ME", "10123456000101", RegimeTributario.SimplesNacional, 18),
            new("Clinica Bem Viver ME", "11234567000112", RegimeTributario.SimplesNacional, 44),
            new("Oficina Atlas ME", "12345678000123", RegimeTributario.SimplesNacional, 71),
            new("Mercado Jardim EPP", "13456789000134", RegimeTributario.SimplesNacional, 103),
            new("Studio Norte Digital ME", "14567890000145", RegimeTributario.SimplesNacional, 139),
            new("Pet Care Central EPP", "15678901000156", RegimeTributario.SimplesNacional, 184),
            new("Alfa Servicos Contabeis Ltda", "16789012000167", RegimeTributario.LucroPresumido, 29),
            new("Beta Engenharia Ltda", "17890123000178", RegimeTributario.LucroPresumido, 62),
            new("Comercial Horizonte Ltda", "18901234000189", RegimeTributario.LucroPresumido, 96),
            new("Logistica Serra Verde Ltda", "19012345000190", RegimeTributario.LucroPresumido, 127),
            new("Solaris Tecnologia Ltda", "20123456000102", RegimeTributario.LucroPresumido, 211),
            new("Vitta Farma Distribuidora Ltda", "21234567000113", RegimeTributario.LucroPresumido, 287),
            new("Delta Industria S.A.", "22345678000124", RegimeTributario.LucroReal, 38),
            new("Omega Energia S.A.", "23456789000135", RegimeTributario.LucroReal, 80),
            new("Banco Prisma S.A.", "24567890000146", RegimeTributario.LucroReal, 119),
            new("Metalurgica Litoral S.A.", "25678901000157", RegimeTributario.LucroReal, 166),
            new("Grupo Hospitalar Nucleo S.A.", "26789012000168", RegimeTributario.LucroReal, 243),
            new("Agroexport Brasil S.A.", "27890123000179", RegimeTributario.LucroReal, 329),
            new("Instituto Cultura Livre", "28901234000180", RegimeTributario.ImuneIsento, 58),
            new("Associacao Educacional Raizes", "29012345000191", RegimeTributario.ImuneIsento, 252)
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
        foreach (var obrigacao in vencidas.Where((_, index) => index % 4 != 3))
        {
            var dataConclusao = ResolveDataConclusao(obrigacao, today, entregas.Count);
            var observacao = dataConclusao.Date > obrigacao.DataVencimento.Date
                ? "Entrega registrada apos o prazo no seed."
                : "Entrega registrada para demonstracao.";

            entregas.Add(new Entrega(Guid.NewGuid(), obrigacao.Id, dataConclusao, observacao));
            obrigacao.MarcarComoEntregue();
        }

        return entregas;
    }

    private static DateTime ResolveDataConclusao(Obrigacao obrigacao, DateTime today, int index)
    {
        var data = (index % 3) switch
        {
            0 => obrigacao.DataVencimento.AddDays(-2),
            1 => obrigacao.DataVencimento,
            _ => obrigacao.DataVencimento.AddDays(2)
        };

        return data.Date > today
            ? DateTime.SpecifyKind(today, DateTimeKind.Utc)
            : DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
    }

    private readonly record struct SeedEmpresa(
        string RazaoSocial,
        string Cnpj,
        RegimeTributario Regime,
        int DiasDesdeCadastro);
}
