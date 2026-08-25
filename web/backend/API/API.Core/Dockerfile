FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
ARG APP_UID=1000
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the solution file and every project file first (preserving their real relative paths, since
# ProjectReference paths are resolved relative to the referencing .csproj's location), so the
# `dotnet restore` layer stays cached as long as no project file or package reference changes,
# independent of source-only edits. Restoring against Biergarten.API.slnx avoids hand-maintaining a per-project
# dependency list here that silently drifts out of sync as ProjectReferences change.
COPY ["Biergarten.API.slnx", "./"]
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["API/API.Specs/API.Specs.csproj", "API/API.Specs/"]
COPY ["Database/Database.Connection/Database.Connection.csproj", "Database/Database.Connection/"]
COPY ["Database/Database.Migrations/Database.Migrations.csproj", "Database/Database.Migrations/"]
COPY ["Database/Database.Seed/Database.Seed.csproj", "Database/Database.Seed/"]
COPY ["Domain/Domain.Entities/Domain.Entities.csproj", "Domain/Domain.Entities/"]
COPY ["Domain/Domain.Exceptions/Domain.Exceptions.csproj", "Domain/Domain.Exceptions/"]
COPY ["Features/Features.Auth/Features.Auth.csproj", "Features/Features.Auth/"]
COPY ["Features/Features.Auth.Tests/Features.Auth.Tests.csproj", "Features/Features.Auth.Tests/"]
COPY ["Features/Features.Breweries/Features.Breweries.csproj", "Features/Features.Breweries/"]
COPY ["Features/Features.Breweries.Tests/Features.Breweries.Tests.csproj", "Features/Features.Breweries.Tests/"]
COPY ["Features/Features.Emails/Features.Emails.csproj", "Features/Features.Emails/"]
COPY ["Features/Features.Emails.Tests/Features.Emails.Tests.csproj", "Features/Features.Emails.Tests/"]
COPY ["Features/Features.Locations/Features.Locations.csproj", "Features/Features.Locations/"]
COPY ["Features/Features.Locations.Tests/Features.Locations.Tests.csproj", "Features/Features.Locations.Tests/"]
COPY ["Features/Features.UserManagement/Features.UserManagement.csproj", "Features/Features.UserManagement/"]
COPY ["Features/Features.UserManagement.Tests/Features.UserManagement.Tests.csproj", "Features/Features.UserManagement.Tests/"]
COPY ["Infrastructure/Infrastructure.Email/Infrastructure.Email.csproj", "Infrastructure/Infrastructure.Email/"]
COPY ["Infrastructure/Infrastructure.Email.Templates/Infrastructure.Email.Templates.csproj", "Infrastructure/Infrastructure.Email.Templates/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Shared/Shared.Application/Shared.Application.csproj", "Shared/Shared.Application/"]
COPY ["Shared/Shared.Contracts/Shared.Contracts.csproj", "Shared/Shared.Contracts/"]
RUN dotnet restore "Biergarten.API.slnx"
COPY . .
WORKDIR "/src/API/API.Core"
RUN dotnet build "./API.Core.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./API.Core.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.Core.dll"]
