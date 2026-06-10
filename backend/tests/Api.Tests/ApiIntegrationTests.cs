using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;

namespace PainelObrigacoes.Api.Tests;

public sealed class ApiIntegrationTests(ApiTestFactory factory) : IClassFixture<ApiTestFactory>
{
    private static int cnpjSequence = 1000;
    private readonly HttpClient client = factory.CreateClient();

    [Fact]
    public async Task GetHealth_ReturnsOk()
    {
        await factory.ResetDatabaseAsync();

        var response = await client.GetAsync("/health");
        var document = await ReadJsonDocumentAsync(response);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        document.RootElement.GetProperty("status").GetString().Should().Be("ok");
    }

    [Fact]
    public async Task PostEmpresa_CreatesEmpresaAndNormalizesCnpj()
    {
        await factory.ResetDatabaseAsync();
        var cnpj = NextCnpj();

        var response = await client.PostAsJsonAsync("/api/empresas", new
        {
            razaoSocial = "Empresa API Teste",
            cnpj = FormatCnpj(cnpj),
            regimeTributario = 1
        });
        var empresa = await ReadJsonAsync<EmpresaResponse>(response);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location?.OriginalString.Should().Contain($"/api/empresas/{empresa.Id}");
        empresa.Id.Should().NotBeEmpty();
        empresa.CNPJ.Should().Be(cnpj);
        empresa.RegimeTributario.Should().Be(1);
    }

    [Fact]
    public async Task GetObrigacoes_AfterEmpresaCreation_ReturnsGeneratedFutureObligations()
    {
        await factory.ResetDatabaseAsync();
        var empresa = await CreateEmpresaAsync();

        var obrigacoes = await GetObrigacoesAsync(empresa.Id);

        obrigacoes.Should().NotBeEmpty();
        obrigacoes.Should().OnlyContain(obrigacao => obrigacao.EmpresaId == empresa.Id);
        obrigacoes.Should().Contain(obrigacao => obrigacao.Tipo == 1);
        obrigacoes.Should().Contain(obrigacao => obrigacao.Tipo == 9);
    }

    [Fact]
    public async Task PostEntrega_RegistersDeliveryAndUpdatesObrigacaoStatus()
    {
        await factory.ResetDatabaseAsync();
        var empresa = await CreateEmpresaAsync();
        var obrigacao = (await GetObrigacoesAsync(empresa.Id)).First();
        var dataConclusao = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        var response = await client.PostAsJsonAsync("/api/entregas", new
        {
            obrigacaoId = obrigacao.Id,
            dataConclusao,
            observacao = "Entrega validada por teste de integracao"
        });
        var entrega = await ReadJsonAsync<EntregaResponse>(response);
        var atualizada = (await GetObrigacoesAsync(empresa.Id)).Single(item => item.Id == obrigacao.Id);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        entrega.ObrigacaoId.Should().Be(obrigacao.Id);
        atualizada.Status.Should().Be(3);
        atualizada.DataConclusao.Should().NotBeNull();
    }

    [Fact]
    public async Task PostEmpresa_WithInvalidPayload_ReturnsProblemDetails()
    {
        await factory.ResetDatabaseAsync();

        var response = await client.PostAsJsonAsync("/api/empresas", new
        {
            razaoSocial = "",
            cnpj = "123",
            regimeTributario = 999
        });
        var document = await ReadJsonDocumentAsync(response);
        var errors = document.RootElement.GetProperty("errors");

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
        document.RootElement.GetProperty("status").GetInt32().Should().Be(400);
        document.RootElement.GetProperty("title").GetString().Should().Contain("validacoes");
        errors.TryGetProperty("cnpj", out _).Should().BeTrue();
        errors.TryGetProperty("razaoSocial", out _).Should().BeTrue();
    }

    private async Task<EmpresaResponse> CreateEmpresaAsync()
    {
        var response = await client.PostAsJsonAsync("/api/empresas", new
        {
            razaoSocial = $"Empresa API {Guid.NewGuid():N}",
            cnpj = NextCnpj(),
            regimeTributario = 1
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return await ReadJsonAsync<EmpresaResponse>(response);
    }

    private async Task<IReadOnlyCollection<ObrigacaoResponse>> GetObrigacoesAsync(Guid empresaId)
    {
        var response = await client.GetAsync($"/api/obrigacoes?empresaId={empresaId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        return await ReadJsonAsync<ObrigacaoResponse[]>(response);
    }

    private static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response)
    {
        var result = await response.Content.ReadFromJsonAsync<T>(JsonDefaults.Options);
        result.Should().NotBeNull();
        return result!;
    }

    private static async Task<JsonDocument> ReadJsonDocumentAsync(HttpResponseMessage response)
    {
        var stream = await response.Content.ReadAsStreamAsync();
        return await JsonDocument.ParseAsync(stream);
    }

    private static string NextCnpj()
    {
        return $"90{Interlocked.Increment(ref cnpjSequence):000000000000}";
    }

    private static string FormatCnpj(string cnpj)
    {
        return $"{cnpj[..2]}.{cnpj[2..5]}.{cnpj[5..8]}/{cnpj[8..12]}-{cnpj[12..]}";
    }
}
