using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.UseCases.Empresas;

public sealed class GetEmpresasUseCase(
    IEmpresaRepository empresaRepository,
    TimeProvider timeProvider)
{
    public async Task<IReadOnlyCollection<EmpresaDto>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var empresas = await empresaRepository.GetAllAsync(cancellationToken);

        return empresas
            .OrderBy(empresa => empresa.RazaoSocial)
            .Select(empresa =>
            {
                foreach (var obrigacao in empresa.Obrigacoes)
                {
                    obrigacao.RecalcularStatus(today);
                }

                var pendentes = empresa.Obrigacoes.Count(o => o.Status == StatusObrigacao.Pendente);
                return DtoMapper.ToDto(empresa, pendentes);
            })
            .ToArray();
    }
}

