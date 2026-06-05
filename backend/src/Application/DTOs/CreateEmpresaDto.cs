using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.DTOs;

public sealed record CreateEmpresaDto(
    string RazaoSocial,
    string CNPJ,
    RegimeTributario RegimeTributario);

