using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Services;

public sealed class VencimentoCalculator
{
    public DateTime CalcularVencimento(TipoObrigacao tipo, Competencia competencia)
    {
        var vencimento = tipo switch
        {
            TipoObrigacao.DAS => DiaMesSeguinte(competencia, 20),
            TipoObrigacao.DCTF => DiaSegundoMesSeguinte(competencia, 15),
            TipoObrigacao.EFD_ICMS_IPI => DiaMesSeguinte(competencia, 15),
            TipoObrigacao.EFD_Contribuicoes => DiaMesSeguinte(competencia, 15),
            TipoObrigacao.EFD_Reinf => DiaMesSeguinte(competencia, 15),
            TipoObrigacao.eSocial => DiaMesSeguinte(competencia, 7),
            TipoObrigacao.SPED_ECD => DataAnual(competencia.Ano, 5, 31),
            TipoObrigacao.SPED_ECF => DataAnual(competencia.Ano, 7, 31),
            TipoObrigacao.DIRF => UltimoDiaFevereiro(competencia.Ano),
            TipoObrigacao.RAIS => DataAnual(competencia.Ano, 3, 31),
            TipoObrigacao.DEFIS => DataAnual(competencia.Ano, 3, 31),
            _ => throw new ArgumentOutOfRangeException(nameof(tipo), tipo, "Tipo de obrigação inválido.")
        };

        return CalendarioDiaUtil.ProximoDiaUtil(vencimento);
    }

    private static DateTime DiaMesSeguinte(Competencia competencia, int dia)
    {
        var mesSeguinte = new DateTime(competencia.Ano, competencia.Mes, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddMonths(1);

        return new DateTime(mesSeguinte.Year, mesSeguinte.Month, dia, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime DiaSegundoMesSeguinte(Competencia competencia, int dia)
    {
        var mesBase = new DateTime(competencia.Ano, competencia.Mes, 1, 0, 0, 0, DateTimeKind.Utc)
            .AddMonths(2);

        return new DateTime(mesBase.Year, mesBase.Month, dia, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime DataAnual(int ano, int mes, int dia)
    {
        return new DateTime(ano, mes, dia, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime UltimoDiaFevereiro(int ano)
    {
        return new DateTime(ano, 2, DateTime.DaysInMonth(ano, 2), 0, 0, 0, DateTimeKind.Utc);
    }

}
