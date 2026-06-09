namespace PainelObrigacoes.Domain.Services;

public static class CalendarioDiaUtil
{
    public static DateTime ProximoDiaUtil(DateTime data)
    {
        var atual = data.Date;

        while (!EhDiaUtil(atual))
        {
            atual = atual.AddDays(1);
        }

        return DateTime.SpecifyKind(atual, DateTimeKind.Utc);
    }

    public static bool EhDiaUtil(DateTime data)
    {
        return data.DayOfWeek is not DayOfWeek.Saturday and not DayOfWeek.Sunday &&
            !EhFeriadoNacional(data);
    }

    public static bool EhFeriadoNacional(DateTime data)
    {
        var dia = data.Date;
        var sextaFeiraSanta = CalcularPascoa(dia.Year).AddDays(-2);

        return (dia.Month, dia.Day) switch
        {
            (1, 1) => true,
            (4, 21) => true,
            (5, 1) => true,
            (9, 7) => true,
            (10, 12) => true,
            (11, 2) => true,
            (11, 15) => true,
            (11, 20) => true,
            (12, 25) => true,
            _ => dia == sextaFeiraSanta
        };
    }

    private static DateTime CalcularPascoa(int ano)
    {
        var a = ano % 19;
        var b = ano / 100;
        var c = ano % 100;
        var d = b / 4;
        var e = b % 4;
        var f = (b + 8) / 25;
        var g = (b - f + 1) / 3;
        var h = (19 * a + b - d - g + 15) % 30;
        var i = c / 4;
        var k = c % 4;
        var l = (32 + 2 * e + 2 * i - h - k) % 7;
        var m = (a + 11 * h + 22 * l) / 451;
        var mes = (h + l - 7 * m + 114) / 31;
        var dia = ((h + l - 7 * m + 114) % 31) + 1;

        return new DateTime(ano, mes, dia, 0, 0, 0, DateTimeKind.Utc);
    }
}
