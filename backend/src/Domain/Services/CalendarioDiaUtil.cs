namespace PainelObrigacoes.Domain.Services;

public static class CalendarioDiaUtil
{
    public static DateTime ProximoDiaUtil(DateTime data, IReadOnlySet<DateTime> feriadosNacionais)
    {
        var atual = data.Date;

        while (!EhDiaUtil(atual, feriadosNacionais))
        {
            atual = atual.AddDays(1);
        }

        return DateTime.SpecifyKind(atual, DateTimeKind.Utc);
    }

    public static bool EhDiaUtil(DateTime data, IReadOnlySet<DateTime> feriadosNacionais)
    {
        return data.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday &&
            !EhFeriadoNacional(data, feriadosNacionais);
    }

    public static bool EhFeriadoNacional(DateTime data, IReadOnlySet<DateTime> feriadosNacionais)
    {
        return feriadosNacionais.Contains(DateTime.SpecifyKind(data.Date, DateTimeKind.Utc));
    }
}
