using System.Globalization;

namespace PainelObrigacoes.Domain.ValueObjects;

public readonly record struct Competencia : IComparable<Competencia>
{
    public Competencia(int ano, int mes)
    {
        if (ano is < 2000 or > 2100)
        {
            throw new ArgumentOutOfRangeException(nameof(ano), "Ano deve estar entre 2000 e 2100.");
        }

        if (mes is < 1 or > 12)
        {
            throw new ArgumentOutOfRangeException(nameof(mes), "Mês deve estar entre 1 e 12.");
        }

        Ano = ano;
        Mes = mes;
    }

    public int Ano { get; }

    public int Mes { get; }

    public int Year => Ano;

    public int Month => Mes;

    public bool IsJaneiro => Mes == 1;

    public Competencia ProximoMes()
    {
        return Mes == 12 ? new Competencia(Ano + 1, 1) : new Competencia(Ano, Mes + 1);
    }

    public Competencia MesAnterior()
    {
        return Mes == 1 ? new Competencia(Ano - 1, 12) : new Competencia(Ano, Mes - 1);
    }

    public int CompareTo(Competencia other)
    {
        var yearComparison = Ano.CompareTo(other.Ano);
        return yearComparison != 0 ? yearComparison : Mes.CompareTo(other.Mes);
    }

    public override string ToString()
    {
        return string.Create(CultureInfo.InvariantCulture, $"{Mes:00}/{Ano:0000}");
    }
}

