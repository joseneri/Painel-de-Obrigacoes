using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Domain.Entities;

public sealed class Obrigacao
{
    private Obrigacao()
    {
        Empresa = null!;
    }

    public Obrigacao(
        Guid id,
        Guid empresaId,
        TipoObrigacao tipo,
        Competencia competencia,
        DateTime dataVencimento,
        PeriodicidadeObrigacao periodicidade)
    {
        Id = id;
        EmpresaId = empresaId;
        Tipo = tipo;
        CompetenciaAno = competencia.Ano;
        CompetenciaMes = competencia.Mes;
        DataVencimento = DateTime.SpecifyKind(dataVencimento, DateTimeKind.Utc);
        Periodicidade = periodicidade;
        Status = StatusObrigacao.Pendente;
        CriadaEm = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid EmpresaId { get; private set; }

    public Empresa Empresa { get; private set; } = null!;

    public TipoObrigacao Tipo { get; private set; }

    public int CompetenciaAno { get; private set; }

    public int CompetenciaMes { get; private set; }

    public Competencia Competencia => new(CompetenciaAno, CompetenciaMes);

    public DateTime DataVencimento { get; private set; }

    public StatusObrigacao Status { get; private set; }

    public PeriodicidadeObrigacao Periodicidade { get; private set; }

    public DateTime CriadaEm { get; private set; }

    public Entrega? Entrega { get; private set; }

    public void RecalcularStatus(DateTime dataAtual)
    {
        if (Status is StatusObrigacao.Entregue or StatusObrigacao.NaoAplicavel)
        {
            return;
        }

        Status = dataAtual.Date > DataVencimento.Date
            ? StatusObrigacao.Atrasada
            : StatusObrigacao.Pendente;
    }

    public void AtualizarRegra(DateTime dataVencimento, PeriodicidadeObrigacao periodicidade)
    {
        var vencimentoUtc = DateTime.SpecifyKind(dataVencimento, DateTimeKind.Utc);

        if (DataVencimento != vencimentoUtc)
        {
            DataVencimento = vencimentoUtc;
        }

        if (Periodicidade != periodicidade)
        {
            Periodicidade = periodicidade;
        }
    }

    public void MarcarComoEntregue()
    {
        Status = StatusObrigacao.Entregue;
    }
}
