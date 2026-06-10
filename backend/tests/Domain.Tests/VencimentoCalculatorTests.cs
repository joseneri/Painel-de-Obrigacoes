using FluentAssertions;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Tests;

public sealed class VencimentoCalculatorTests
{
    private readonly VencimentoCalculator _calculator = new();
    private readonly HashSet<DateTime> _feriados = [new(2025, 4, 21, 0, 0, 0, DateTimeKind.Utc)];

    [Theory]
    [InlineData(TipoObrigacao.DAS, 2025, 1, 2025, 2, 20)]
    [InlineData(TipoObrigacao.DAS, 2025, 2, 2025, 3, 20)]
    [InlineData(TipoObrigacao.DAS, 2025, 3, 2025, 4, 22)]
    [InlineData(TipoObrigacao.DCTF, 2025, 1, 2025, 3, 17)]
    [InlineData(TipoObrigacao.DCTF, 2025, 3, 2025, 5, 15)]
    [InlineData(TipoObrigacao.eSocial, 2025, 1, 2025, 2, 7)]
    [InlineData(TipoObrigacao.SPED_ECD, 2026, 1, 2026, 6, 1)]
    [InlineData(TipoObrigacao.SPED_ECF, 2026, 1, 2026, 7, 31)]
    [InlineData(TipoObrigacao.DIRF, 2026, 1, 2026, 3, 2)]
    [InlineData(TipoObrigacao.RAIS, 2026, 1, 2026, 3, 31)]
    [InlineData(TipoObrigacao.DEFIS, 2026, 1, 2026, 3, 31)]
    public void Deve_calcular_vencimento_por_tipo_e_competencia(
        TipoObrigacao tipo,
        int ano,
        int mes,
        int anoEsperado,
        int mesEsperado,
        int diaEsperado)
    {
        var result = _calculator.CalcularVencimento(tipo, new Competencia(ano, mes), _feriados);

        result.Should().Be(new DateTime(anoEsperado, mesEsperado, diaEsperado, 0, 0, 0, DateTimeKind.Utc));
    }
}
