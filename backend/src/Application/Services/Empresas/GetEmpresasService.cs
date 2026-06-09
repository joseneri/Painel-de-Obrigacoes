using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Empresas;

public sealed class GetEmpresasService(IEmpresaRepository empresaRepository)
{
    public async Task<IReadOnlyCollection<EmpresaDto>> ExecuteAsync(CancellationToken cancellationToken)
    {
        var empresas = await empresaRepository.GetAllAsync(cancellationToken);

        return empresas
            .OrderBy(empresa => empresa.RazaoSocial)
            .Select(DtoMapper.ToDto)
            .ToArray();
    }
}
