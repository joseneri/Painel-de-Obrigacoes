using FluentAssertions;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Tests;

public sealed class GetDashboardServiceTests
{
    [Fact]
    public async Task ExecuteAsync_MantemObrigacoesDoMesEContaStatusGlobais()
    {
        var empresas = new[]
        {
            new Empresa(Guid.NewGuid(), "Empresa Simples", "12345678000199", RegimeTributario.SimplesNacional),
            new Empresa(Guid.NewGuid(), "Empresa Real", "22345678000199", RegimeTributario.LucroReal)
        };
        var repository = new FakeObrigacaoRepository();
        var pendenteDoMes = CreateObrigacao(empresas[0], TipoObrigacao.DAS, new DateTime(2026, 6, 20));
        var pendenteForaDoMes = CreateObrigacao(empresas[0], TipoObrigacao.eSocial, new DateTime(2026, 7, 7));
        var atrasadaForaDoMes = CreateObrigacao(empresas[1], TipoObrigacao.DCTF, new DateTime(2026, 5, 15));
        var entregueForaDoMes = CreateObrigacao(empresas[1], TipoObrigacao.SPED_ECD, new DateTime(2026, 5, 31));
        entregueForaDoMes.MarcarComoEntregue();
        await repository.AddRangeAsync(
            [pendenteDoMes, pendenteForaDoMes, atrasadaForaDoMes, entregueForaDoMes],
            CancellationToken.None);
        var cache = new FakeQueryCache();
        var service = new GetDashboardService(
            new FakeEmpresaRepository(empresas),
            repository,
            cache,
            new FixedTimeProvider(new DateTimeOffset(2026, 6, 9, 12, 0, 0, TimeSpan.Zero)));

        var result = await service.ExecuteAsync(CancellationToken.None);
        var cachedResult = await service.ExecuteAsync(CancellationToken.None);

        result.TotalEmpresas.Should().Be(2);
        result.ObrigacoesMes.Should().Be(1);
        result.Pendentes.Should().Be(2);
        result.Entregues.Should().Be(1);
        result.Atrasadas.Should().Be(1);
        cachedResult.Should().BeEquivalentTo(result);
        cache.FactoryCalls.Should().Be(1);
    }

    private static Obrigacao CreateObrigacao(Empresa empresa, TipoObrigacao tipo, DateTime vencimento)
    {
        return new Obrigacao(
            Guid.NewGuid(),
            empresa.Id,
            tipo,
            new Competencia(2026, 5),
            DateTime.SpecifyKind(vencimento, DateTimeKind.Utc),
            PeriodicidadeObrigacao.Mensal);
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
