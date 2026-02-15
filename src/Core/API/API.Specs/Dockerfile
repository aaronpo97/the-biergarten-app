FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["API/API.Specs/API.Specs.csproj", "API/API.Specs/"]
COPY ["Domain.Entities/Domain.Entities.csproj", "Domain.Entities/"]
COPY ["Domain.Exceptions/Domain.Exceptions.csproj", "Domain.Exceptions/"]
COPY ["Infrastructure/Infrastructure.Repository/Infrastructure.Repository.csproj", "Infrastructure/Infrastructure.Repository/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Infrastructure/Infrastructure.Email/Infrastructure.Email.csproj", "Infrastructure/Infrastructure.Email/"]
COPY ["Service/Service.Auth/Service.Auth.csproj", "Service/Service.Auth/"]
COPY ["Service/Service.UserManagement/Service.UserManagement.csproj", "Service/Service.UserManagement/"]
RUN dotnet restore "API/API.Specs/API.Specs.csproj"
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
