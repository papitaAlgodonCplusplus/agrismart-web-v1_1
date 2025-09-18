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
  deviceId?: number; // For devices
  sensorLabel?: string; // For sensors
  userEmail?: string; // For users
  clientId?: number; // For users/licenses
  catalogId?: number; // For fertilizers
  active?: boolean; // Common boolean field
  isActive?: boolean; // Alternative boolean field
  [key: string]: any;
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

  // State management
  selectedEntity: string = '';
  entityData: Entity[] = [];
  filteredData: Entity[] = [];
  currentItem: Entity = {};
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
        { key: 'address', label: 'Dirección', type: 'text' },
        { key: 'phoneNumber', label: 'Teléfono', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'website', label: 'Sitio Web', type: 'text' },
        { key: 'taxId', label: 'ID Fiscal', type: 'text' },
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
        { key: 'companyId', label: 'ID Compañía', type: 'number', required: true },
        { key: 'timeZoneId', label: 'ID Zona Horaria', type: 'number' },
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
        { key: 'companyId', label: 'ID Compañía', type: 'number', required: true },
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
        { key: 'clientId', label: 'ID Cliente', type: 'number', required: true },
        { key: 'profileId', label: 'ID Perfil', type: 'number', required: true },
        { key: 'userStatusId', label: 'ID Estado Usuario', type: 'number' },
        { key: 'active', label: 'Activo', type: 'boolean' }
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
      companies: this.companyService.getAll().pipe(
        map(data => this.extractResponseData(data, 'company')),
        tap(data => console.log('Companies extracted:', data)),
        catchError(error => {
          console.error('Companies error:', error);
          return of([]);
        })
      ),
      farms: this.farmService.getAll().pipe(
        map(data => this.extractResponseData(data, 'farm')),
        tap(data => console.log('Farms extracted:', data)),
        catchError(error => {
          console.error('Farms error:', error);
          return of([]);
        })
      ),
      crops: this.cropService.getAll().pipe(
        map(data => this.extractResponseData(data, 'crop')),
        tap(data => console.log('Crops extracted:', data)),
        catchError(error => {
          console.error('Crops error:', error);
          return of([]);
        })
      ),
      devices: this.deviceService.getAll().pipe(
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
        catchError(error => {
          console.error('Users error:', error);
          return of([]);
        })
      ),
      sensors: this.sensorService.getAll().pipe(
        map(data => this.extractResponseData(data, 'sensor')),
        tap(data => console.log('Sensors extracted:', data)),
        catchError(error => {
          console.error('Sensors error:', error);
          return of([]);
        })
      ),
      licenses: this.licenseService.getAll().pipe(
        map(data => this.extractResponseData(data, 'license')),
        tap(data => console.log('Licenses extracted:', data)),
        catchError(error => {
          console.error('Licenses error:', error);
          return of([]);
        })
      ),
      waterChemistry: this.waterChemistryService.getAll().pipe(
        map(data => this.extractResponseData(data, 'waterChemistry')),
        tap(data => console.log('Water Chemistry extracted:', data)),
        catchError(error => {
          console.error('Water Chemistry error:', error);
          return of([]);
        })
      ),
      productionUnits: this.productionUnitService.getAll().pipe(
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
        const catalogRequests = clientIds.map(clientId => 
          this.catalogService.getAll(clientId).pipe(
            map(data => this.extractResponseData(data, 'catalog')),
            tap(data => console.log(`Catalogs for client ${clientId}:`, data)),
            catchError(error => {
              console.error(`Catalogs error for client ${clientId}:`, error);
              return of([]);
            })
          )
        );

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
   * Load fertilizers data with catalog handling
   */
  private loadFertilizersData() {
    if (this.selectedCatalogId) {
      return this.fertilizerService.getFertilizersWithCatalogId(this.selectedCatalogId).pipe(
        map(data => this.extractResponseData(data, 'fertilizer')),
        tap(data => console.log('Fertilizers extracted:', data))
      );
    } else {
      return this.fertilizerService.getAll().pipe(
        map(data => this.extractResponseData(data, 'fertilizer')),
        tap(data => console.log('Fertilizers extracted:', data))
      );
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
        dataSource$ = this.companyService.getAll();
        break;
      case 'farm':
        dataSource$ = this.farmService.getAll();
        break;
      case 'crop':
        dataSource$ = this.cropService.getAll();
        break;
      case 'device':
        dataSource$ = this.deviceService.getAll();
        break;
      case 'user':
        dataSource$ = this.userService.getAll();
        break;
      case 'sensor':
        dataSource$ = this.sensorService.getAll();
        break;
      case 'waterChemistry':
        dataSource$ = this.waterChemistryService.getAll();
        break;
      case 'license':
        dataSource$ = this.licenseService.getAll();
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
   * Change catalog for fertilizer data
   */
  onCatalogChange(): void {
    if (this.selectedEntity === 'fertilizer') {
      this.loadSelectedEntityData();
    }
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

    this.filteredData.sort((a, b) => {
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
    if (this.selectedEntity) {
      this.loadSelectedEntityData();
    } else {
      this.loadAdminData();
    }
  }

  /**
   * Modal operations
   */
  openCreateModal(): void {
    this.currentItem = {};
    
    // For fertilizers, set default catalogId
    if (this.selectedEntity === 'fertilizer' && this.selectedCatalogId) {
      this.currentItem.catalogId = this.selectedCatalogId;
    }
    
    this.isEditing = false;
    this.showModal = true;
    this.clearMessages();
  }

  editItem(item: Entity): void {
    this.currentItem = { ...item };
    this.isEditing = true;
    this.showModal = true;
    this.clearMessages();
  }

  viewItem(item: Entity): void {
    console.log('View item:', item);
  }

  closeModal(): void {
    this.showModal = false;
    this.currentItem = {};
    this.isEditing = false;
    this.clearMessages();
  }

  /**
   * Save item (create or update) with improved error handling
   */
  async saveItem(): Promise<void> {
    const config = this.getCurrentEntityConfig();
    if (!config) return;

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
   * Save using specific service
   */
  private async saveWithService(config: EntityConfig): Promise<void> {
    switch (config.name) {
      case 'company':
        if (this.isEditing) {
          await firstValueFrom(this.companyService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.companyService.create(this.currentItem));
        }
        break;
      case 'farm':
        if (this.isEditing) {
          await firstValueFrom(this.farmService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.farmService.create(this.currentItem));
        }
        break;
      case 'crop':
        if (this.isEditing) {
          await firstValueFrom(this.cropService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.cropService.create(this.currentItem));
        }
        break;
      case 'device':
        if (this.isEditing) {
          await firstValueFrom(this.deviceService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.deviceService.create(this.currentItem));
        }
        break;
      case 'user':
        if (this.isEditing) {
          await firstValueFrom(this.userService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.userService.create(this.currentItem));
        }
        break;
      case 'sensor':
        if (this.isEditing) {
          await firstValueFrom(this.sensorService.update(this.currentItem.id!, this.currentItem));
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
          await firstValueFrom(this.licenseService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.licenseService.create(this.currentItem));
        }
        break;
      case 'catalog':
        if (this.isEditing) {
          await firstValueFrom(this.catalogService.update(this.currentItem.id!, this.currentItem));
        } else {
          await firstValueFrom(this.catalogService.create(this.currentItem));
        }
        break;
      case 'fertilizer':
        if (this.isEditing) {
          await firstValueFrom(this.fertilizerService.update(this.currentItem.id!, this.currentItem));
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
}