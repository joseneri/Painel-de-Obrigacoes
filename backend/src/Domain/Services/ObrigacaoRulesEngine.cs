using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Services;

public sealed class ObrigacaoRulesEngine
{
    private static readonly TipoObrigacao[] SimplesMensais =
    [
        TipoObrigacao.DAS,
        TipoObrigacao.eSocial
    ];

    private static readonly TipoObrigacao[] SimplesAnuais =
    [
        TipoObrigacao.DEFIS,
        TipoObrigacao.DIRF,
        TipoObrigacao.RAIS
    ];

    private static readonly TipoObrigacao[] LucroMensais =
    [
        TipoObrigacao.DCTF,
        TipoObrigacao.EFD_ICMS_IPI,
        TipoObrigacao.EFD_Contribuicoes,
        TipoObrigacao.EFD_Reinf,
        TipoObrigacao.eSocial
    ];

    private static readonly TipoObrigacao[] LucroAnuais =
    [
        TipoObrigacao.SPED_ECD,
        TipoObrigacao.SPED_ECF,
        TipoObrigacao.DIRF,
        TipoObrigacao.RAIS
    ];

    public IEnumerable<TipoObrigacao> GetObrigacoesAplicaveis(
        RegimeTributario regime,
        Competencia competencia)
    {
        return regime switch
        {
            RegimeTributario.SimplesNacional => Combine(SimplesMensais, SimplesAnuais, competencia),
            RegimeTributario.LucroPresumido => Combine(LucroMensais, LucroAnuais, competencia),
            RegimeTributario.LucroReal => Combine(LucroMensais, LucroAnuais, competencia),
            RegimeTributario.ImuneIsento => [],
            _ => throw new ArgumentOutOfRangeException(nameof(regime), regime, "Regime tributário inválido.")
        };
    }

    public PeriodicidadeObrigacao GetPeriodicidade(TipoObrigacao tipo)
    {
        return tipo switch
        {
            TipoObrigacao.DAS
                or TipoObrigacao.DCTF
                or TipoObrigacao.EFD_ICMS_IPI
                or TipoObrigacao.EFD_Contribuicoes
                or TipoObrigacao.EFD_Reinf
                or TipoObrigacao.eSocial => PeriodicidadeObrigacao.Mensal,
            TipoObrigacao.DEFIS
                or TipoObrigacao.SPED_ECD
                or TipoObrigacao.SPED_ECF
                or TipoObrigacao.DIRF
                or TipoObrigacao.RAIS => PeriodicidadeObrigacao.Anual,
            _ => throw new ArgumentOutOfRangeException(nameof(tipo), tipo, "Tipo de obrigação inválido.")
        };
    }

    private static IEnumerable<TipoObrigacao> Combine(
        IEnumerable<TipoObrigacao> mensais,
        IEnumerable<TipoObrigacao> anuais,
        Competencia competencia)
    {
        return competencia.IsJaneiro ? mensais.Concat(anuais) : mensais;
    }
}

