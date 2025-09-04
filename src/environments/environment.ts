// src/environments/environment.ts
export const environment = {
  production: false,
  agronomicApiUrl: 'https://localhost:7029', // AgriSmart.Api.Agronomic port
  iotApiUrl: 'https://localhost:7030'        // AgriSmart.Api.Iot port (based on 7061 in launchSettings but using 7030 from docs)
};