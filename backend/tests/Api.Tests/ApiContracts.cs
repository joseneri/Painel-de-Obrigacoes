using System.Text.Json;

namespace PainelObrigacoes.Api.Tests;

internal static class JsonDefaults
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };
}

internal sealed record EmpresaResponse(
    Guid Id,
    string RazaoSocial,
    string CNPJ,
    int RegimeTributario,
    DateTime CriadaEm);

internal sealed record ObrigacaoResponse(
    Guid Id,
    Guid EmpresaId,
    string EmpresaRazaoSocial,
    int Tipo,
    int Ano,
    int Mes,
    string Competencia,
    DateTime DataVencimento,
    int Status,
    int DiasParaVencer,
    int Periodicidade,
    DateTime? DataConclusao);

internal sealed record EntregaResponse(
    Guid Id,
    Guid ObrigacaoId,
    DateTime DataConclusao,
    string? Observacao);
