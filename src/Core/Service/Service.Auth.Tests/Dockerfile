FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Domain.Entities/Domain.Entities.csproj", "Domain.Entities/"]
COPY ["Domain.Exceptions/Domain.Exceptions.csproj", "Domain.Exceptions/"]
COPY ["Infrastructure/Infrastructure.Email/Infrastructure.Email.csproj", "Infrastructure/Infrastructure.Email/"]
COPY ["Infrastructure/Infrastructure.Email.Templates/Infrastructure.Email.Templates.csproj", "Infrastructure/Infrastructure.Email.Templates/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.Repository/Infrastructure.Repository.csproj", "Infrastructure/Infrastructure.Repository/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Service/Service.Auth/Service.Auth.csproj", "Service/Service.Auth/"]
COPY ["Service/Service.Auth.Tests/Service.Auth.Tests.csproj", "Service/Service.Auth.Tests/"]
RUN dotnet restore "Service/Service.Auth.Tests/Service.Auth.Tests.csproj"
COPY . .
WORKDIR "/src/Service/Service.Auth.Tests"
RUN dotnet build "./Service.Auth.Tests.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS final
RUN mkdir -p /app/test-results/service-auth-tests
WORKDIR /src/Service/Service.Auth.Tests
ENTRYPOINT ["dotnet", "test", "./Service.Auth.Tests.csproj", "-c", "Release", "--logger", "trx;LogFileName=/app/test-results/service-auth-tests/results.trx"]
