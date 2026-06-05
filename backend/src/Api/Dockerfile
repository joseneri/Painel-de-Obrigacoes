FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY backend/PainelObrigacoes.sln backend/
COPY backend/src/Domain/PainelObrigacoes.Domain.csproj backend/src/Domain/
COPY backend/src/Application/PainelObrigacoes.Application.csproj backend/src/Application/
COPY backend/src/Infrastructure/PainelObrigacoes.Infrastructure.csproj backend/src/Infrastructure/
COPY backend/src/Api/PainelObrigacoes.Api.csproj backend/src/Api/

RUN dotnet restore backend/src/Api/PainelObrigacoes.Api.csproj

COPY backend/ backend/
RUN dotnet publish backend/src/Api/PainelObrigacoes.Api.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "PainelObrigacoes.Api.dll"]
