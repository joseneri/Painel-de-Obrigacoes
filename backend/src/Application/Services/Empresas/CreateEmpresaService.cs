using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Application.Services.Obrigacoes;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Interfaces;

namespace PainelObrigacoes.Application.Services.Empresas;

public sealed class CreateEmpresaService(
    IEmpresaRepository empresaRepository,
    EnsureObrigacoesFuturasService ensureObrigacoesFuturasService,
    IQueryCache queryCache)
{
    private const int MaxRazaoSocialLength = 180;

    public async Task<EmpresaDto> ExecuteAsync(CreateEmpresaDto input, CancellationToken cancellationToken)
    {
        var cnpj = await ValidateAsync(input, cancellationToken);
        var empresa = new Empresa(Guid.NewGuid(), input.RazaoSocial.Trim(), cnpj, input.RegimeTributario);

        await empresaRepository.AddAsync(empresa, cancellationToken);
        await ensureObrigacoesFuturasService.EnsureForEmpresaAsync(empresa, cancellationToken);
        queryCache.RemoveByPrefix(QueryCacheKeys.AllPrefix);

        return DtoMapper.ToDto(empresa);
    }

    private async Task<string> ValidateAsync(CreateEmpresaDto input, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(input.RazaoSocial))
        {
            errors["razaoSocial"] = ["Razao social e obrigatoria."];
        }
        else if (input.RazaoSocial.Trim().Length > MaxRazaoSocialLength)
        {
            errors["razaoSocial"] = [$"Razao social deve ter no maximo {MaxRazaoSocialLength} caracteres."];
        }

        var cnpj = CnpjNormalizer.OnlyDigits(input.CNPJ ?? string.Empty);
        if (cnpj.Length != 14)
        {
            errors["cnpj"] = ["CNPJ deve conter 14 digitos numericos."];
        }
        else if (await empresaRepository.ExistsByCnpjAsync(cnpj, cancellationToken))
        {
            errors["cnpj"] = ["Ja existe empresa cadastrada com este CNPJ."];
        }

        if (!Enum.IsDefined(input.RegimeTributario))
        {
            errors["regimeTributario"] = ["Regime tributario invalido."];
        }

        if (errors.Count > 0)
        {
            throw new ValidationException(errors);
        }

        return cnpj;
    }
}
