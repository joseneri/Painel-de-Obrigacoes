using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.DTOs;

public sealed record AlertaDto(
    Guid ObrigacaoId,
    Guid EmpresaId,
    string EmpresaRazaoSocial,
    TipoObrigacao Tipo,
    string Competencia,
    DateTime DataVencimento,
    StatusObrigacao Status,
    int DiasParaVencer);

