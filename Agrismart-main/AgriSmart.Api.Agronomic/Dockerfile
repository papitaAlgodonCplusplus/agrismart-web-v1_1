FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /
COPY ["AgriSmart.Api.Agronomic.csproj", "./"]
RUN dotnet restore "./AgriSmart.Api.Agronomic.csproj"
COPY . .
RUN dotnet build "AgriSmart.Api.Agronomic.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AgriSmart.Api.Agronomic.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AgriSmart.Api.Agronomic.dll"]