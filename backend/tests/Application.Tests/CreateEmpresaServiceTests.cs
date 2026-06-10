using FluentAssertions;
using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Services.Empresas;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.Services;

namespace PainelObrigacoes.Application.Tests;

public sealed class CreateEmpresaServiceTests
{
    [Theory]
    [InlineData("123")]
    [InlineData("12.345.678/0001")]
    public async Task ExecuteAsync_RejeitaCnpjSemQuatorzeDigitos(string cnpj)
    {
        var service = CreateService();
        var input = new CreateEmpresaDto("Empresa Teste", cnpj, RegimeTributario.SimplesNacional);

        var act = () => service.ExecuteAsync(input, CancellationToken.None);

        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Errors.Should().ContainKey("cnpj");
    }

    [Fact]
    public async Task ExecuteAsync_NormalizaCnpjComMascara()
    {
        var empresaRepository = new FakeEmpresaRepository([]);
        var service = CreateService(empresaRepository);
        var input = new CreateEmpresaDto(
            "Empresa Teste",
            "12.345.678/0001-90",
            RegimeTributario.SimplesNacional);

        var result = await service.ExecuteAsync(input, CancellationToken.None);

        result.CNPJ.Should().Be("12345678000190");
        empresaRepository.Empresas.Should().ContainSingle(e => e.CNPJ == "12345678000190");
    }

    private static CreateEmpresaService CreateService(FakeEmpresaRepository? empresaRepository = null)
    {
        empresaRepository ??= new FakeEmpresaRepository([]);
        var obrigacaoRepository = new FakeObrigacaoRepository();
        var queryCache = new FakeQueryCache();
        var ensureService = new EnsureObrigacoesFuturasService(
            empresaRepository,
            obrigacaoRepository,
            new FakeFeriadoNacionalRepository(),
            new ObrigacaoRulesEngine(),
            new VencimentoCalculator(),
            new FixedTimeProvider(new DateTimeOffset(2026, 6, 9, 12, 0, 0, TimeSpan.Zero)),
            queryCache);

        return new CreateEmpresaService(empresaRepository, ensureService, queryCache);
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
        private readonly List<Empresa> _empresas = [.. empresas];

        public IReadOnlyCollection<Empresa> Empresas => _empresas;

        public Task AddAsync(Empresa empresa, CancellationToken cancellationToken)
        {
            _empresas.Add(empresa);
            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<Empresa>> GetAllAsync(CancellationToken cancellationToken)
            => Task.FromResult<IReadOnlyCollection<Empresa>>(_empresas);

        public Task<Empresa?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
            => Task.FromResult(_empresas.FirstOrDefault(e => e.Id == id));

        public Task<bool> ExistsByCnpjAsync(string cnpj, CancellationToken cancellationToken)
            => Task.FromResult(_empresas.Any(e => e.CNPJ == cnpj));

        public Task<int> CountAsync(CancellationToken cancellationToken)
            => Task.FromResult(_empresas.Count);

        public void Delete(Empresa empresa)
        {
            _empresas.Remove(empresa);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken)
            => Task.CompletedTask;
    }
}
