using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetDashboardService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    TimeProvider timeProvider)
{
    public async Task<DashboardDto> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var inicioMes = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var totalEmpresas = await empresaRepository.CountAsync(cancellationToken);
        var obrigacoes = await obrigacaoRepository.GetByVencimentoAsync(
            empresaId: null,
            inicio: null,
            fimExclusivo: null,
            cancellationToken: cancellationToken);
        var fimMes = inicioMes.AddMonths(1);

        foreach (var obrigacao in obrigacoes)
        {
            obrigacao.RecalcularStatus(today);
        }

        return new DashboardDto(
            totalEmpresas,
            obrigacoes.Count(o => o.DataVencimento >= inicioMes && o.DataVencimento < fimMes),
            obrigacoes.Count(o => o.Status == StatusObrigacao.Pendente),
            obrigacoes.Count(o => o.Status == StatusObrigacao.Entregue),
            obrigacoes.Count(o => o.Status == StatusObrigacao.Atrasada));
    }
}
