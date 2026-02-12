FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["API/API.Specs/API.Specs.csproj", "API/API.Specs/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Infrastructure/Infrastructure.Repository/Repository.Core/Repository.Core.csproj", "Infrastructure/Infrastructure.Repository/Repository.Core/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Service/Service.Core/Service.Core.csproj", "Service/Service.Core/"]
RUN dotnet restore "API/API.Specs/API.Specs.csproj"
COPY . .
WORKDIR "/src/API/API.Specs"
RUN dotnet build "./API.Specs.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS final
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app/test-results
WORKDIR /src/API/API.Specs
ENTRYPOINT ["dotnet", "test", "API.Specs.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/test-results.trx"]
