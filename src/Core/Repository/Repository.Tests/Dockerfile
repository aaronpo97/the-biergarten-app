FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Repository/Repository.Core/Repository.Core.csproj", "Repository/Repository.Core/"]
COPY ["Repository/Repository.Tests/Repository.Tests.csproj", "Repository/Repository.Tests/"]
RUN dotnet restore "Repository/Repository.Tests/Repository.Tests.csproj"
COPY . .
WORKDIR "/src/Repository/Repository.Tests"
RUN dotnet build "./Repository.Tests.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Repository.Tests.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS final
WORKDIR /src
# Copy the entire source tree for testing
COPY . .
RUN mkdir -p /app/test-results
WORKDIR /src/Repository/Repository.Tests
ENTRYPOINT ["dotnet", "test", "Repository.Tests.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/repository-tests.trx"]
