# Use the official .NET 8.0 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the .csproj file and restore any dependencies
COPY Api/Api.csproj Api/
RUN dotnet restore Api/Api.csproj

# Copy the rest of the application files
COPY Api/ Api/

# Build the application
RUN dotnet build Api/Api.csproj -c Release -o /app/build

# Publish the application to the /app/publish directory
FROM build AS publish
RUN dotnet publish Api/Api.csproj -c Release -o /app/publish

# Use the ASP.NET Core runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

# Copy the published application from the build container
COPY --from=publish /app/publish .

# Set the entry point for the application
ENTRYPOINT ["dotnet", "Api.dll"]
