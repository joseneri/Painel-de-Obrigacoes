using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.UseCases.Entregas;

public sealed class RegistrarEntregaUseCase(IObrigacaoRepository obrigacaoRepository)
{
    public async Task<EntregaDto> ExecuteAsync(RegistrarEntregaDto input, CancellationToken cancellationToken)
    {
        Validate(input);
        var obrigacao = await obrigacaoRepository.GetByIdAsync(input.ObrigacaoId, cancellationToken)
            ?? throw new NotFoundException("Obrigação não encontrada.");

        if (obrigacao.Status == StatusObrigacao.Entregue || obrigacao.Entrega is not null)
        {
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["obrigacaoId"] = ["Esta obrigação já foi entregue."]
            });
        }

        var entrega = new Entrega(Guid.NewGuid(), obrigacao.Id, input.DataConclusao, input.Observacao);
        await obrigacaoRepository.AddEntregaAsync(entrega, cancellationToken);
        obrigacao.MarcarComoEntregue();
        await obrigacaoRepository.SaveChangesAsync(cancellationToken);

        return DtoMapper.ToDto(entrega);
    }

    private static void Validate(RegistrarEntregaDto input)
    {
        var errors = new Dictionary<string, string[]>();

        if (input.ObrigacaoId == Guid.Empty)
        {
            errors["obrigacaoId"] = ["Obrigação é obrigatória."];
        }

        if (input.DataConclusao == default)
        {
            errors["dataConclusao"] = ["Data de conclusão é obrigatória."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }
}

