using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.DTOs;

public sealed record EntregaHistoricoDto(
    Guid EntregaId,
    Guid ObrigacaoId,
    TipoObrigacao Tipo,
    string Competencia,
    DateTime DataVencimento,
    StatusObrigacao Status,
    DateTime DataConclusao,
    string? Observacao);
