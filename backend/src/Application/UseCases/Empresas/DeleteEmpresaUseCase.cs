using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.UseCases.Empresas;

public sealed class DeleteEmpresaUseCase(IEmpresaRepository empresaRepository)
{
    public async Task ExecuteAsync(Guid id, CancellationToken cancellationToken)
    {
        var empresa = await empresaRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Empresa não encontrada.");

        empresaRepository.Delete(empresa);
        await empresaRepository.SaveChangesAsync(cancellationToken);
    }
}

