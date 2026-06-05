using FluentAssertions;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Tests;

public sealed class CompetenciaTests
{
    [Fact]
    public void ToString_deve_formatar_mes_e_ano()
    {
        var competencia = new Competencia(2025, 2);

        competencia.ToString().Should().Be("02/2025");
    }

    [Fact]
    public void ProximoMes_deve_avancar_ano_quando_competencia_for_dezembro()
    {
        var competencia = new Competencia(2025, 12);

        competencia.ProximoMes().Should().Be(new Competencia(2026, 1));
    }

    [Fact]
    public void MesAnterior_deve_voltar_ano_quando_competencia_for_janeiro()
    {
        var competencia = new Competencia(2025, 1);

        competencia.MesAnterior().Should().Be(new Competencia(2024, 12));
    }
}

