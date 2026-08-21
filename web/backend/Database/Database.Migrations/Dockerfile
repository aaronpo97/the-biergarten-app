
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
# Copy everything from the context (src/Core), matching Database.Seed/Dockerfile's context so
# ProjectReference paths outside Database/ (e.g. Infrastructure.Sql) resolve.
COPY . .
RUN dotnet restore "./Database/Database.Migrations/Database.Migrations.csproj"
RUN dotnet build "./Database/Database.Migrations/Database.Migrations.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Database/Database.Migrations/Database.Migrations.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Database.Migrations.dll"]
