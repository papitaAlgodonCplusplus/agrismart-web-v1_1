// src/app/features/admin/admin.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, catchError, tap, map, switchMap, mergeMap } from 'rxjs';
import { firstValueFrom } from 'rxjs';

// Services
import { ApiService } from '../../core/services/api.service';
import { ApiConfigService } from '../../core/services/api-config.service';
import { AuthService } from '../../core/auth/auth.service';
import { CompanyService } from '../companies/services/company.service';
import { FarmService } from '../farms/services/farm.service';
import { CropService } from '../crops/services/crop.service';
import { DeviceService } from '../devices/services/device.service';
import { ProductionUnitService } from '../production-units/services/production-unit.service';
import { UserService } from '../users/services/user.service';
import { SensorService } from '../sensors/services/sensor.service';
import { FertilizerService } from '../fertilizers/services/fertilizer.service';
import { WaterChemistryService } from '../water-chemistry/services/water-chemistry.service';
import { LicenseService } from '../licenses/services/license.service';
import { CatalogService } from '../catalogs/services/catalog.service';

interface Entity {
  id?: number;
  type?: string;
  name?: string;
  deviceId?: number;
  sensorLabel?: string;
  userEmail?: string;
  clientId?: number;
  catalogId?: number;
  active?: boolean;
  isActive?: boolean;
  [key: string]: any; // ← ADD THIS LINE - allows any property access
}

interface EntityConfig {
  name: string;
  type?: string; // Optional type field
  endpoint: string;
  displayName: string;
  icon: string;
  fields: EntityField[];
  category: 'main' | 'config' | 'advanced';
  useService?: boolean;
  nameField?: string; // Field to use as display name
  requiresCatalog?: boolean; // New property for catalog-dependent entities
}

interface EntityField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'datetime' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
  options?: { value: any; label: string }[];
}

