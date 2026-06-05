using FluentAssertions;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Tests;

public sealed class ObrigacaoRulesEngineTests
{
    private readonly ObrigacaoRulesEngine _engine = new();

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
    public void SimplesNacional_fora_de_janeiro_nao_deve_conter_defis()
    {
        var result = Get(RegimeTributario.SimplesNacional, 2025, 2);

        result.Should().NotContain(TipoObrigacao.DEFIS);
    }

    [Fact]
    public void LucroPresumido_em_marco_deve_conter_obrigacoes_mensais()
    {
        var result = Get(RegimeTributario.LucroPresumido, 2025, 3);

        result.Should().Contain([TipoObrigacao.DCTF, TipoObrigacao.EFD_ICMS_IPI, TipoObrigacao.eSocial]);
    }

    [Fact]
    public void LucroReal_em_janeiro_deve_conter_obrigacoes_anuais()
    {
        var result = Get(RegimeTributario.LucroReal, 2025, 1);

        result.Should().Contain([TipoObrigacao.SPED_ECD, TipoObrigacao.SPED_ECF]);
        result.Should().Contain([TipoObrigacao.DIRF, TipoObrigacao.RAIS]);
    }

    [Fact]
    public void ImuneIsento_deve_retornar_lista_vazia()
    {
        var result = Get(RegimeTributario.ImuneIsento, 2025, 1);

        result.Should().BeEmpty();
    }

    private TipoObrigacao[] Get(RegimeTributario regime, int ano, int mes)
    {
        return _engine.GetObrigacoesAplicaveis(regime, new Competencia(ano, mes)).ToArray();
    }
}

