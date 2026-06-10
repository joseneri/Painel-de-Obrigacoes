using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Infrastructure.Persistence.Repositories;

public sealed class FeriadoNacionalRepository(AppDbContext dbContext) : IFeriadoNacionalRepository
{
    public async Task<IReadOnlyCollection<FeriadoNacional>> GetByPeriodoAsync(
        DateTime inicio,
        DateTime fim,
        CancellationToken cancellationToken)
    {
        var inicioUtc = DateTime.SpecifyKind(inicio.Date, DateTimeKind.Utc);
        var fimUtc = DateTime.SpecifyKind(fim.Date, DateTimeKind.Utc);

        return await dbContext.FeriadosNacionais
            .Where(f => f.Data >= inicioUtc && f.Data <= fimUtc)
            .OrderBy(f => f.Data)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<int>> GetAnosComCacheAsync(
        int anoInicio,
        int anoFim,
        CancellationToken cancellationToken)
    {
        var inicio = new DateTime(anoInicio, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var fim = new DateTime(anoFim, 12, 31, 0, 0, 0, DateTimeKind.Utc);

        return await dbContext.FeriadosNacionais
            .Where(f => f.Data >= inicio && f.Data <= fim)
            .Select(f => f.Data.Year)
            .Distinct()
            .OrderBy(ano => ano)
            .ToArrayAsync(cancellationToken);
    }

    public async Task UpsertRangeAsync(
        IReadOnlyCollection<FeriadoNacional> feriados,
        CancellationToken cancellationToken)
    {
        if (feriados.Count == 0)
        {
            return;
        }

        var feriadosUnicos = feriados
            .GroupBy(f => f.Data)
            .Select(grupo => grupo.Last())
            .ToArray();

        var datas = feriadosUnicos.Select(f => f.Data).ToArray();
        var existentes = await dbContext.FeriadosNacionais
            .Where(f => datas.Contains(f.Data))
            .ToDictionaryAsync(f => f.Data, cancellationToken);

        foreach (var feriado in feriadosUnicos)
        {
            if (existentes.TryGetValue(feriado.Data, out var existente))
            {
                existente.Atualizar(feriado.Nome, feriado.Fonte, feriado.SincronizadoEm);
                continue;
            }

            await dbContext.FeriadosNacionais.AddAsync(feriado, cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
