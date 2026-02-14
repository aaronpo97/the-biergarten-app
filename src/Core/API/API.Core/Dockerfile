FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
ARG APP_UID=1000
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["API/API.Core/API.Core.csproj", "API/API.Core/"]
COPY ["Domain.Entities/Domain.Entities.csproj", "Domain.Entities/"]
COPY ["Domain.Exceptions/Domain.Exceptions.csproj", "Domain.Exceptions/"]
COPY ["Infrastructure/Infrastructure.Repository/Infrastructure.Repository.csproj", "Infrastructure/Infrastructure.Repository/"]
COPY ["Infrastructure/Infrastructure.Jwt/Infrastructure.Jwt.csproj", "Infrastructure/Infrastructure.Jwt/"]
COPY ["Infrastructure/Infrastructure.PasswordHashing/Infrastructure.PasswordHashing.csproj", "Infrastructure/Infrastructure.PasswordHashing/"]
COPY ["Infrastructure/Infrastructure.Email/Infrastructure.Email.csproj", "Infrastructure/Infrastructure.Email/"]
COPY ["Service/Service.Auth/Service.Auth.csproj", "Service/Service.Auth/"]
COPY ["Service/Service.UserManagement/Service.UserManagement.csproj", "Service/Service.UserManagement/"]
RUN dotnet restore "API/API.Core/API.Core.csproj"
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
