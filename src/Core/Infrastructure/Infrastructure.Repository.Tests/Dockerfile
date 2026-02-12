FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Infrastructure/Infrastructure.Repository/Infrastructure.Repository.csproj", "Infrastructure/Infrastructure.Repository/"]
COPY ["Infrastructure/Infrastructure.Repository.Tests/Repository.Tests.csproj", "Infrastructure/Infrastructure.Repository.Tests/"]
RUN dotnet restore "Infrastructure/Infrastructure.Repository.Tests/Repository.Tests.csproj"
COPY . .
WORKDIR "/src/Infrastructure/Infrastructure.Repository.Tests"
RUN dotnet build "./Repository.Tests.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS final
RUN mkdir -p /app/test-results
WORKDIR /src/Infrastructure/Infrastructure.Repository.Tests
ENTRYPOINT ["dotnet", "test", "./Repository.Tests.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/repository-tests.trx"]
