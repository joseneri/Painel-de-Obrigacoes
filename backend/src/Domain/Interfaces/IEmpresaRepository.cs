using PainelObrigacoes.Domain.Entities;

namespace PainelObrigacoes.Domain.Interfaces;

public interface IEmpresaRepository
{
    Task AddAsync(Empresa empresa, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<Empresa>> GetAllAsync(CancellationToken cancellationToken);

    Task<Empresa?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> ExistsByCnpjAsync(string cnpj, CancellationToken cancellationToken);

    Task<int> CountAsync(CancellationToken cancellationToken);

    void Delete(Empresa empresa);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

