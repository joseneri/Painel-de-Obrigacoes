namespace PainelObrigacoes.Application.DTOs;

public sealed record EntregaDto(
    Guid Id,
    Guid ObrigacaoId,
    DateTime DataConclusao,
    string? Observacao);

