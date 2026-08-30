FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# See API.Core/Dockerfile for why this copies every project file (with real relative paths) and
# restores against Biergarten.API.slnx rather than hand-listing API.Specs' transitive dependencies.
COPY ["Biergarten.API.slnx", "./"]
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["API/API.Specs/API.Specs.csproj", "API/API.Specs/"]
COPY ["Database/Database.Connection/Database.Connection.csproj", "Database/Database.Connection/"]
COPY ["Database/Database.Migrations/Database.Migrations.csproj", "Database/Database.Migrations/"]
COPY ["Database/Database.Seed/Database.Seed.csproj", "Database/Database.Seed/"]
COPY ["Domain/Domain.Entities/Domain.Entities.csproj", "Domain/Domain.Entities/"]
COPY ["Domain/Domain.Exceptions/Domain.Exceptions.csproj", "Domain/Domain.Exceptions/"]
COPY ["Features/Features.Breweries/Features.Breweries.csproj", "Features/Features.Breweries/"]
COPY ["Features/Features.Breweries.Tests/Features.Breweries.Tests.csproj", "Features/Features.Breweries.Tests/"]
COPY ["Features/Features.Emails/Features.Emails.csproj", "Features/Features.Emails/"]
COPY ["Features/Features.Emails.Tests/Features.Emails.Tests.csproj", "Features/Features.Emails.Tests/"]
COPY ["Features/Features.Locations/Features.Locations.csproj", "Features/Features.Locations/"]
COPY ["Features/Features.Locations.Tests/Features.Locations.Tests.csproj", "Features/Features.Locations.Tests/"]
COPY ["Features/Features.PhotoUpload/Features.PhotoUpload.csproj", "Features/Features.PhotoUpload/"]
COPY ["Features/Features.PhotoUpload.Tests/Features.PhotoUpload.Tests.csproj", "Features/Features.PhotoUpload.Tests/"]
COPY ["Features/Features.Users/Features.Users.csproj", "Features/Features.Users/"]
COPY ["Features/Features.Users.Tests/Features.Users.Tests.csproj", "Features/Features.Users.Tests/"]
COPY ["Infrastructure/Infrastructure.Configuration/Infrastructure.Configuration.csproj", "Infrastructure/Infrastructure.Configuration/"]
COPY ["Infrastructure/Infrastructure.Email/Infrastructure.Email.csproj", "Infrastructure/Infrastructure.Email/"]
COPY ["Infrastructure/Infrastructure.Email.Templates/Infrastructure.Email.Templates.csproj", "Infrastructure/Infrastructure.Email.Templates/"]
COPY ["Infrastructure/Infrastructure.FileUpload/Infrastructure.FileUpload.csproj", "Infrastructure/Infrastructure.FileUpload/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Shared/Shared.Application/Shared.Application.csproj", "Shared/Shared.Application/"]
COPY ["Shared/Shared.Contracts/Shared.Contracts.csproj", "Shared/Shared.Contracts/"]
RUN dotnet restore "Biergarten.API.slnx"
COPY . .
WORKDIR "/src/API/API.Specs"
RUN dotnet build "./API.Specs.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS final
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/test-results/api-specs
WORKDIR /src/API/API.Specs
ENTRYPOINT ["dotnet", "test", "API.Specs.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/api-specs/results.trx"]
