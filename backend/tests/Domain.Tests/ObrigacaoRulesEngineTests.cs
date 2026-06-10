using FluentAssertions;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Tests;

public sealed class ObrigacaoRulesEngineTests
{
    private readonly ObrigacaoRulesEngine _engine = new();

    public static TheoryData<RegimeTributario, TipoObrigacao[]> ObrigacoesDeJaneiro()
    {
        return new TheoryData<RegimeTributario, TipoObrigacao[]>
        {
            {
                RegimeTributario.SimplesNacional,
                [
                    TipoObrigacao.DAS,
                    TipoObrigacao.eSocial,
                    TipoObrigacao.DEFIS,
                    TipoObrigacao.DIRF,
                    TipoObrigacao.RAIS
                ]
            },
            {
                RegimeTributario.LucroPresumido,
                [
                    TipoObrigacao.DCTF,
                    TipoObrigacao.EFD_ICMS_IPI,
                    TipoObrigacao.EFD_Contribuicoes,
                    TipoObrigacao.EFD_Reinf,
                    TipoObrigacao.eSocial,
                    TipoObrigacao.SPED_ECD,
                    TipoObrigacao.SPED_ECF,
                    TipoObrigacao.DIRF,
                    TipoObrigacao.RAIS
                ]
            },
            {
                RegimeTributario.LucroReal,
                [
                    TipoObrigacao.DCTF,
                    TipoObrigacao.EFD_ICMS_IPI,
                    TipoObrigacao.EFD_Contribuicoes,
                    TipoObrigacao.EFD_Reinf,
                    TipoObrigacao.eSocial,
                    TipoObrigacao.SPED_ECD,
                    TipoObrigacao.SPED_ECF,
                    TipoObrigacao.DIRF,
                    TipoObrigacao.RAIS
                ]
            },
            { RegimeTributario.ImuneIsento, [] }
        };
    }

    [Theory]
    [MemberData(nameof(ObrigacoesDeJaneiro))]
    public void Janeiro_deve_refletir_matriz_exata_do_case(
        RegimeTributario regime,
        TipoObrigacao[] expected)
    {
        var result = Get(regime, 2026, 1);

        result.Should().Equal(expected);
    }

    [Fact]
    public void SimplesNacional_em_fevereiro_deve_conter_obrigacoes_mensais()
    {
        var result = Get(RegimeTributario.SimplesNacional, 2025, 2);

        result.Should().Contain([TipoObrigacao.DAS, TipoObrigacao.eSocial]);
    }

    [Fact]
    public void SimplesNacional_em_fevereiro_nao_deve_conter_obrigacoes_de_lucro()
    {
        var result = Get(RegimeTributario.SimplesNacional, 2025, 2);

        result.Should().NotContain(TipoObrigacao.DCTF);
        result.Should().NotContain(TipoObrigacao.EFD_ICMS_IPI);
        result.Should().NotContain(TipoObrigacao.EFD_Contribuicoes);
    }

    [Fact]
    public void SimplesNacional_em_janeiro_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.SimplesNacional, 2025, 1);

        result.Should().Contain([TipoObrigacao.DEFIS, TipoObrigacao.DIRF, TipoObrigacao.RAIS]);
    }

    [Fact]
    public void SimplesNacional_fora_de_janeiro_nao_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.SimplesNacional, 2025, 2);

        result.Should().NotContain([TipoObrigacao.DEFIS, TipoObrigacao.DIRF, TipoObrigacao.RAIS]);
    }

    [Fact]
    public void LucroPresumido_em_marco_deve_conter_obrigacoes_mensais()
    {
        var result = Get(RegimeTributario.LucroPresumido, 2025, 3);

        result.Should().Contain([
            TipoObrigacao.DCTF,
            TipoObrigacao.EFD_ICMS_IPI,
            TipoObrigacao.EFD_Contribuicoes,
            TipoObrigacao.EFD_Reinf,
            TipoObrigacao.eSocial
        ]);
        result.Should().NotContain([TipoObrigacao.DAS, TipoObrigacao.DEFIS]);
    }

    [Fact]
    public void LucroPresumido_fora_de_janeiro_nao_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.LucroPresumido, 2025, 2);

        result.Should().NotContain([
            TipoObrigacao.SPED_ECD,
            TipoObrigacao.SPED_ECF,
            TipoObrigacao.DIRF,
            TipoObrigacao.RAIS
        ]);
    }

    [Fact]
    public void LucroReal_em_janeiro_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.LucroReal, 2025, 1);

        result.Should().Contain([TipoObrigacao.SPED_ECD, TipoObrigacao.SPED_ECF]);
        result.Should().Contain([TipoObrigacao.DIRF, TipoObrigacao.RAIS]);
        result.Should().NotContain([TipoObrigacao.DAS, TipoObrigacao.DEFIS]);
    }

    [Fact]
    public void LucroReal_fora_de_janeiro_nao_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.LucroReal, 2025, 7);

        result.Should().NotContain([
            TipoObrigacao.SPED_ECD,
            TipoObrigacao.SPED_ECF,
            TipoObrigacao.DIRF,
            TipoObrigacao.RAIS
        ]);
    }

    [Fact]
    public void ImuneIsento_deve_retornar_lista_vazia()
    {
        var result = Get(RegimeTributario.ImuneIsento, 2025, 1);

        result.Should().BeEmpty();
    }

    [Theory]
    [InlineData(TipoObrigacao.DAS, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.DCTF, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.EFD_ICMS_IPI, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.EFD_Contribuicoes, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.EFD_Reinf, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.eSocial, PeriodicidadeObrigacao.Mensal)]
    [InlineData(TipoObrigacao.DEFIS, PeriodicidadeObrigacao.Anual)]
    [InlineData(TipoObrigacao.SPED_ECD, PeriodicidadeObrigacao.Anual)]
    [InlineData(TipoObrigacao.SPED_ECF, PeriodicidadeObrigacao.Anual)]
    [InlineData(TipoObrigacao.DIRF, PeriodicidadeObrigacao.Anual)]
    [InlineData(TipoObrigacao.RAIS, PeriodicidadeObrigacao.Anual)]
    public void Periodicidade_deve_refletir_tipo_de_obrigacao(
        TipoObrigacao tipo,
        PeriodicidadeObrigacao expected)
    {
        _engine.GetPeriodicidade(tipo).Should().Be(expected);
    }

    private TipoObrigacao[] Get(RegimeTributario regime, int ano, int mes)
    {
        return _engine.GetObrigacoesAplicaveis(regime, new Competencia(ano, mes)).ToArray();
    }
}
