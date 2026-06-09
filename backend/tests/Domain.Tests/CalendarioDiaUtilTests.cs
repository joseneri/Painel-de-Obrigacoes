using FluentAssertions;
using PainelObrigacoes.Domain.Services;

namespace PainelObrigacoes.Domain.Tests;

public sealed class CalendarioDiaUtilTests
{
    [Fact]
    public void ProximoDiaUtil_deve_pular_fim_de_semana_e_feriado_nacional()
    {
        var domingoAntesDeTiradentes = new DateTime(2025, 4, 20, 0, 0, 0, DateTimeKind.Utc);

        var result = CalendarioDiaUtil.ProximoDiaUtil(domingoAntesDeTiradentes);

        result.Should().Be(new DateTime(2025, 4, 22, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public void SextaFeiraSanta_deve_ser_tratada_como_feriado_nacional_do_case()
    {
        var sextaFeiraSanta = new DateTime(2026, 4, 3, 0, 0, 0, DateTimeKind.Utc);

        var result = CalendarioDiaUtil.EhFeriadoNacional(sextaFeiraSanta);

        result.Should().BeTrue();
    }
}
