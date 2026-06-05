namespace PainelObrigacoes.Application.DTOs;

public sealed record DashboardDto(
    int TotalEmpresas,
    int ObrigacoesMes,
    int Pendentes,
    int Entregues,
    int Atrasadas);

