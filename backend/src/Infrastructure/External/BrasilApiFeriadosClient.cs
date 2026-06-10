using System.Globalization;
using System.Net.Http.Json;
using PainelObrigacoes.Domain.Entities;

namespace PainelObrigacoes.Infrastructure.External;

public sealed class BrasilApiFeriadosClient(HttpClient httpClient)
{
    private const string Fonte = "BrasilAPI";

    public async Task<IReadOnlyCollection<FeriadoNacional>> GetFeriadosAsync(
        int ano,
        DateTime sincronizadoEm,
        CancellationToken cancellationToken)
    {
        var response = await httpClient.GetFromJsonAsync<BrasilApiFeriadoDto[]>(
            $"api/feriados/v1/{ano}",
            cancellationToken);

        if (response is null)
        {
            return [];
        }

        return response
            .Select(dto => ToFeriado(dto, sincronizadoEm))
            .Where(feriado => feriado is not null)
            .Select(feriado => feriado!)
            .ToArray();
    }

    private static FeriadoNacional? ToFeriado(BrasilApiFeriadoDto dto, DateTime sincronizadoEm)
    {
        if (!DateTime.TryParseExact(
            dto.Date,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal,
            out var data))
        {
            return null;
        }

        return new FeriadoNacional(
            Guid.NewGuid(),
            DateTime.SpecifyKind(data.Date, DateTimeKind.Utc),
            dto.Name,
            Fonte,
            sincronizadoEm);
    }

    private sealed record BrasilApiFeriadoDto(string Date, string Name, string Type, string? Weekday);
}
