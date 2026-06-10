namespace PainelObrigacoes.Domain.Entities;

public sealed class FeriadoNacional
{
    public FeriadoNacional(Guid id, DateTime data, string nome, string fonte, DateTime sincronizadoEm)
    {
        if (string.IsNullOrWhiteSpace(nome))
        {
            throw new ArgumentException("Nome do feriado e obrigatorio.", nameof(nome));
        }

        if (string.IsNullOrWhiteSpace(fonte))
        {
            throw new ArgumentException("Fonte do feriado e obrigatoria.", nameof(fonte));
        }

        Id = id;
        Data = NormalizarData(data);
        Nome = nome.Trim();
        Fonte = fonte.Trim();
        SincronizadoEm = NormalizarDataHora(sincronizadoEm);
    }

    private FeriadoNacional()
    {
        Nome = string.Empty;
        Fonte = string.Empty;
    }

    public Guid Id { get; private set; }

    public DateTime Data { get; private set; }

    public string Nome { get; private set; }

    public string Fonte { get; private set; }

    public DateTime SincronizadoEm { get; private set; }

    public void Atualizar(string nome, string fonte, DateTime sincronizadoEm)
    {
        Nome = nome.Trim();
        Fonte = fonte.Trim();
        SincronizadoEm = NormalizarDataHora(sincronizadoEm);
    }

    private static DateTime NormalizarData(DateTime data)
    {
        return DateTime.SpecifyKind(data.Date, DateTimeKind.Utc);
    }

    private static DateTime NormalizarDataHora(DateTime data)
    {
        return data.Kind == DateTimeKind.Utc ? data : DateTime.SpecifyKind(data, DateTimeKind.Utc);
    }
}
