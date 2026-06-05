namespace PainelObrigacoes.Application.DTOs;

public sealed record RegistrarEntregaDto(
    Guid ObrigacaoId,
    DateTime DataConclusao,
    string? Observacao);

