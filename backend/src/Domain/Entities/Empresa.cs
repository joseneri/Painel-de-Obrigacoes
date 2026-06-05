using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Domain.Entities;

public sealed class Empresa
{
    private readonly List<Obrigacao> _obrigacoes = [];

    private Empresa()
    {
        RazaoSocial = string.Empty;
        CNPJ = string.Empty;
    }

    public Empresa(Guid id, string razaoSocial, string cnpj, RegimeTributario regimeTributario)
    {
        Id = id;
        RazaoSocial = razaoSocial;
        CNPJ = cnpj;
        RegimeTributario = regimeTributario;
        CriadaEm = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public string RazaoSocial { get; private set; }

    public string CNPJ { get; private set; }

    public RegimeTributario RegimeTributario { get; private set; }

    public DateTime CriadaEm { get; private set; }

    public IReadOnlyCollection<Obrigacao> Obrigacoes => _obrigacoes.AsReadOnly();
}