interface AdminStats {
  totalCompanies: number;
  totalFarms: number;
  totalCrops: number;
  totalDevices: number;
  totalProductionUnits: number;
  totalUsers: number;
  totalSensors: number;
  totalFertilizers: number;
  totalWaterChemistry: number;
  totalLicenses: number;
  totalCatalogs: number; // Add catalog count
  [key: string]: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private apiService = inject(ApiService);
  private apiConfig = inject(ApiConfigService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private farmService = inject(FarmService);
  private cropService = inject(CropService);
  private deviceService = inject(DeviceService);
  private productionUnitService = inject(ProductionUnitService);
  private userService = inject(UserService);
  private sensorService = inject(SensorService);
  private fertilizerService = inject(FertilizerService);
  private waterChemistryService = inject(WaterChemistryService);
  private licenseService = inject(LicenseService);
  private catalogService = inject(CatalogService);
  showDetailsModal = false;
  selectedFertilizer: any;

  // State management
  selectedEntity: string = '';
  entityData: any;
  filteredData: any;
  currentItem: any;
  isLoading = false;
  isEditing = false;
  showModal = false;
  errorMessage = '';
  successMessage = '';
  rawData: any = {};

  // Catalog management
  availableCatalogs: any[] = [];
  selectedCatalogId: number | null = null;
  loadedUsers: Entity[] = []; // Store loaded users for catalog loading

  // Filtering and search
  searchTerm = '';
  filterStatus = '';
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Entity statistics
  entityStats = [
    { icon: 'bi bi-building', count: 0, label: 'Compañías' },
    { icon: 'bi bi-house', count: 0, label: 'Fincas' },
    { icon: 'bi bi-cpu', count: 0, label: 'Dispositivos' },
    { icon: 'bi bi-flower1', count: 0, label: 'Cultivos' }
  ];

  // Complete statistics object
  adminStats: AdminStats = {
    totalCompanies: 0,
    totalFarms: 0,
    totalCrops: 0,
    totalDevices: 0,
    totalProductionUnits: 0,
    totalUsers: 0,
    totalSensors: 0,
    totalFertilizers: 0,
    totalWaterChemistry: 0,
    totalLicenses: 0,
    totalCatalogs: 0
  };

  // Entity configurations with proper field mapping
  entityConfigs: EntityConfig[] = [
    // Main Management Entities
    {
      name: 'company',
      endpoint: '/Company',
      displayName: 'Compañías',
      icon: 'bi bi-building',
      category: 'main',
      useService: true,
      nameField: 'name',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'farm',
      endpoint: '/Farm',
      displayName: 'Fincas',
      icon: 'bi bi-house',
      category: 'main',
      useService: true,
      nameField: 'name',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'crop',
      endpoint: '/Crop',
      displayName: 'Cultivos',
      icon: 'bi bi-flower1',
      category: 'main',
      useService: true,
      nameField: 'name',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'cropBaseTemperature', label: 'Temperatura Base (°C)', type: 'number' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'device',
      endpoint: '/Device',
      displayName: 'Dispositivos',
      icon: 'bi bi-cpu',
      category: 'main',
      useService: true,
      nameField: 'deviceId',
      fields: [
        { key: 'deviceId', label: 'ID Dispositivo', type: 'text', required: true },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    // Configuration Entities
    {
      name: 'catalog',
      endpoint: '/Catalog',
      displayName: 'Catálogos',
      icon: 'bi bi-folder',
      category: 'config',
      useService: true,
      nameField: 'name',
      fields: [
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'clientId', label: 'ID Cliente', type: 'number', required: true },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'user',
      endpoint: '/User',
      displayName: 'Usuarios',
      icon: 'bi bi-people',
      category: 'config',
      useService: true,
      nameField: 'userEmail',
      fields: [
        { key: 'userEmail', label: 'Email', type: 'email', required: true },
        {
          key: 'profileId',
          label: 'Rol',
          type: 'select',
          required: true,
          options: [
            { value: 1, label: 'Admin' },
            { value: 2, label: 'Client' }
          ]
        }
      ]
    },
    {
      name: 'sensor',
      endpoint: '/Sensor',
      displayName: 'Sensores',
      icon: 'bi bi-thermometer-half',
      category: 'config',
      useService: true,
      nameField: 'sensorLabel',
      fields: [
        { key: 'sensorLabel', label: 'Etiqueta Sensor', type: 'text', required: true },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'deviceId', label: 'ID Dispositivo', type: 'number', required: true },
        { key: 'measurementVariableId', label: 'ID Variable Medición', type: 'number' },
        { key: 'numberOfContainers', label: 'Número de Contenedores', type: 'number' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    // Advanced Entities
    {
      name: 'fertilizer',
      endpoint: '/Fertilizer',
      displayName: 'Fertilizantes',
      icon: 'bi bi-droplet-fill',
      category: 'advanced',
      useService: true,
      nameField: 'name',
      requiresCatalog: true,
      fields: [
        { key: 'catalogId', label: 'ID Catálogo', type: 'select', required: true, options: [] },
        { key: 'name', label: 'Nombre', type: 'text', required: true },
        { key: 'brand', label: 'Marca', type: 'text' },
        { key: 'description', label: 'Descripción', type: 'textarea' },
        { key: 'type', label: 'Tipo', type: 'text', required: true },
        { key: 'formulation', label: 'Formulación', type: 'text' },
        { key: 'concentration', label: 'Concentración', type: 'number' },
        { key: 'concentrationUnit', label: 'Unidad de Concentración', type: 'text' },
        { key: 'applicationMethod', label: 'Método de Aplicación', type: 'text' },
        { key: 'nitrogenPercentage', label: 'Porcentaje de Nitrógeno', type: 'number' },
        { key: 'phosphorusPercentage', label: 'Porcentaje de Fósforo', type: 'number' },
        { key: 'potassiumPercentage', label: 'Porcentaje de Potasio', type: 'number' },
        { key: 'micronutrients', label: 'Micronutrientes', type: 'text' },
        { key: 'currentStock', label: 'Stock Actual', type: 'number' },
        { key: 'minimumStock', label: 'Stock Mínimo', type: 'number' },
        { key: 'stockUnit', label: 'Unidad de Stock', type: 'text' },
        { key: 'pricePerUnit', label: 'Precio por Unidad', type: 'number' },
        { key: 'supplier', label: 'Proveedor', type: 'text' },
        { key: 'expirationDate', label: 'Fecha de Vencimiento', type: 'date' },
        { key: 'storageInstructions', label: 'Instrucciones de Almacenamiento', type: 'textarea' },
        { key: 'applicationInstructions', label: 'Instrucciones de Aplicación', type: 'textarea' },
        { key: 'isActive', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'waterChemistry',
      endpoint: '/WaterChemistry',
      displayName: 'Química del Agua',
      icon: 'bi bi-droplet',
      category: 'advanced',
      useService: true,
      nameField: 'waterId',
      fields: [
        { key: 'waterId', label: 'ID del Agua', type: 'number', required: true },
        { key: 'ca', label: 'Calcio (Ca)', type: 'number' },
        { key: 'k', label: 'Potasio (K)', type: 'number' },
        { key: 'mg', label: 'Magnesio (Mg)', type: 'number' },
        { key: 'na', label: 'Sodio (Na)', type: 'number' },
        { key: 'cl', label: 'Cloro (Cl)', type: 'number' },
        { key: 'so4', label: 'Sulfato (SO4)', type: 'number' },
        { key: 'hco3', label: 'Bicarbonato (HCO3)', type: 'number' },
        { key: 'ph', label: 'pH', type: 'number' },
        { key: 'ec', label: 'Conductividad Eléctrica (EC)', type: 'number' },
        { key: 'tds', label: 'Sólidos Disueltos Totales (TDS)', type: 'number' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    },
    {
      name: 'license',
      endpoint: '/License',
      displayName: 'Licencias',
      icon: 'bi bi-key',
      category: 'advanced',
      useService: true,
      nameField: 'key',
      fields: [
        { key: 'clientId', label: 'ID Cliente', type: 'number', required: true },
        { key: 'key', label: 'Clave de Licencia', type: 'text', required: true },
        { key: 'expirationDate', label: 'Fecha Expiración', type: 'datetime' },
        { key: 'allowedCompanies', label: 'Compañías Permitidas', type: 'number' },
        { key: 'allowedFarms', label: 'Fincas Permitidas', type: 'number' },
        { key: 'allowedDevices', label: 'Dispositivos Permitidos', type: 'number' },
        { key: 'active', label: 'Activo', type: 'boolean' }
      ]
    }
  ];

  ngOnInit(): void {
    this.updateFertilizerConfig();

    this.loadAdminData();
  }

  /**
   * Extract data from API response with proper handling of nested structures
   */
  private extractResponseData(response: any, entityName: string): Entity[] {
    if (entityName === 'license') {
      console.warn('License response:', response);
      return response.licenses || [];
    }
    if (entityName === 'catalog') {
      console.log('Catalog response:', response);
      if (Array.isArray(response)) {
        return response;
      }
      return response.catalogs || response.result?.catalogs || [];
    }
    if (!response) return [];

    // Handle direct array responses
    if (Array.isArray(response)) {
      console.log('Direct array response:', response, entityName);
      return response;
    }

    // Handle wrapped responses with result property
    if (response.result) {
      const result = response.result;
      console.log('Wrapped result response:', result, entityName);

      // Handle nested structures in result
      switch (entityName) {
        case 'company':
          return Array.isArray(result.companies) ? result.companies : [];
        case 'farm':
          return Array.isArray(result.farms) ? result.farms : [];
        case 'crop':
          return Array.isArray(result.crops) ? result.crops : [];
        case 'device':
          return Array.isArray(result.devices) ? result.devices : [];
        case 'user':
          return Array.isArray(result.users) ? result.users : [];
        case 'sensor':
          return Array.isArray(result.sensors) ? result.sensors : [];
        case 'waterChemistry':
          return Array.isArray(result.waterChemistries) ? result.waterChemistries : [];
        case 'license':
          console.log('License result response:', result);
          return result.licenses;
        case 'catalog':
          return Array.isArray(result.catalogs) ? result.catalogs : [];
        case 'fertilizer':
          return Array.isArray(result.fertilizers) ? result.fertilizers : [];
        default:
          // Try direct result if it's an array
          console.log('Direct result response:', result, entityName);
          return Array.isArray(result) ? result : [];
      }
    }

    // Handle object responses with nested arrays
    if (response.waterChemistries && entityName === 'waterChemistry') {
      return Array.isArray(response.waterChemistries) ? response.waterChemistries : [];
    }

    if (response.users && entityName === 'user') {
      return Array.isArray(response.users) ? response.users : [];
    }

    if (response.sensors && entityName === 'sensor') {
      return Array.isArray(response.sensors) ? response.sensors : [];
    }

    if (response.catalogs && entityName === 'catalog') {
      return Array.isArray(response.catalogs) ? response.catalogs : [];
    }

    if (response.fertilizers && entityName === 'fertilizer') {
      return Array.isArray(response.fertilizers) ? response.fertilizers : [];
    }

    return [];
  }

  /**
   * Load basic entities first, then load catalogs and fertilizers based on users
   */
  private loadAdminData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load basic entities first (excluding catalogs and fertilizers)
    forkJoin({
      companies: this.companyService.getAll(true).pipe(
        map(data => this.extractResponseData(data, 'company')),
        tap(data => console.log('Companies extracted:', data)),
        catchError(error => {
          console.error('Companies error:', error);
          return of([]);
        })
      ),
      farms: this.farmService.getAll(true).pipe(
        map(data => this.extractResponseData(data, 'farm')),
        tap(data => console.log('Farms extracted:', data)),
        catchError(error => {
          console.error('Farms error:', error);
          return of([]);
        })
      ),
      crops: this.cropService.getAll(true).pipe(
        map(data => this.extractResponseData(data, 'crop')),
        tap(data => console.log('Crops extracted:', data)),
        catchError(error => {
          console.error('Crops error:', error);
          return of([]);
        })
      ),
      devices: this.deviceService.getAll(true).pipe(
        map(data => this.extractResponseData(data, 'device')),
        tap(data => console.log('Devices extracted:', data)),
        catchError(error => {
          console.error('Devices error:', error);
          return of([]);
        })
      ),
      users: this.userService.getAll().pipe(
        map(data => this.extractResponseData(data, 'user')),
        tap(data => console.log('Users extracted:', data)),
        // Here each data.users i has userStatusId in it, this would be mapped to "Admin" or "Client" in html table
        catchError(error => {
          console.error('Users error:', error);
          return of([]);
        })
      ),
      sensors: this.sensorService.getAll({ "onlyActive": true }).pipe(
        map(data => this.extractResponseData(data, 'sensor')),
        tap(data => console.log('Sensors extracted:', data)),
        catchError(error => {
          console.error('Sensors error:', error);
          return of([]);
        })
      ),
      licenses: this.licenseService.getAll({ "onlyActive": true }).pipe(
        map(data => this.extractResponseData(data, 'license')),
        tap(data => console.log('Licenses extracted:', data)),
        catchError(error => {
          console.error('Licenses error:', error);
          return of([]);
        })
      ),
      waterChemistry: this.waterChemistryService.getAll({ "onlyActive": true }).pipe(
        map(data => this.extractResponseData(data, 'waterChemistry')),
        tap(data => console.log('Water Chemistry extracted:', data)),
        catchError(error => {
          console.error('Water Chemistry error:', error);
          return of([]);
        })
      ),
      productionUnits: this.productionUnitService.getAll({ "onlyActive": true }).pipe(
        map(data => this.extractResponseData(data, 'productionUnit')),
        tap(data => console.log('Production Units extracted:', data)),
        catchError(error => {
          console.error('Production Units error:', error);
          return of([]);
        })
      )
    }).pipe(
      // After basic data is loaded, load catalogs and fertilizers based on users
      switchMap((basicData) => {
        this.rawData = basicData;
        this.loadedUsers = basicData.users || [];

        // Get unique client IDs from users
        const clientIds = [...new Set(this.loadedUsers.map(user => user.clientId).filter(id => id))];
        console.log('Found client IDs:', clientIds);

        if (clientIds.length === 0) {
          // No users with client IDs, return empty catalogs and fertilizers
          return of({
            ...basicData,
            catalogs: [],
            fertilizers: []
          });
        }

        // Load catalogs for each client ID
        const catalogRequests =
          this.catalogService.getAll().pipe(
            map(data => this.extractResponseData(data, 'catalog')),
            tap(data => console.log(`Catalogs:`, data)),
            catchError(error => {
              console.error(`Catalogs error :`, error);
              return of([]);
            })
          )

        return forkJoin(catalogRequests).pipe(
          map(catalogArrays => {
            // Flatten all catalogs from all clients
            const allCatalogs = catalogArrays.flat();
            console.log('All catalogs combined:', allCatalogs);
            return allCatalogs;
          }),
          switchMap(allCatalogs => {
            // Store catalogs
            this.availableCatalogs = allCatalogs;
            this.updateFertilizerCatalogOptions();

            // Set default catalog if available
            if (this.availableCatalogs.length > 0) {
              this.selectedCatalogId = this.availableCatalogs[0].id;
            }

            // Get unique catalog IDs for fertilizer loading
            const catalogIds = [...new Set(allCatalogs.map(catalog => catalog.id).filter(id => id))];
            console.log('Found catalog IDs:', catalogIds);

            if (catalogIds.length === 0) {
              return of({
                ...basicData,
                catalogs: allCatalogs,
                fertilizers: []
              });
            }

            // Load fertilizers for each catalog
            const fertilizerRequests = catalogIds.map(catalogId =>
              this.fertilizerService.getFertilizersWithCatalogId(catalogId).pipe(
                map(data => this.extractResponseData(data, 'fertilizer')),
                tap(data => console.log(`Fertilizers for catalog ${catalogId}:`, data)),
                catchError(error => {
                  console.error(`Fertilizers error for catalog ${catalogId}:`, error);
                  return of([]);
                })
              )
            );

            return forkJoin(fertilizerRequests).pipe(
              map(fertilizerArrays => {
                // Flatten all fertilizers from all catalogs
                const allFertilizers = fertilizerArrays.flat();
                console.log('All fertilizers combined:', allFertilizers);

                return {
                  ...basicData,
                  catalogs: allCatalogs,
                  fertilizers: allFertilizers
                };
              })
            );
          })
        );
      })
    ).subscribe({
      next: (data) => {
        console.log('All admin data loaded:', data);
        this.rawData = data;
        this.processAdminStats(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Admin data loading error:', error);
        this.errorMessage = 'Error al cargar los datos del panel de administración. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Update fertilizer catalog field options
   */
  private updateFertilizerCatalogOptions(): void {
    const fertilizerConfig = this.entityConfigs.find(config => config.name === 'fertilizer');
    if (fertilizerConfig) {
      const catalogField = fertilizerConfig.fields.find(field => field.key === 'catalogId');
      if (catalogField) {
        catalogField.options = this.availableCatalogs.map(catalog => ({
          value: catalog.id,
          label: catalog.name || `Catálogo ${catalog.id}`
        }));
      }
    }
  }

  /**
   * Process admin statistics with better data handling
   */
  private processAdminStats(data: any): void {
    this.adminStats = {
      totalCompanies: data.companies?.length || 0,
      totalFarms: data.farms?.length || 0,
      totalCrops: data.crops?.length || 0,
      totalDevices: data.devices?.length || 0,
      totalProductionUnits: data.productionUnits?.length || 0,
      totalUsers: data.users?.length || 0,
      totalSensors: data.sensors?.length || 0,
      totalFertilizers: data.fertilizers?.length || 0,
      totalWaterChemistry: data.waterChemistry?.length || 0,
      totalLicenses: data.licenses?.length || 0,
      totalCatalogs: data.catalogs?.length || 0
    };

    // Update entity stats for header display
    this.entityStats = [
      { icon: 'bi bi-building', count: this.adminStats.totalCompanies, label: 'Compañías' },
      { icon: 'bi bi-house', count: this.adminStats.totalFarms, label: 'Fincas' },
      { icon: 'bi bi-cpu', count: this.adminStats.totalDevices, label: 'Dispositivos' },
      { icon: 'bi bi-flower1', count: this.adminStats.totalCrops, label: 'Cultivos' }
    ];
  }

  // ... (rest of the methods remain the same)

  /**
   * Load entity data from API with service preference and catalog handling
   */
  private loadEntityData(entityName: string) {
    const config = this.entityConfigs.find(c => c.name === entityName);
    if (!config) {
      return of([]);
    }

    let dataSource$;

    switch (entityName) {
      case 'company':
        dataSource$ = this.companyService.getAll(true);
        break;
      case 'farm':
        dataSource$ = this.farmService.getAll(true);
        break;
      case 'crop':
        dataSource$ = this.cropService.getAll(true);
        break;
      case 'device':
        dataSource$ = this.deviceService.getAll(true);
        break;
      case 'user':
        dataSource$ = this.userService.getAll();
        break;
      case 'sensor':
        dataSource$ = this.sensorService.getAll({ "onlyActive": true });
        break;
      case 'waterChemistry':
        dataSource$ = this.waterChemistryService.getAll({ "onlyActive": true });
        break;
      case 'license':
        dataSource$ = this.licenseService.getAll({ "onlyActive": true });
        break;
      case 'catalog':
        // For catalogs, we need to load from all client IDs
        const clientIds = [...new Set(this.loadedUsers.map(user => user.clientId).filter(id => id))];
        if (clientIds.length === 0) {
          return of([]);
        }
        const catalogRequests = clientIds.map(clientId =>
          this.catalogService.getAll(clientId).pipe(
            map(data => this.extractResponseData(data, 'catalog')),
            catchError(() => of([]))
          )
        );
        return forkJoin(catalogRequests).pipe(
          map(catalogArrays => catalogArrays.flat())
        );
      case 'fertilizer':
        // Handle fertilizer with catalog requirement
        if (this.selectedCatalogId) {
          dataSource$ = this.fertilizerService.getFertilizersWithCatalogId(this.selectedCatalogId);
        } else {
          // Load fertilizers from all available catalogs
          const catalogIds = [...new Set(this.availableCatalogs.map(catalog => catalog.id).filter(id => id))];
          if (catalogIds.length === 0) {
            return of([]);
          }
          const fertilizerRequests = catalogIds.map(catalogId =>
            this.fertilizerService.getFertilizersWithCatalogId(catalogId).pipe(
              map(data => this.extractResponseData(data, 'fertilizer')),
              catchError(() => of([]))
            )
          );
          return forkJoin(fertilizerRequests).pipe(
            map(fertilizerArrays => fertilizerArrays.flat())
          );
        }
        break;
      default:
        dataSource$ = this.apiService.get<any[]>(config.endpoint);
    }

    return dataSource$.pipe(
      map(response => this.extractResponseData(response, entityName)),
      catchError(error => {
        console.error(`Error loading ${entityName}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Get cached entity data from rawData
   */
  private getCachedEntityData(entityName: string): Entity[] {
    const mappings: { [key: string]: string } = {
      'company': 'companies',
      'farm': 'farms',
      'crop': 'crops',
      'device': 'devices',
      'user': 'users',
      'sensor': 'sensors',
      'waterChemistry': 'waterChemistry',
      'license': 'licenses',
      'catalog': 'catalogs',
      'fertilizer': 'fertilizers'
    };

    const key = mappings[entityName];
    return key && this.rawData[key] ? this.rawData[key] : [];
  }

  /**
   * Update cached data
   */
  private updateCachedData(entityName: string, data: Entity[]): void {
    const mappings: { [key: string]: string } = {
      'company': 'companies',
      'farm': 'farms',
      'crop': 'crops',
      'device': 'devices',
      'user': 'users',
      'sensor': 'sensors',
      'waterChemistry': 'waterChemistry',
      'license': 'licenses',
      'catalog': 'catalogs',
      'fertilizer': 'fertilizers'
    };

    const key = mappings[entityName];
    if (key) {
      this.rawData[key] = data;
      this.processAdminStats(this.rawData);
    }
  }

  /**
   * Get entities by category for sidebar organization
   */
  getMainEntities(): EntityConfig[] {
    return this.entityConfigs.filter(config => config.category === 'main');
  }

  getConfigEntities(): EntityConfig[] {
    return this.entityConfigs.filter(config => config.category === 'config');
  }

  getAdvancedEntities(): EntityConfig[] {
    return this.entityConfigs.filter(config => config.category === 'advanced');
  }

  /**
   * Get entity count for badge display
   */
  getEntityCount(entityName: string): number {
    const statsMapping: { [key: string]: keyof AdminStats } = {
      'company': 'totalCompanies',
      'farm': 'totalFarms',
      'crop': 'totalCrops',
      'device': 'totalDevices',
      'user': 'totalUsers',
      'sensor': 'totalSensors',
      'waterChemistry': 'totalWaterChemistry',
      'license': 'totalLicenses',
      'catalog': 'totalCatalogs',
      'fertilizer': 'totalFertilizers'
    };

    const statsKey = statsMapping[entityName];
    return statsKey ? this.adminStats[statsKey] : 0;
  }

  /**
   * Select entity and load its data
   */
  selectEntity(entityName: string): void {
    this.selectedEntity = entityName;
    this.loadSelectedEntityData();
  }


  /**
   * Load data for selected entity with improved error handling
   */
  private async loadSelectedEntityData(): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

    this.isLoading = true;
    this.clearMessages();

    try {
      // For fertilizers, check if catalog is selected
      if (config.name === 'fertilizer' && !this.selectedCatalogId && this.availableCatalogs.length > 0) {
        this.errorMessage = 'Por favor, selecciona un catálogo para ver los fertilizantes.';
        this.entityData = [];
        this.filteredData = [];
        this.isLoading = false;
        return;
      }

      // Check if data is already cached from initial load
      const cachedData = this.getCachedEntityData(config.name);
      if (cachedData && cachedData.length > 0 && config.name !== 'fertilizer') {
        // For non-fertilizer entities, use cached data
        this.entityData = cachedData;
        this.filteredData = [...this.entityData];
        this.isLoading = false;
        return;
      }

      // Load fresh data if not cached or if fertilizer with different catalog
      const data = await firstValueFrom(this.loadEntityData(config.name));
      this.entityData = Array.isArray(data) ? data : [];
      this.filteredData = [...this.entityData];

      // Update cache
      this.updateCachedData(config.name, this.entityData);

    } catch (error) {
      console.error(`Error loading ${config.displayName}:`, error);
      this.errorMessage = `Error al cargar ${config.displayName.toLowerCase()}. Por favor, intente nuevamente.`;
      this.entityData = [];
      this.filteredData = [];
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get current entity configuration
   */
  getCurrentEntityConfig(): EntityConfig | undefined {
    return this.entityConfigs.find(config => config.name === this.selectedEntity);
  }

  /**
   * Get display name for an entity item
   */
  getEntityDisplayName(item: Entity): string {
    const config = this.getCurrentEntityConfig();
    if (!config || !config.nameField) return item.name || item.id?.toString() || 'Sin nombre';

    return item[config.nameField] || item.name || item.id?.toString() || 'Sin nombre';
  }

  /**
   * Check if current entity requires catalog selection
   */
  requiresCatalogSelection(): boolean {
    const config = this.getCurrentEntityConfig();
    return config?.requiresCatalog === true;
  }

  /**
   * Apply filters to entity data
   */
  applyFilters(): void {
    let filtered = [...this.entityData];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return Object.values(item).some(value =>
          value?.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (this.filterStatus) {
      if (this.filterStatus === 'active') {
        filtered = filtered.filter(item => this.getBooleanValue(item, 'active') === true);
      } else if (this.filterStatus === 'inactive') {
        filtered = filtered.filter(item => this.getBooleanValue(item, 'active') === false);
      }
    }

    this.filteredData = filtered;
    this.applySorting();
  }

  /**
   * Apply sorting to filtered data
   */
  applySorting(): void {
    if (!this.sortField) return;

    this.filteredData.sort((a: { [x: string]: any; }, b: { [x: string]: any; }) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];

      let comparison = 0;

      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return this.sortDirection === 'desc' ? comparison * -1 : comparison;
    });
  }

  /**
   * Sort by field
   */
  sortByField(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortField = '';
    this.sortDirection = 'asc';
    this.applyFilters();
  }

  /**
   * Refresh data
   */
  refreshData(): void {
    this.loadAdminData();
    // Compañia as default selected entity
    this.selectEntity('company');
  }


  viewItem(item: Entity): void {
    console.log('View item:', item);
  }

  /**
   * Save using specific service
   */
  private async saveWithService(config: EntityConfig): Promise<void> {
    switch (config.name) {
      case 'company':
        if (this.isEditing) {
          await firstValueFrom(this.companyService.update(this.currentItem));
        } else {
          await firstValueFrom(this.companyService.create(this.currentItem));
        }
        break;
      case 'farm':
        if (this.isEditing) {
          await firstValueFrom(this.farmService.update(this.currentItem));
        } else {
          await firstValueFrom(this.farmService.create(this.currentItem));
        }
        break;
      case 'crop':
        if (this.isEditing) {
          await firstValueFrom(this.cropService.update(this.currentItem));
        } else {
          await firstValueFrom(this.cropService.create(this.currentItem));
        }
        break;
      case 'device':
        if (this.isEditing) {
          await firstValueFrom(this.deviceService.update(this.currentItem));
        } else {
          await firstValueFrom(this.deviceService.create(this.currentItem));
        }
        break;
      case 'user':
        if (this.isEditing) {
          // Ensure profileId is set correctly before update
          if (this.currentItem.profileId) {
            this.currentItem.profileId = parseInt(this.currentItem.profileId.toString());
          }
          await firstValueFrom(this.userService.update(this.currentItem));
        } else {
          // Ensure profileId is set correctly before create
          if (this.currentItem.profileId) {
            this.currentItem.profileId = parseInt(this.currentItem.profileId.toString());
          }
          await firstValueFrom(this.userService.create(this.currentItem));
        }
        break;
      case 'sensor':
        if (this.isEditing) {
          await firstValueFrom(this.sensorService.update(this.currentItem));
        } else {
          await firstValueFrom(this.sensorService.create(this.currentItem));
        }
        break;
      case 'waterChemistry':
        if (this.isEditing) {
          await firstValueFrom(this.waterChemistryService.update(this.currentItem));
        } else {
          await firstValueFrom(this.waterChemistryService.create(this.currentItem));
        }
        break;
      case 'license':
        if (this.isEditing) {
          await firstValueFrom(this.licenseService.update(this.currentItem));
        } else {
          await firstValueFrom(this.licenseService.create(this.currentItem));
        }
        break;
      case 'catalog':
        if (this.isEditing) {
          await firstValueFrom(this.catalogService.update(this.currentItem));
        } else {
          await firstValueFrom(this.catalogService.create(this.currentItem));
        }
        break;
      case 'fertilizer':
        if (this.isEditing) {
          console.log('Updating fertilizer:', this.currentItem);
          await firstValueFrom(this.fertilizerService.update(this.currentItem));
        } else {
          await firstValueFrom(this.fertilizerService.create(this.currentItem));
        }
        break;
      default:
        await this.saveWithGenericAPI(config);
    }
  }

  /**
   * Save using generic API
   */
  private async saveWithGenericAPI(config: EntityConfig): Promise<void> {
    const url = this.apiConfig.getAgronomicUrl(config.endpoint);

    if (this.isEditing) {
      await firstValueFrom(this.apiService.put(`${url}/${this.currentItem.id}`, this.currentItem));
    } else {
      await firstValueFrom(this.apiService.post(url, this.currentItem));
    }
  }

  /**
   * Delete item with improved error handling
   */
  async deleteItem(item: Entity): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

    const displayName = this.getEntityDisplayName(item);
    if (!confirm(`¿Estás seguro de que deseas eliminar ${displayName}?`)) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      await this.deleteWithService(config, item.id!);
      this.successMessage = `${config.displayName.slice(0, -1)} eliminado exitosamente.`;
      await this.loadSelectedEntityData();

    } catch (error) {
      console.error('Delete error:', error);
      this.errorMessage = `Error al eliminar ${config.displayName.slice(0, -1).toLowerCase()}.`;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Delete using specific service
   */
  private async deleteWithService(config: EntityConfig, id: number): Promise<void> {
    switch (config.name) {
      case 'company':
        await firstValueFrom(this.companyService.delete(id));
        break;
      case 'farm':
        await firstValueFrom(this.farmService.delete(id));
        break;
      case 'crop':
        await firstValueFrom(this.cropService.delete(id));
        break;
      case 'device':
        await firstValueFrom(this.deviceService.delete(id));
        break;
      case 'user':
        await firstValueFrom(this.userService.delete(id));
        break;
      case 'sensor':
        await firstValueFrom(this.sensorService.delete(id));
        break;
      case 'waterChemistry':
        await firstValueFrom(this.waterChemistryService.delete(id));
        break;
      case 'license':
        await firstValueFrom(this.licenseService.delete(id));
        break;
      case 'catalog':
        await firstValueFrom(this.catalogService.delete(id));
        break;
      case 'fertilizer':
        await firstValueFrom(this.fertilizerService.delete(id));
        break;
      default:
        await this.deleteWithGenericAPI(config, id);
    }
  }

  /**
   * Delete using generic API
   */
  private async deleteWithGenericAPI(config: EntityConfig, id: number): Promise<void> {
    const url = this.apiConfig.getAgronomicUrl(config.endpoint);
    await firstValueFrom(this.apiService.delete(`${url}/${id}`));
  }

  /**
   * Navigation
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Utility methods
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getSelectLabel(field: EntityField, value: any): string {
    if (!field.options || !value) return value || '-';

    const option = field.options.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getFieldColumnClass(field: EntityField): string {
    if (field.type === 'textarea') return 'col-12';
    if (field.type === 'boolean') return 'col-12';
    return 'col-md-6';
  }

  /**
   * Handle different boolean field names (active vs isActive)
   */
  getBooleanValue(item: Entity, fieldKey: string): boolean {
    if (fieldKey === 'active' || fieldKey === 'isActive') {
      return item['active'] !== undefined ? item['active'] : item['isActive'] || false;
    }
    return item[fieldKey];
  }

  setBooleanValue(item: Entity, fieldKey: string, value: boolean): void {
    if (fieldKey === 'active' || fieldKey === 'isActive') {
      item['active'] = value;
      item['isActive'] = value;
    } else {
      item[fieldKey] = value;
    }
  }

  /**
   * Format date values for display
   */
  formatDate(value: any): string {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    } catch {
      return value.toString();
    }
  }

  /**
   * Format datetime values for display
   */
  formatDateTime(value: any): string {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleString('es-ES');
    } catch {
      return value.toString();
    }
  }

  /**
   * TrackBy functions for performance
   */
  trackByIndex(index: number): number {
    return index;
  }

  trackByEntityConfig(index: number, config: EntityConfig): string {
    return config.name;
  }

  trackByField(index: number, field: EntityField): string {
    return field.key;
  }

  trackByItem(index: number, item: Entity): number {
    return item.id || index;
  }

  trackByOption(index: number, option: { value: any; label: string }): any {
    return option.value;
  }


  /**
   * Update the fertilizer configuration
   */
  private updateFertilizerConfig(): void {
    const fertilizerIndex = this.entityConfigs.findIndex(config => config.name === 'fertilizer');
    if (fertilizerIndex !== -1) {
      this.entityConfigs[fertilizerIndex] = {
        name: 'fertilizer',
        endpoint: '/Fertilizer',
        displayName: 'Fertilizantes',
        icon: 'bi bi-droplet-fill',
        category: 'advanced',
        useService: true,
        nameField: 'name',
        requiresCatalog: true,
        fields: [
          // Basic Information
          { key: 'catalogId', label: 'Catálogo', type: 'select', required: true, options: [] },
          { key: 'name', label: 'Nombre', type: 'text', required: true },
          { key: 'manufacturer', label: 'Fabricante', type: 'text' },
          { key: 'brand', label: 'Marca', type: 'text' },
          { key: 'description', label: 'Descripción', type: 'textarea' },

          // Product Classification
          {
            key: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            options: [
              { value: 'Organic', label: 'Orgánico' },
              { value: 'Inorganic', label: 'Inorgánico' },
              { value: 'Liquid', label: 'Líquido' },
              { value: 'Solid', label: 'Sólido' },
              { value: 'Foliar', label: 'Foliar' },
              { value: 'Granulated', label: 'Granulado' },
              { value: 'Powder', label: 'Polvo' }
            ]
          },
          { key: 'formulation', label: 'Formulación', type: 'text' },
          { key: 'isLiquid', label: 'Es Líquido', type: 'boolean' },

          // Concentration and Application
          { key: 'concentration', label: 'Concentración', type: 'number' },
          {
            key: 'concentrationUnit',
            label: 'Unidad de Concentración',
            type: 'select',
            options: [
              { value: '%', label: 'Porcentaje (%)' },
              { value: 'g/L', label: 'Gramos por Litro (g/L)' },
              { value: 'mg/L', label: 'Miligramos por Litro (mg/L)' },
              { value: 'ppm', label: 'Partes por Millón (ppm)' },
              { value: 'kg/ha', label: 'Kilogramos por Hectárea (kg/ha)' }
            ]
          },
          {
            key: 'applicationMethod',
            label: 'Método de Aplicación',
            type: 'select',
            options: [
              { value: 'Riego', label: 'Riego' },
              { value: 'Foliar', label: 'Foliar' },
              { value: 'Suelo', label: 'Suelo' },
              { value: 'Fertirrigacion', label: 'Fertirrigación' },
              { value: 'Incorporacion', label: 'Incorporación' },
              { value: 'Aspersion', label: 'Aspersión' }
            ]
          },

          // NPK Analysis
          { key: 'nitrogenPercentage', label: 'Nitrógeno (%)', type: 'number' },
          { key: 'phosphorusPercentage', label: 'Fósforo (%)', type: 'number' },
          { key: 'potassiumPercentage', label: 'Potasio (%)', type: 'number' },
          { key: 'micronutrients', label: 'Micronutrientes', type: 'textarea' },

          // Stock Management
          { key: 'currentStock', label: 'Stock Actual', type: 'number' },
          { key: 'minimumStock', label: 'Stock Mínimo', type: 'number' },
          {
            key: 'stockUnit',
            label: 'Unidad de Stock',
            type: 'select',
            options: [
              { value: 'kg', label: 'Kilogramos (kg)' },
              { value: 'L', label: 'Litros (L)' },
              { value: 'ton', label: 'Toneladas (ton)' },
              { value: 'sack', label: 'Sacos' },
              { value: 'bottle', label: 'Botellas' },
              { value: 'gallon', label: 'Galones' }
            ]
          },
          { key: 'pricePerUnit', label: 'Precio por Unidad', type: 'number' },
          { key: 'supplier', label: 'Proveedor', type: 'text' },

          // Storage and Handling
          { key: 'expirationDate', label: 'Fecha de Vencimiento', type: 'date' },
          { key: 'storageInstructions', label: 'Instrucciones de Almacenamiento', type: 'textarea' },
          { key: 'applicationInstructions', label: 'Instrucciones de Aplicación', type: 'textarea' },

          // Chemical Analysis - Major Elements
          { key: 'ca', label: 'Calcio (Ca) ppm', type: 'number' },
          { key: 'k', label: 'Potasio (K) ppm', type: 'number' },
          { key: 'mg', label: 'Magnesio (Mg) ppm', type: 'number' },
          { key: 'na', label: 'Sodio (Na) ppm', type: 'number' },
          { key: 'nh4', label: 'Amonio (NH4) ppm', type: 'number' },
          { key: 'n', label: 'Nitrógeno Total (N) ppm', type: 'number' },
          { key: 'so4', label: 'Sulfato (SO4) ppm', type: 'number' },
          { key: 's', label: 'Azufre (S) ppm', type: 'number' },
          { key: 'cl', label: 'Cloro (Cl) ppm', type: 'number' },
          { key: 'h2po4', label: 'Fosfato (H2PO4) ppm', type: 'number' },
          { key: 'p', label: 'Fósforo Total (P) ppm', type: 'number' },
          { key: 'hco3', label: 'Bicarbonato (HCO3) ppm', type: 'number' },

          // Micronutrients Analysis
          { key: 'fe', label: 'Hierro (Fe) ppm', type: 'number' },
          { key: 'mn', label: 'Manganeso (Mn) ppm', type: 'number' },
          { key: 'zn', label: 'Zinc (Zn) ppm', type: 'number' },
          { key: 'cu', label: 'Cobre (Cu) ppm', type: 'number' },
          { key: 'b', label: 'Boro (B) ppm', type: 'number' },
          { key: 'mo', label: 'Molibdeno (Mo) ppm', type: 'number' },

          // Solution Properties
          { key: 'tds', label: 'Sólidos Disueltos Totales (TDS)', type: 'number' },
          { key: 'ec', label: 'Conductividad Eléctrica (EC)', type: 'number' },
          { key: 'ph', label: 'pH', type: 'number' },

          // Status
          { key: 'active', label: 'Activo', type: 'boolean' }
        ]
      };
    }
  }

  /**
   * Initialize fertilizer form with proper defaults
   */
  private initializeFertilizerForm(): void {
    if (this.selectedEntity === 'fertilizer') {
      this.currentItem = {
        catalogId: this.selectedCatalogId ?? undefined,
        name: '',
        manufacturer: '',
        brand: '',
        description: '',
        type: '',
        formulation: '',
        concentration: null,
        concentrationUnit: '',
        applicationMethod: '',
        nitrogenPercentage: null,
        phosphorusPercentage: null,
        potassiumPercentage: null,
        micronutrients: '',
        currentStock: null,
        minimumStock: null,
        stockUnit: '',
        pricePerUnit: null,
        supplier: '',
        expirationDate: null,
        storageInstructions: '',
        applicationInstructions: '',
        isLiquid: false,
        active: true,
        // Chemical analysis defaults
        ca: null, k: null, mg: null, na: null, nh4: null, n: null,
        so4: null, s: null, cl: null, h2po4: null, p: null, hco3: null,
        fe: null, mn: null, zn: null, cu: null, b: null, mo: null,
        tds: null, ec: null, ph: null
      };
    }
  }

  /**
   * Enhanced openCreateModal for fertilizers
   */
  openCreateModal(): void {
    if (this.selectedEntity === 'fertilizer') {
      this.initializeFertilizerForm();
    } else if (this.selectedEntity === 'user') {
      this.initializeUserForm();
    } else {
      this.currentItem = {};
    }

    this.isEditing = false;
    this.showModal = true;
    this.clearMessages();

    // Initialize Bootstrap tabs after modal opens
    if (this.selectedEntity === 'fertilizer') {
      setTimeout(() => this.initializeTabs(), 100);
    }
  }

  /**
   * Enhanced editItem for fertilizers
   */
  editItem(item: Entity): void {
    this.currentItem = { ...item };

    // Ensure all fertilizer fields are properly initialized
    if (this.selectedEntity === 'fertilizer') {
      this.ensureFertilizerFieldsComplete(this.currentItem);
    }

    this.isEditing = true;
    this.showModal = true;
    this.clearMessages();

    // Initialize Bootstrap tabs after modal opens
    if (this.selectedEntity === 'fertilizer') {
      setTimeout(() => this.initializeTabs(), 100);
    }
  }

  /**
   * Ensure all fertilizer fields are present in the item
   */
  private ensureFertilizerFieldsComplete(item: Entity): void {
    const defaultFields = {
      catalogId: null, name: '', manufacturer: '', brand: '', description: '',
      type: '', formulation: '', concentration: null, concentrationUnit: '',
      applicationMethod: '', nitrogenPercentage: null, phosphorusPercentage: null,
      potassiumPercentage: null, micronutrients: '', currentStock: null,
      minimumStock: null, stockUnit: '', pricePerUnit: null, supplier: '',
      expirationDate: null, storageInstructions: '', applicationInstructions: '',
      isLiquid: false, active: true,
      ca: null, k: null, mg: null, na: null, nh4: null, n: null,
      so4: null, s: null, cl: null, h2po4: null, p: null, hco3: null,
      fe: null, mn: null, zn: null, cu: null, b: null, mo: null,
      tds: null, ec: null, ph: null
    };

    Object.keys(defaultFields).forEach(key => {
      if (!(key in item)) {
        item[key] = defaultFields[key as keyof typeof defaultFields];
      }
    });
  }

  /**
   * Initialize Bootstrap tabs
   */
  private initializeTabs(): void {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab(button as HTMLElement);
      });
    });
  }

  /**
   * Manual tab switching
   */
  private switchTab(clickedTab: HTMLElement): void {
    const targetId = clickedTab.getAttribute('data-bs-target')?.substring(1);

    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('show', 'active');
    });

    // Add active class to clicked tab
    clickedTab.classList.add('active');

    // Show target content
    const targetPane = document.getElementById(targetId || '');
    if (targetPane) {
      targetPane.classList.add('show', 'active');
    }
  }

  /**
   * Validate fertilizer form data
   */
  private validateFertilizerForm(): string[] {
    const errors: string[] = [];

    if (!this.currentItem.catalogId) {
      errors.push('Debe seleccionar un catálogo');
    }

    if (!this.currentItem.name?.trim()) {
      errors.push('El nombre es requerido');
    }

    if (!this.currentItem.type?.trim()) {
      errors.push('El tipo de fertilizante es requerido');
    }

    // Validate NPK percentages if provided
    if (this.currentItem.nitrogenPercentage &&
      (this.currentItem.nitrogenPercentage < 0 || this.currentItem.nitrogenPercentage > 100)) {
      errors.push('El porcentaje de nitrógeno debe estar entre 0 y 100');
    }

    if (this.currentItem.phosphorusPercentage &&
      (this.currentItem.phosphorusPercentage < 0 || this.currentItem.phosphorusPercentage > 100)) {
      errors.push('El porcentaje de fósforo debe estar entre 0 y 100');
    }

    if (this.currentItem.potassiumPercentage &&
      (this.currentItem.potassiumPercentage < 0 || this.currentItem.potassiumPercentage > 100)) {
      errors.push('El porcentaje de potasio debe estar entre 0 y 100');
    }

    // Validate stock values
    if (this.currentItem.currentStock && this.currentItem.currentStock < 0) {
      errors.push('El stock actual no puede ser negativo');
    }

    if (this.currentItem.minimumStock && this.currentItem.minimumStock < 0) {
      errors.push('El stock mínimo no puede ser negativo');
    }

    if (this.currentItem.pricePerUnit && this.currentItem.pricePerUnit < 0) {
      errors.push('El precio por unidad no puede ser negativo');
    }

    // Validate pH range
    if (this.currentItem.ph && (this.currentItem.ph < 0 || this.currentItem.ph > 14)) {
      errors.push('El pH debe estar entre 0 y 14');
    }

    return errors;
  }

  /**
   * Enhanced saveItem with fertilizer-specific validation
   */
  async saveItem(): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

    // Validate fertilizer-specific fields
    if (this.selectedEntity === 'fertilizer') {
      const validationErrors = this.validateFertilizerForm();
      if (validationErrors.length > 0) {
        this.errorMessage = validationErrors.join('; ');
        return;
      }

      // Clean up null values and convert strings to numbers where appropriate
      this.prepareFertilizerDataForSave();
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      await this.saveWithService(config);
      this.successMessage = `${config.displayName.slice(0, -1)} ${this.isEditing ? 'actualizado' : 'creado'} exitosamente.`;
      this.closeModal();
      await this.loadSelectedEntityData();

    } catch (error) {
      console.error('Save error:', error);
      this.errorMessage = `Error al ${this.isEditing ? 'actualizar' : 'crear'} ${config.displayName.slice(0, -1).toLowerCase()}.`;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Prepare fertilizer data for saving
   */
  private prepareFertilizerDataForSave(): void {
    // Convert empty strings to null for numeric fields
    const numericFields = [
      'concentration', 'nitrogenPercentage', 'phosphorusPercentage', 'potassiumPercentage',
      'currentStock', 'minimumStock', 'pricePerUnit',
      'ca', 'k', 'mg', 'na', 'nh4', 'n', 'so4', 's', 'cl', 'h2po4', 'p', 'hco3',
      'fe', 'mn', 'zn', 'cu', 'b', 'mo', 'tds', 'ec', 'ph'
    ];

    numericFields.forEach(field => {
      if (this.currentItem[field] === '' || this.currentItem[field] === undefined) {
        this.currentItem[field] = null;
      } else if (this.currentItem[field] !== null) {
        // Ensure it's a number
        const value = parseFloat(this.currentItem[field]);
        this.currentItem[field] = isNaN(value) ? null : value;
      }
    });

    // Convert empty strings to null for string fields that can be null
    const optionalStringFields = [
      'manufacturer', 'brand', 'description', 'formulation', 'concentrationUnit',
      'applicationMethod', 'micronutrients', 'stockUnit', 'supplier',
      'storageInstructions', 'applicationInstructions'
    ];

    optionalStringFields.forEach(field => {
      if (this.currentItem[field] === '') {
        this.currentItem[field] = null;
      }
    });

    // Ensure date fields are properly formatted
    if (this.currentItem.expirationDate) {
      this.currentItem.expirationDate = new Date(this.currentItem.expirationDate).toISOString();
    }
  }

  /**
   * Get fertilizer status based on stock and expiration
   */
  getFertilizerStatus(item: any): string {
    if (!item.active) return 'inactive';

    // Check expiration
    if (item.expirationDate) {
      const expirationDate = new Date(item.expirationDate);
      const today = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration < 0) return 'expired';
      if (daysUntilExpiration <= 30) return 'expiring-soon';
    }

    // Check stock levels
    if (item.currentStock !== null && item.minimumStock !== null) {
      if (item.currentStock <= item.minimumStock) return 'low-stock';
    }

    return 'good';
  }

  /**
   * Get fertilizer status label
   */
  getFertilizerStatusLabel(status: string): string {
    const labels = {
      'good': 'En buen estado',
      'low-stock': 'Stock bajo',
      'expiring-soon': 'Próximo a vencer',
      'expired': 'Vencido',
      'inactive': 'Inactivo'
    };
    return labels[status as keyof typeof labels] || status;
  }

  /**
   * Get fertilizer status class for styling
   */
  getFertilizerStatusClass(status: string): string {
    const classes = {
      'good': 'fertilizer-status-good',
      'low-stock': 'fertilizer-status-low-stock',
      'expiring-soon': 'fertilizer-status-low-stock',
      'expired': 'fertilizer-status-expired',
      'inactive': 'fertilizer-status-expired'
    };
    return classes[status as keyof typeof classes] || '';
  }

  /**
   * Calculate NPK ratio for display
   */
  calculateNPKRatio(item: any): string {
    const n = item.nitrogenPercentage || 0;
    const p = item.phosphorusPercentage || 0;
    const k = item.potassiumPercentage || 0;

    if (n === 0 && p === 0 && k === 0) return '-';

    return `${n}-${p}-${k}`;
  }

  /**
   * Get display value for fertilizer table cells
   */
  getFertilizerDisplayValue(item: any, field: string): string {
    switch (field) {
      case 'npkRatio':
        return this.calculateNPKRatio(item);
      case 'status':
        const status = this.getFertilizerStatus(item);
        return this.getFertilizerStatusLabel(status);
      case 'currentStock':
        if (item.currentStock === null) return '-';
        return `${item.currentStock} ${item.stockUnit || ''}`.trim();
      case 'expirationDate':
        return item.expirationDate ? this.formatDate(item.expirationDate) : '-';
      case 'pricePerUnit':
        return item.pricePerUnit ? `$${item.pricePerUnit.toFixed(2)}` : '-';
      default:
        return item[field] || '-';
    }
  }

  /**
   * Enhanced catalog change handler
   */
  onCatalogChange(): void {
    if (this.selectedEntity === 'fertilizer') {
      this.loadSelectedEntityData();

      // Update current item's catalogId if creating new fertilizer
      if (this.showModal && !this.isEditing) {
        this.currentItem.catalogId = this.selectedCatalogId;
      }
    }
  }

  /**
   * Export fertilizer data to CSV
   */
  exportFertilizerData(): void {
    if (this.selectedEntity !== 'fertilizer' || this.filteredData.length === 0) {
      this.errorMessage = 'No hay datos de fertilizantes para exportar';
      return;
    }

    const headers = [
      'Nombre', 'Marca', 'Tipo', 'Formulación', 'NPK', 'Stock Actual',
      'Stock Mínimo', 'Precio', 'Proveedor', 'Fecha Vencimiento', 'Estado'
    ];

    const csvData = this.filteredData.map((item: { name: any; brand: any; type: any; formulation: any; minimumStock: any; stockUnit: any; supplier: any; }) => [
      item.name || '',
      item.brand || '',
      item.type || '',
      item.formulation || '',
      this.calculateNPKRatio(item),
      this.getFertilizerDisplayValue(item, 'currentStock'),
      item.minimumStock ? `${item.minimumStock} ${item.stockUnit || ''}`.trim() : '',
      this.getFertilizerDisplayValue(item, 'pricePerUnit'),
      item.supplier || '',
      this.getFertilizerDisplayValue(item, 'expirationDate'),
      this.getFertilizerStatusLabel(this.getFertilizerStatus(item))
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map((field: any) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fertilizantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Filter fertilizers by status
   */
  filterFertilizersByStatus(status: string): void {
    if (this.selectedEntity !== 'fertilizer') return;

    if (status === 'all') {
      this.filteredData = [...this.entityData];
    } else {
      this.filteredData = this.entityData.filter((item: any) =>
        this.getFertilizerStatus(item) === status
      );
    }
  }

  /**
   * Get fertilizer alerts (low stock, expiring, etc.)
   */
  getFertilizerAlerts(): { type: string; message: string; count: number }[] {
    if (this.selectedEntity !== 'fertilizer') return [];

    const alerts = [];

    // Count low stock items
    const lowStockItems = this.entityData.filter((item: any) =>
      this.getFertilizerStatus(item) === 'low-stock'
    );
    if (lowStockItems.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${lowStockItems.length} fertilizante(s) con stock bajo`,
        count: lowStockItems.length
      });
    }

    // Count expiring items
    const expiringItems = this.entityData.filter((item: any) =>
      this.getFertilizerStatus(item) === 'expiring-soon'
    );
    if (expiringItems.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${expiringItems.length} fertilizante(s) próximo(s) a vencer`,
        count: expiringItems.length
      });
    }

    // Count expired items
    const expiredItems = this.entityData.filter((item: any) =>
      this.getFertilizerStatus(item) === 'expired'
    );
    if (expiredItems.length > 0) {
      alerts.push({
        type: 'danger',
        message: `${expiredItems.length} fertilizante(s) vencido(s)`,
        count: expiredItems.length
      });
    }

    return alerts;
  }

  getSelectedCatalogName(): string {
    const catalog = this.availableCatalogs?.find(c => c.id === this.selectedCatalogId);
    return catalog?.name || 'Sin seleccionar';
  }

  /**
   * View fertilizer details in modal
   */
  viewFertilizerDetails(item: Entity): void {
    this.selectedFertilizer = { ...item };
    this.showDetailsModal = true;
  }

  /**
   * Close fertilizer details modal
   */
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedFertilizer = null;
  }

  /**
   * Edit fertilizer from details modal
   */
  editFertilizerFromDetails(): void {
    if (this.selectedFertilizer) {
      this.closeDetailsModal();
      this.editItem(this.selectedFertilizer);
    }
  }

  /**
   * Enhanced closeModal with tab reset
   */
  closeModal(): void {
    this.showModal = false;
    this.currentItem = {};
    this.isEditing = false;
    this.clearMessages();

    // Reset tabs to first tab for next time
    if (this.selectedEntity === 'fertilizer') {
      setTimeout(() => {
        const firstTab = document.querySelector('.fertilizer-tabs .nav-link');
        if (firstTab) {
          this.switchTab(firstTab as HTMLElement);
        }
      }, 100);
    }
  }

  /**
   * Get user role label from profileId
   */
  getUserRoleLabel(profileId: number): string {
    const roleMap: { [key: number]: string } = {
      1: 'Admin',
      2: 'Client'
    };
    return roleMap[profileId] || 'Desconocido';
  }

  /**
 * Initialize user form with proper defaults
 */
  private initializeUserForm(): void {
    this.currentItem = {
      userEmail: '',
      profileId: 2, // Default to Client
      active: true
    };
  }
}