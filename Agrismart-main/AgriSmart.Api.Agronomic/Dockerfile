# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

# Build image
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy solution and project files (relative to AgrisMart-main)
COPY ../*.sln ./
COPY ../AgriSmart.Api.Agronomic/*.csproj AgriSmart.Api.Agronomic/
COPY ../AgriSmart.Core/*.csproj AgriSmart.Core/
COPY ../AgriSmart.Infrastructure/*.csproj AgriSmart.Infrastructure/

RUN dotnet restore

# Copy everything else
COPY .. .

# Build API project
WORKDIR /src/AgriSmart.Api.Agronomic
RUN dotnet build -c Release -o /app/build

# Publish step
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Runtime image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AgriSmart.Api.Agronomic.dll"]
