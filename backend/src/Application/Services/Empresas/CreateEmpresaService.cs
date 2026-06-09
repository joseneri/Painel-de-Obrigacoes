using PainelObrigacoes.Application.Common;
using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Application.Mappers;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Interfaces;
using PainelObrigacoes.Domain.Services;
using PainelObrigacoes.Domain.ValueObjects;

namespace PainelObrigacoes.Application.Services.Empresas;

public sealed class CreateEmpresaService(
    IEmpresaRepository empresaRepository,
    IObrigacaoRepository obrigacaoRepository,
    ObrigacaoRulesEngine rulesEngine,
    VencimentoCalculator vencimentoCalculator,
    TimeProvider timeProvider)
{
    private const int MaxRazaoSocialLength = 180;

    public async Task<EmpresaDto> ExecuteAsync(CreateEmpresaDto input, CancellationToken cancellationToken)
    {
        var cnpj = await ValidateAsync(input, cancellationToken);
        var empresa = new Empresa(Guid.NewGuid(), input.RazaoSocial.Trim(), cnpj, input.RegimeTributario);
        var obrigacoes = GenerateObrigacoes(empresa).ToArray();

        await empresaRepository.AddAsync(empresa, cancellationToken);
        await obrigacaoRepository.AddRangeAsync(obrigacoes, cancellationToken);
        await empresaRepository.SaveChangesAsync(cancellationToken);

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

    private IEnumerable<Obrigacao> GenerateObrigacoes(Empresa empresa)
    {
        var today = timeProvider.GetUtcNow().UtcDateTime;
        var competencia = new Competencia(today.Year, today.Month);

        for (var index = 0; index < 12; index++)
        {
            foreach (var tipo in rulesEngine.GetObrigacoesAplicaveis(empresa.RegimeTributario, competencia))
            {
                yield return new Obrigacao(
                    Guid.NewGuid(),
                    empresa.Id,
                    tipo,
                    competencia,
                    vencimentoCalculator.CalcularVencimento(tipo, competencia),
                    rulesEngine.GetPeriodicidade(tipo));
            }

            competencia = competencia.ProximoMes();
        }
    }
}
