using PainelObrigacoes.Application.DTOs;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Application.Mappers;

internal static class DtoMapper
{
    public static EmpresaDto ToDto(Empresa empresa)
    {
        return new EmpresaDto(
            empresa.Id,
            empresa.RazaoSocial,
            empresa.CNPJ,
            empresa.RegimeTributario,
            empresa.CriadaEm);
    }

    public static ObrigacaoDto ToDto(Obrigacao obrigacao, DateTime hoje)
    {
        return new ObrigacaoDto(
            obrigacao.Id,
            obrigacao.EmpresaId,
            obrigacao.Empresa.RazaoSocial,
            obrigacao.Tipo,
            obrigacao.Competencia.Ano,
            obrigacao.Competencia.Mes,
            obrigacao.Competencia.ToString(),
            obrigacao.DataVencimento,
            obrigacao.Status,
            (obrigacao.DataVencimento.Date - hoje.Date).Days,
            obrigacao.Periodicidade,
            obrigacao.Entrega?.DataConclusao);
    }

    public static AlertaDto ToAlertaDto(Obrigacao obrigacao, DateTime hoje)
    {
        return new AlertaDto(
            obrigacao.Id,
            obrigacao.EmpresaId,
            obrigacao.Empresa.RazaoSocial,
            obrigacao.Tipo,
            obrigacao.Competencia.ToString(),
            obrigacao.DataVencimento,
            obrigacao.Status,
            (obrigacao.DataVencimento.Date - hoje.Date).Days);
    }

    public static EntregaDto ToDto(Entrega entrega)
    {
        return new EntregaDto(
            entrega.Id,
            entrega.ObrigacaoId,
            entrega.DataConclusao,
            entrega.Observacao);
    }

    public static EntregaHistoricoDto ToHistoricoDto(Obrigacao obrigacao)
    {
        var entrega = obrigacao.Entrega
            ?? throw new InvalidOperationException("Obrigacao sem entrega nao pode compor historico.");

        return new EntregaHistoricoDto(
            entrega.Id,
            obrigacao.Id,
            obrigacao.Tipo,
            obrigacao.Competencia.ToString(),
            obrigacao.DataVencimento,
            obrigacao.Status,
            entrega.DataConclusao,
            entrega.Observacao);
    }
}
