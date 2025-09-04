FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["AgriSmart.OnDemandIrrigation.csproj", "./"]
RUN dotnet restore "./AgriSmart.OnDemandIrrigation.csproj"
COPY . .
RUN dotnet build "AgriSmart.OnDemandIrrigation.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AgriSmart.OnDemandIrrigation.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AgriSmart.OnDemandIrrigation.dll"]