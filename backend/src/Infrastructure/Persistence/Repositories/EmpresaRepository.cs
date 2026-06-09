using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Infrastructure.Persistence.Repositories;

public sealed class EmpresaRepository(AppDbContext dbContext) : IEmpresaRepository
{
    public async Task AddAsync(Empresa empresa, CancellationToken cancellationToken)
    {
        await dbContext.Empresas.AddAsync(empresa, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Empresa>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Empresas
            .OrderBy(e => e.RazaoSocial)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<Empresa?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await dbContext.Empresas
            .Include(e => e.Obrigacoes)
            .ThenInclude(o => o.Entrega)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByCnpjAsync(string cnpj, CancellationToken cancellationToken)
    {
        return await dbContext.Empresas.AnyAsync(e => e.CNPJ == cnpj, cancellationToken);
    }

    public async Task<int> CountAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Empresas.CountAsync(cancellationToken);
    }

    public void Delete(Empresa empresa)
    {
        dbContext.Empresas.Remove(empresa);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
