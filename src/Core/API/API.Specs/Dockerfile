FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["API/API.Specs/API.Specs.csproj", "API/API.Specs/"]
COPY ["Repository/Repository.Core/Repository.Core.csproj", "Repository/Repository.Core/"]
COPY ["Service/Service.Core/Service.Core.csproj", "Service/Service.Core/"]
RUN dotnet restore "API/API.Specs/API.Specs.csproj"
COPY . .
WORKDIR "/src/API/API.Specs"
RUN dotnet build "./API.Specs.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./API.Specs.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS final
WORKDIR /src
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# Copy the entire source tree for testing
COPY . .
RUN mkdir -p /app/test-results
WORKDIR /src/API/API.Specs
ENTRYPOINT ["dotnet", "test", "API.Specs.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/test-results.trx"]
