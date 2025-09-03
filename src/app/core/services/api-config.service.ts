// src/app/core/services/api-config.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  readonly agronomicApiUrl = environment.agronomicApiUrl;
  readonly iotApiUrl = environment.iotApiUrl;
  
  readonly endpoints = {
    auth: {
      login: '/api/authentication/login',
      refresh: '/api/authentication/refresh'
    },
    companies: '/api/companies',
    farms: '/api/farms',
    crops: '/api/crops',
    devices: '/api/devices',
    cropProductions: '/api/cropproductions'
  };
}