// src/app/core/models/company.model.ts
export interface Company {
  id: number;
  name: string;
  description?: string | undefined;
  address?: string | undefined;
  phoneNumber?: string | undefined;
  email?: string | undefined;
  website?: string | undefined;
  taxId?: string | undefined;
  logo?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/farm.model.ts
export interface Farm {
  id: number;
  name: string;
  description?: string | undefined;
  companyId: number;
  company?: Company;
  location?: string | undefined;
  address?: string | undefined;
  area?: number; // hectares
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  climate?: string | undefined;
  soilType?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/crop.model.ts
export interface Crop {
  id: number;
  name: string;
  scientificName?: string | undefined;
  description?: string | undefined;
  type?: string | undefined; // 'Vegetal', 'Fruta', 'Cereal', 'Hierba', 'Otro'
  variety?: string | undefined;
  growthCycleDays?: number;
  harvestSeason?: string | undefined;
  waterRequirement?: string | undefined; // 'Bajo', 'Medio', 'Alto'
  optimalTemperatureMin?: number;
  optimalTemperatureMax?: number;
  nitrogenRequirement?: number;
  phosphorusRequirement?: number;
  potassiumRequirement?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/device.model.ts
export interface Device {
  id: number;
  name: string;
  description?: string | undefined;
  deviceType: string | undefined; // 'Sensor', 'Actuador', 'Controlador', 'Gateway', 'Camara', 'Estacion Meteorologica'
  serialNumber?: string | undefined;
  model?: string | undefined;
  manufacturer?: string | undefined;
  firmwareVersion?: string | undefined;
  macAddress?: string | undefined;
  ipAddress?: string | undefined;
  batteryLevel?: number;
  signalStrength?: number;
  status: string | undefined; // 'Online', 'Offline', 'Maintenance', 'Error'
  lastSeen?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/production-unit.model.ts
export interface ProductionUnitType {
  id: number;
  name: string | undefined;
  description?: string | undefined;
}

export interface ProductionUnit {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  farmId: number;
  farm?: Farm;
  productionUnitTypeId: number;
  productionUnitType?: ProductionUnitType;
  area?: number; // square meters
  capacity?: number;
  location?: string | undefined;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/crop-production.model.ts
export interface CropProduction {
  containerId: any;
  dropperId: any;
  growingMediumId: any;
  numberOfDroppersPerContainer: number;
  area(containerId: any, dropperId: any, numberOfDroppersPerContainer: any, area: any): unknown;
  id: number;
  code?: string | undefined;
  cropId: number;
  crop?: Crop;
  productionUnitId: number;
  productionUnit?: ProductionUnit;
  plantingDate: Date;
  estimatedHarvestDate?: Date;
  actualHarvestDate?: Date;
  status: string | undefined; // 'Preparacion', 'Siembra', 'Crecimiento', 'Floracion', 'Fructificacion', 'Cosecha', 'Finalizada'
  progress?: number; // percentage 0-100
  plantedArea?: number;
  expectedYield?: number;
  actualYield?: number;
  description?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/irrigation-sector.model.ts
export interface IrrigationSector {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  cropProductionId: number;
  cropProduction?: CropProduction;
  irrigationStatus: string | undefined; // 'running', 'scheduled', 'stopped', 'maintenance', 'error'
  isIrrigating: boolean;
  hasError: boolean;
  currentTemperature?: number;
  currentHumidity?: number;
  waterFlow?: number;
  irrigationProgress?: number;
  remainingTime?: number;
  nextIrrigationTime?: Date;
  lastIrrigationTime?: Date;
  scheduleEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface FertilizerComposition {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  micronutrients?: string | undefined;
}

// src/app/core/models/fertilizer.model.ts
export interface Fertilizer {
  id: number;
  optimizationScore?: number;
  name: string | undefined;
  brand?: string | undefined;
  description?: string | undefined;
  type: string | undefined; // 'Organico', 'Inorganico', 'Liquido', 'Solido', 'Foliar'
  formulation?: string | undefined;
  concentration?: number;
  concentrationUnit?: string | undefined;
  applicationMethod?: string | undefined; // 'Riego', 'Foliar', 'Suelo', 'Fertirrigacion'
  nitrogenPercentage?: number;
  phosphorusPercentage?: number;
  potassiumPercentage?: number;
  micronutrients?: string | undefined;
  currentStock?: number;
  minimumStock?: number;
  stockUnit?: string | undefined;
  pricePerUnit?: number;
  supplier?: string | undefined;
  expirationDate?: Date;
  storageInstructions?: string | undefined;
  applicationInstructions?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  composition?: FertilizerComposition[];
}

// src/app/core/models/fertilizer-input.model.ts
export interface FertilizerInput {
  id: number;
  cropProductionId: number;
  cropProduction?: CropProduction;
  fertilizerId: number;
  fertilizer?: Fertilizer;
  applicationDate: Date;
  quantity: number;
  quantityUnit?: string | undefined;
  concentration?: number;
  concentrationUnit?: string | undefined;
  applicationMethod: string | undefined; // 'Riego', 'Foliar', 'Suelo', 'Fertirrigacion'
  appliedById: number;
  appliedBy?: User;
  verifiedById?: number;
  verifiedBy?: User;
  status: string | undefined; // 'planned', 'applied', 'verified', 'cancelled'
  notes?: string | undefined;
  weatherConditions?: string | undefined;
  soilConditions?: string | undefined;
  cost?: number;
  createdAt: Date;
  updatedAt?: Date;
}

// src/app/core/models/user.model.ts
export interface Profile {
  id: number;
  name: string | undefined;
  description?: string | undefined;
  permissions?: string | undefined[];
}

export interface UserStatus {
  id: number;
  name: string | undefined;
  description?: string | undefined;
}

export interface UserFarm {
  id: number;
  userId: number;
  farmId: number;
  farm?: Farm;
  role?: string | undefined;
  permissions?: string | undefined[];
  createdAt: Date;
}

export interface UserPreferences {
  language: string | undefined;
  timezone: string | undefined;
  dateFormat: string | undefined;
  theme: string | undefined;
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertsEnabled: boolean;
  weeklyReports: boolean;
}

export interface User {
  id: number;
  username: string | undefined;
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  name: string | undefined; // computed: firstName + lastName
  phoneNumber?: string | undefined;
  position?: string | undefined;
  department?: string | undefined;
  bio?: string | undefined;
  profilePicture?: string | undefined;
  profileId?: number;
  profile?: Profile;
  userStatusId?: number;
  userStatus?: UserStatus;
  userFarms?: UserFarm[];
  preferences?: UserPreferences;
  lastLoginDate?: Date;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}