using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.DTOs;

public sealed record ObrigacaoDto(
    Guid Id,
    Guid EmpresaId,
    string EmpresaRazaoSocial,
    TipoObrigacao Tipo,
    int Ano,
    int Mes,
    string Competencia,
    DateTime DataVencimento,
    StatusObrigacao Status,
    int DiasParaVencer,
    PeriodicidadeObrigacao Periodicidade,
    DateTime? DataConclusao);
