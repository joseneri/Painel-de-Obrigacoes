using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Infrastructure.Persistence.Repositories;

public sealed class ObrigacaoRepository(AppDbContext dbContext) : IObrigacaoRepository
{
    public async Task AddRangeAsync(IEnumerable<Obrigacao> obrigacoes, CancellationToken cancellationToken)
    {
        await dbContext.Obrigacoes.AddRangeAsync(obrigacoes, cancellationToken);
    }

    public async Task<Obrigacao?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await QueryWithIncludes()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Obrigacao>> GetCalendarioAsync(
        Guid? empresaId,
        Competencia? competencia,
        StatusObrigacao? status,
        CancellationToken cancellationToken)
    {
        var query = QueryWithIncludes();

        if (empresaId is not null)
        {
            query = query.Where(o => o.EmpresaId == empresaId.Value);
        }

        if (competencia is not null)
        {
            query = query.Where(o =>
                o.CompetenciaAno == competencia.Value.Ano &&
                o.CompetenciaMes == competencia.Value.Mes);
        }

        if (status is not null)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        return await query.OrderBy(o => o.DataVencimento).ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Obrigacao>> GetAlertasAsync(
        DateTime dataAtual,
        DateTime dataLimite,
        CancellationToken cancellationToken)
    {
        return await QueryWithIncludes()
            .Where(o => o.Status != StatusObrigacao.Entregue)
            .Where(o => o.DataVencimento.Date <= dataLimite.Date)
            .OrderBy(o => o.DataVencimento)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Obrigacao>> GetByCompetenciaAsync(
        Competencia competencia,
        CancellationToken cancellationToken)
    {
        return await QueryWithIncludes()
            .Where(o => o.CompetenciaAno == competencia.Ano && o.CompetenciaMes == competencia.Mes)
            .ToArrayAsync(cancellationToken);
    }

    public async Task AddEntregaAsync(Entrega entrega, CancellationToken cancellationToken)
    {
        await dbContext.Entregas.AddAsync(entrega, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<Obrigacao> QueryWithIncludes()
    {
        return dbContext.Obrigacoes
            .Include(o => o.Empresa)
            .Include(o => o.Entrega);
    }
}
