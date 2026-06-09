using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Entregas;

public sealed class RegistrarEntregaService(IObrigacaoRepository obrigacaoRepository)
{
    private const int MaxObservacaoLength = 500;

    public async Task<EntregaDto> ExecuteAsync(RegistrarEntregaDto input, CancellationToken cancellationToken)
    {
        Validate(input);
        var obrigacao = await obrigacaoRepository.GetByIdAsync(input.ObrigacaoId, cancellationToken)
            ?? throw new NotFoundException("Obrigacao nao encontrada.");

        if (obrigacao.Status == StatusObrigacao.Entregue || obrigacao.Entrega is not null)
        {
            throw new ConflictException("Esta obrigacao ja foi entregue.");
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
            errors["obrigacaoId"] = ["Obrigacao e obrigatoria."];
        }

        if (input.DataConclusao == default)
        {
            errors["dataConclusao"] = ["Data de conclusao e obrigatoria."];
        }

        if (input.Observacao?.Length > MaxObservacaoLength)
        {
            errors["observacao"] = [$"Observacao deve ter no maximo {MaxObservacaoLength} caracteres."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }
    }
}
