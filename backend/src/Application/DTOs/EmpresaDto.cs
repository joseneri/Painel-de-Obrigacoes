using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.DTOs;

public sealed record EmpresaDto(
    Guid Id,
    string RazaoSocial,
    string CNPJ,
    RegimeTributario RegimeTributario,
    DateTime CriadaEm,
    int Pendentes);

