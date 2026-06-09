using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Services.Obrigacoes;

public sealed class GetDashboardService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    TimeProvider timeProvider)
{
    public async Task<DashboardDto> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var competencia = new Competencia(today.Year, today.Month);
        var totalEmpresas = await empresaRepository.CountAsync(cancellationToken);
        var obrigacoes = await obrigacaoRepository.GetByCompetenciaAsync(competencia, cancellationToken);

        foreach (var obrigacao in obrigacoes)
        {
            obrigacao.RecalcularStatus(today);
        }

        return new DashboardDto(
            totalEmpresas,
            obrigacoes.Count,
            obrigacoes.Count(o => o.Status == StatusObrigacao.Pendente),
            obrigacoes.Count(o => o.Status == StatusObrigacao.Entregue),
            obrigacoes.Count(o => o.Status == StatusObrigacao.Atrasada));
    }
}
