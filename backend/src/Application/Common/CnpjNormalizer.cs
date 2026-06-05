namespace PainelObrigacoes.Application.Common;

internal static class CnpjNormalizer
{
    public static string OnlyDigits(string value)
    {
        return new string(value.Where(char.IsDigit).ToArray());
    }
}

