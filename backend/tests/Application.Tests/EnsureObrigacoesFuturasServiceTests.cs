using FluentAssertions;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Tests;

public sealed class EnsureObrigacoesFuturasServiceTests
{
    [Fact]
    public async Task EnsureForEmpresaAsync_CriaHorizonteFuturoSemDuplicar()
    {
        var empresa = new Empresa(
            Guid.NewGuid(),
            "Empresa Simples",
            "12345678000199",
            RegimeTributario.SimplesNacional);
        var obrigacoesRepository = new FakeObrigacaoRepository();
        var service = CreateService([empresa], obrigacoesRepository);

        var criadas = await service.EnsureForEmpresaAsync(empresa, CancellationToken.None);
        var criadasNaSegundaExecucao = await service.EnsureForEmpresaAsync(empresa, CancellationToken.None);

        criadas.Should().Be(40);
        criadasNaSegundaExecucao.Should().Be(0);
        obrigacoesRepository.Obrigacoes.Should().HaveCount(40);
        obrigacoesRepository.Obrigacoes
            .Select(o => new { o.EmpresaId, o.Tipo, o.CompetenciaAno, o.CompetenciaMes })
            .Distinct()
            .Should()
            .HaveCount(40);
        obrigacoesRepository.Obrigacoes.Should().Contain(o =>
            o.Tipo == TipoObrigacao.DAS &&
            o.CompetenciaAno == 2026 &&
            o.CompetenciaMes == 1 &&
            o.Status == StatusObrigacao.Atrasada);
        obrigacoesRepository.Obrigacoes.Should().Contain(o =>
            o.Tipo == TipoObrigacao.eSocial &&
            o.CompetenciaAno == 2026 &&
            o.CompetenciaMes == 6 &&
            o.Status == StatusObrigacao.Pendente);
    }

    [Fact]
    public async Task EnsureForTodasEmpresasAsync_CompletaEmpresasExistentes()
    {
        var empresas = new[]
        {
            new Empresa(Guid.NewGuid(), "Empresa Simples", "12345678000199", RegimeTributario.SimplesNacional),
            new Empresa(Guid.NewGuid(), "Entidade Isenta", "22345678000199", RegimeTributario.ImuneIsento)
        };
        var obrigacoesRepository = new FakeObrigacaoRepository();
        var service = CreateService(empresas, obrigacoesRepository);

        var criadas = await service.EnsureForTodasEmpresasAsync(CancellationToken.None);

        criadas.Should().Be(40);
        obrigacoesRepository.Obrigacoes.Should().OnlyContain(o => o.EmpresaId == empresas[0].Id);
    }

    [Fact]
    public async Task EnsureForEmpresaAsync_IncluiAnuaisDoAnoCorrenteParaEmpresaCriadaDepoisDeJaneiro()
    {
        var empresa = new Empresa(
            Guid.NewGuid(),
            "Empresa Lucro Real",
            "12345678000199",
            RegimeTributario.LucroReal);
        var obrigacoesRepository = new FakeObrigacaoRepository();
        var service = CreateService([empresa], obrigacoesRepository);

        await service.EnsureForEmpresaAsync(empresa, CancellationToken.None);

        obrigacoesRepository.Obrigacoes.Should().Contain(o =>
            o.Tipo == TipoObrigacao.SPED_ECF &&
            o.CompetenciaAno == 2026 &&
            o.CompetenciaMes == 1 &&
            o.DataVencimento == new DateTime(2026, 7, 31, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public async Task EnsureForEmpresaAsync_AtualizaVencimentoExistenteQuandoRegraMuda()
    {
        var empresa = new Empresa(
            Guid.NewGuid(),
            "Empresa Lucro Real",
            "12345678000199",
            RegimeTributario.LucroReal);
        var obrigacoesRepository = new FakeObrigacaoRepository();
        var obrigacaoAntiga = new Obrigacao(
            Guid.NewGuid(),
            empresa.Id,
            TipoObrigacao.SPED_ECD,
            new Competencia(2026, 1),
            new DateTime(2027, 5, 31, 0, 0, 0, DateTimeKind.Utc),
            PeriodicidadeObrigacao.Anual);
        await obrigacoesRepository.AddRangeAsync([obrigacaoAntiga], CancellationToken.None);
        var service = CreateService([empresa], obrigacoesRepository);

        await service.EnsureForEmpresaAsync(empresa, CancellationToken.None);

        obrigacaoAntiga.DataVencimento.Should()
            .Be(new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc));
        obrigacaoAntiga.Status.Should().Be(StatusObrigacao.Atrasada);
        obrigacoesRepository.Obrigacoes.Count(o =>
            o.Tipo == TipoObrigacao.SPED_ECD &&
            o.CompetenciaAno == 2026 &&
            o.CompetenciaMes == 1).Should().Be(1);
    }

    private static EnsureObrigacoesFuturasService CreateService(
        IReadOnlyCollection<Empresa> empresas,
        FakeObrigacaoRepository obrigacoesRepository)
    {
        return new EnsureObrigacoesFuturasService(
            new FakeEmpresaRepository(empresas),
            obrigacoesRepository,
            new FakeFeriadoNacionalRepository(),
            new ObrigacaoRulesEngine(),
            new VencimentoCalculator(),
            new FixedTimeProvider(new DateTimeOffset(2026, 6, 9, 12, 0, 0, TimeSpan.Zero)),
            new FakeQueryCache());
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow()
        {
            return utcNow;
        }
    }

    private sealed class FakeEmpresaRepository(IReadOnlyCollection<Empresa> empresas) : IEmpresaRepository
    {
        public Task AddAsync(Empresa empresa, CancellationToken cancellationToken)
            => Task.CompletedTask;

        public Task<IReadOnlyCollection<Empresa>> GetAllAsync(CancellationToken cancellationToken)
            => Task.FromResult(empresas);

        public Task<Empresa?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
            => Task.FromResult(empresas.FirstOrDefault(e => e.Id == id));

        public Task<bool> ExistsByCnpjAsync(string cnpj, CancellationToken cancellationToken)
            => Task.FromResult(empresas.Any(e => e.CNPJ == cnpj));

        public Task<int> CountAsync(CancellationToken cancellationToken)
            => Task.FromResult(empresas.Count);

        public void Delete(Empresa empresa)
        {
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }
}
