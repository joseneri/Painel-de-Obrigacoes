namespace PainelObrigacoes.Domain.Entities;

public sealed class Entrega
{
    private Entrega()
    {
        Obrigacao = null!;
    }

    public Entrega(Guid id, Guid obrigacaoId, DateTime dataConclusao, string? observacao)
    {
        Id = id;
        ObrigacaoId = obrigacaoId;
        DataConclusao = DateTime.SpecifyKind(dataConclusao, DateTimeKind.Utc);
        Observacao = observacao;
    }

    public Guid Id { get; private set; }

    public Guid ObrigacaoId { get; private set; }

    public Obrigacao Obrigacao { get; private set; } = null!;

    public DateTime DataConclusao { get; private set; }

    public string? Observacao { get; private set; }
}

