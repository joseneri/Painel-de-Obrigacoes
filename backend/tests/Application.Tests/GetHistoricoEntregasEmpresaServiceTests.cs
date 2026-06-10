using FluentAssertions;
using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.Services.Empresas;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;
using System.Reflection;

namespace PainelObrigacoes.Application.Tests;

public sealed class GetHistoricoEntregasEmpresaServiceTests
{
    [Fact]
    public async Task ExecuteAsync_RetornaEntregasDaEmpresaOrdenadasPorConclusao()
    {
        var empresa = new Empresa(Guid.NewGuid(), "Empresa Teste", "12345678000199", RegimeTributario.LucroReal);
        var outraEmpresa = new Empresa(Guid.NewGuid(), "Outra Empresa", "22345678000199", RegimeTributario.LucroReal);
        var obrigacoesRepository = new FakeObrigacaoRepository();
        var entregaAntiga = CreateObrigacaoEntregue(empresa, TipoObrigacao.DCTF, 2026, 5, 10);
        var entregaRecente = CreateObrigacaoEntregue(empresa, TipoObrigacao.EFD_Reinf, 2026, 6, 20);
        var entregaOutraEmpresa = CreateObrigacaoEntregue(outraEmpresa, TipoObrigacao.DCTF, 2026, 6, 25);
        await obrigacoesRepository.AddRangeAsync(
            [entregaAntiga, entregaRecente, entregaOutraEmpresa],
            CancellationToken.None);
        var service = new GetHistoricoEntregasEmpresaService(
            new FakeEmpresaRepository([empresa, outraEmpresa]),
            obrigacoesRepository);

        var result = await service.ExecuteAsync(empresa.Id, CancellationToken.None);

        result.Should().HaveCount(2);
        result.Select(item => item.ObrigacaoId).Should().Equal(entregaRecente.Id, entregaAntiga.Id);
        result.Select(item => item.DataConclusao.Day).Should().Equal(20, 10);
    }

    [Fact]
    public async Task ExecuteAsync_RejeitaEmpresaInexistente()
    {
        var service = new GetHistoricoEntregasEmpresaService(
            new FakeEmpresaRepository([]),
            new FakeObrigacaoRepository());

        var act = () => service.ExecuteAsync(Guid.NewGuid(), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    private static Obrigacao CreateObrigacaoEntregue(
        Empresa empresa,
        TipoObrigacao tipo,
        int ano,
        int mes,
        int diaConclusao)
    {
        var obrigacao = new Obrigacao(
            Guid.NewGuid(),
            empresa.Id,
            tipo,
            new Competencia(ano, mes),
            new DateTime(ano, mes, 15, 0, 0, 0, DateTimeKind.Utc),
            PeriodicidadeObrigacao.Mensal);
        var entrega = new Entrega(
            Guid.NewGuid(),
            obrigacao.Id,
            new DateTime(ano, mes, diaConclusao, 0, 0, 0, DateTimeKind.Utc),
            "Entrega validada");
        obrigacao.MarcarComoEntregue();
        SetPrivateProperty(obrigacao, nameof(Obrigacao.Entrega), entrega);
        return obrigacao;
    }

    private static void SetPrivateProperty<T>(object instance, string propertyName, T value)
    {
        instance
            .GetType()
            .GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public)!
            .SetValue(instance, value);
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
