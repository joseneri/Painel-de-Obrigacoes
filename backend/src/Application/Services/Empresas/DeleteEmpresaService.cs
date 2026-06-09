using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Empresas;

public sealed class DeleteEmpresaService(IEmpresaRepository empresaRepository)
{
    public async Task ExecuteAsync(Guid id, CancellationToken cancellationToken)
    {
        var empresa = await empresaRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Empresa não encontrada.");

        empresaRepository.Delete(empresa);
        await empresaRepository.SaveChangesAsync(cancellationToken);
    }
}
