using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Empresas;

public sealed class GetHistoricoEntregasEmpresaService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository)
{
    public async Task<IReadOnlyCollection<EntregaHistoricoDto>> ExecuteAsync(
        Guid empresaId,
        CancellationToken cancellationToken)
    {
        _ = await empresaRepository.GetByIdAsync(empresaId, cancellationToken)
            ?? throw new NotFoundException("Empresa nao encontrada.");

        var obrigacoes = await obrigacaoRepository.GetEntregasByEmpresaAsync(
            empresaId,
            cancellationToken);

        return obrigacoes
            .Select(DtoMapper.ToHistoricoDto)
            .ToArray();
    }
}
