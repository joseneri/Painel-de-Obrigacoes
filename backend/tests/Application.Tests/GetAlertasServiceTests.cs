using FluentAssertions;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Tests;

public sealed class GetAlertasServiceTests
{
    [Fact]
    public async Task ExecuteAsync_ListaProximasEAtrasadasComProximasPrimeiro()
    {
        var empresa = new Empresa(
            Guid.NewGuid(),
            "Empresa Alerta",
            "12345678000199",
            RegimeTributario.LucroReal);
        var repository = new FakeObrigacaoRepository();
        var atrasadaAntiga = CreateObrigacao(empresa, TipoObrigacao.eSocial, new DateTime(2026, 2, 9));
        var atrasadaRecente = CreateObrigacao(empresa, TipoObrigacao.DAS, new DateTime(2026, 6, 8));
        var venceEmSeisDias = CreateObrigacao(empresa, TipoObrigacao.DCTF, new DateTime(2026, 6, 15));
        var venceEmTrezeDias = CreateObrigacao(empresa, TipoObrigacao.EFD_Reinf, new DateTime(2026, 6, 22));
        var foraDaJanela = CreateObrigacao(empresa, TipoObrigacao.SPED_ECF, new DateTime(2026, 7, 20));
        await repository.AddRangeAsync(
            [atrasadaAntiga, atrasadaRecente, venceEmTrezeDias, foraDaJanela, venceEmSeisDias],
            CancellationToken.None);
        var service = new GetAlertasService(
            repository,
            new FixedTimeProvider(new DateTimeOffset(2026, 6, 9, 12, 0, 0, TimeSpan.Zero)));

        var result = await service.ExecuteAsync(CancellationToken.None);

        result.Select(alerta => alerta.ObrigacaoId).Should().Equal(
            venceEmSeisDias.Id,
            venceEmTrezeDias.Id,
            atrasadaRecente.Id,
            atrasadaAntiga.Id);
        result.Should().NotContain(alerta => alerta.ObrigacaoId == foraDaJanela.Id);
        result.Count(alerta => alerta.DiasParaVencer >= 0).Should().Be(2);
        result.Count(alerta => alerta.DiasParaVencer < 0).Should().Be(2);
    }

    private static Obrigacao CreateObrigacao(Empresa empresa, TipoObrigacao tipo, DateTime vencimento)
    {
        var obrigacao = new Obrigacao(
            Guid.NewGuid(),
            empresa.Id,
            tipo,
            new Competencia(2026, 5),
            DateTime.SpecifyKind(vencimento, DateTimeKind.Utc),
            PeriodicidadeObrigacao.Mensal);
        typeof(Obrigacao).GetProperty(nameof(Obrigacao.Empresa))!.SetValue(obrigacao, empresa);
        return obrigacao;
    }

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow()
        {
            return utcNow;
        }
    }
}
