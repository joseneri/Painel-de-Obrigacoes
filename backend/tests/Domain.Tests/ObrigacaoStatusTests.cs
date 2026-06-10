using FluentAssertions;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Tests;

public sealed class ObrigacaoStatusTests
{
    [Fact]
    public void RecalcularStatus_deve_manter_pendente_quando_vencimento_for_futuro()
    {
        var obrigacao = CreateObrigacao(new DateTime(2026, 6, 20, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.RecalcularStatus(new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.Status.Should().Be(StatusObrigacao.Pendente);
    }

    [Fact]
    public void RecalcularStatus_deve_manter_pendente_no_dia_do_vencimento()
    {
        var obrigacao = CreateObrigacao(new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.RecalcularStatus(new DateTime(2026, 6, 9, 23, 0, 0, DateTimeKind.Utc));

        obrigacao.Status.Should().Be(StatusObrigacao.Pendente);
    }

    [Fact]
    public void RecalcularStatus_deve_marcar_atrasada_apos_vencimento()
    {
        var obrigacao = CreateObrigacao(new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.RecalcularStatus(new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.Status.Should().Be(StatusObrigacao.Atrasada);
    }

    [Fact]
    public void RecalcularStatus_deve_preservar_entregue()
    {
        var obrigacao = CreateObrigacao(new DateTime(2026, 6, 8, 0, 0, 0, DateTimeKind.Utc));
        obrigacao.MarcarComoEntregue();

        obrigacao.RecalcularStatus(new DateTime(2026, 6, 9, 0, 0, 0, DateTimeKind.Utc));

        obrigacao.Status.Should().Be(StatusObrigacao.Entregue);
    }

    private static Obrigacao CreateObrigacao(DateTime vencimento)
    {
        return new Obrigacao(
            Guid.NewGuid(),
            Guid.NewGuid(),
            TipoObrigacao.DAS,
            new Competencia(2026, 5),
            vencimento,
            PeriodicidadeObrigacao.Mensal);
    }
}
