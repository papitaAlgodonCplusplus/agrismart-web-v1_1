Step 1: Prepare Your .NET Services for Render Deployment
1.1 Remove Windows Service Dependencies
For each .NET service, modify the Program.cs file to remove .UseWindowsService():
Before (current):
csharpIHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) => {
        // your services
    })
    .UseWindowsService()  // ❌ Remove this line
    .Build();
After (cloud-ready):
csharpIHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) => {
        // your services
    })
    .Build();  // ✅ Remove UseWindowsService()
1.2 Update Configuration for Production
Create a appsettings.Production.json file for each service:
Example for AgriSmart.Api.Agronomic:
json{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_PRODUCTION_DB_SERVER;Database=AgriSmart;Trusted_Connection=false;User Id=YOUR_USER;Password=YOUR_PASSWORD;"
  },
  "AllowedHosts": "*",
  "Urls": "http://0.0.0.0:80"
}
Step 2: Deploy Each .NET Service to Render
You'll need to deploy these services separately:

AgriSmart.Api.Agronomic (Main API)
AgriSmart.Api.Iot (IoT API)
AgriSmart.Calculator (Background service)
Agrismart.MQTTBroker (MQTT broker)
AgriSmart.OnDemandIrrigation (Irrigation service)
AgriSmart.AgronomicProcess (Processing service)

2.1 For Each Service:

Go to Render Dashboard
Click "New +" → "Web Service"
Connect your GitHub repository
Configure each service:

For AgriSmart.Api.Agronomic:
yamlName: agrismart-api-agronomic
Environment: Docker
Branch: main
Root Directory: AgriSmart.Api.Agronomic
Build Command: dotnet publish -c Release -o out
Start Command: dotnet out/AgriSmart.Api.Agronomic.dll
For AgriSmart.Api.Iot:
yamlName: agrismart-api-iot  
Environment: Docker
Branch: main
Root Directory: AgriSmart.Api.Iot
Build Command: dotnet publish -c Release -o out
Start Command: dotnet out/AgriSmart.Api.Iot.dll
For background services (Calculator, MQTTBroker, etc.):
yamlName: agrismart-calculator
Environment: Docker
Branch: main
Root Directory: AgriSmart.Calculator
Build Command: dotnet publish -c Release -o out
Start Command: dotnet out/AgriSmart.Calculator.dll
2.2 Set Environment Variables
In each Render service, go to Environment tab and add:
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://0.0.0.0:80
DATABASE_URL=your_database_connection_string
Step 3: Update Angular Environment Configuration
3.1 Update src/environments/environment.prod.ts:
typescriptexport const environment = {
  production: true,
  agronomicApiUrl: 'https://agrismart-api-agronomic.onrender.com',
  iotApiUrl: 'https://agrismart-api-iot.onrender.com',
  calculatorApiUrl: 'https://agrismart-calculator.onrender.com',
  mqttBrokerUrl: 'https://agrismart-mqtt-broker.onrender.com',
  irrigationApiUrl: 'https://agrismart-irrigation.onrender.com'
};
3.2 Update src/environments/environment.ts for development:
typescriptexport const environment = {
  production: false,
  agronomicApiUrl: 'http://localhost:7029', // or your local port
  iotApiUrl: 'http://localhost:7030',       // adjust ports as needed
  calculatorApiUrl: 'http://localhost:7031',
  mqttBrokerUrl: 'http://localhost:7032', 
  irrigationApiUrl: 'http://localhost:7033'
};
Step 4: Add Dockerfile to Each .NET Service (Optional but Recommended)
Create a Dockerfile in each service directory:
dockerfileFROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /
COPY ["YourServiceName.csproj", "./"]
RUN dotnet restore "./YourServiceName.csproj"
COPY . .
RUN dotnet build "YourServiceName.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "YourServiceName.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "YourServiceName.dll"]
Step 5: Deploy Angular Frontend to Render

Create a new Static Site on Render
Connect your repository
Configure build settings:

yamlBuild Command: npm install && npm run build
Publish Directory: dist/your-angular-app-name
Step 6: Update CORS Configuration
In your .NET APIs, update CORS to allow your Angular app:
csharp// In Startup.cs or Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("https://your-angular-app.onrender.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Use the policy
app.UseCors("AllowAngularApp");
Step 7: Database Setup
You'll need a cloud database. Here are free options:
Option 1: Supabase (PostgreSQL)

Sign up at supabase.com
Create a new project
Get connection string from Settings → Database
Update your connection strings in Render environment variables

Option 2: MongoDB Atlas

Sign up at mongodb.com/atlas
Create a free cluster
Get connection string
Update your services to use MongoDB if needed

Step 8: Test the Full System

Deploy all services to Render
Update Angular environment files
Deploy Angular frontend
Test API calls from frontend

Expected URLs After Deployment:

Angular Frontend: https://your-app-name.onrender.com
Agronomic API: https://agrismart-api-agronomic.onrender.com
IoT API: https://agrismart-api-iot.onrender.com
Calculator Service: https://agrismart-calculator.onrender.com
MQTT Broker: https://agrismart-mqtt-broker.onrender.com
Irrigation Service: https://agrismart-irrigation.onrender.com

Important Notes:

Free Render services sleep after 15 minutes of inactivity - consider upgrading to paid plans for 24/7 uptime
Cold starts - first request after sleep takes longer
Environment variables - use them instead of hardcoded configurations
Logs - Check Render logs if services fail to start