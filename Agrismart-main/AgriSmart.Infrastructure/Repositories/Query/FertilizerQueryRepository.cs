// AgriSmart.Infrastructure/Repositories/Query/FertilizerQueryRepository.cs
using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.Enums;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class FertilizerQueryRepository : BaseQueryRepository<Fertilizer>, IFertilizerQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public FertilizerQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Fertilizer>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && ((f.Active && !includeInactives) || includeInactives)
                              select new Fertilizer
                              {
                                  // Existing properties
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid,
                                  Active = f.Active,
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy,

                                  // NEW PROPERTIES ADDED

                                  // Basic Information
                                  Brand = f.Brand,
                                  Description = f.Description,
                                  Type = f.Type,
                                  Formulation = f.Formulation,
                                  Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit,
                                  ApplicationMethod = f.ApplicationMethod,

                                  // NPK and Nutrient Percentages
                                  NitrogenPercentage = f.NitrogenPercentage,
                                  PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage,
                                  Micronutrients = f.Micronutrients,

                                  // Stock Management
                                  CurrentStock = f.CurrentStock,
                                  MinimumStock = f.MinimumStock,
                                  StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit,
                                  Supplier = f.Supplier,

                                  // Storage and Application
                                  ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions,
                                  ApplicationInstructions = f.ApplicationInstructions,

                                  // Chemical Analysis Parameters
                                  Ca = f.Ca,
                                  K = f.K,
                                  Mg = f.Mg,
                                  Na = f.Na,
                                  NH4 = f.NH4,
                                  N = f.N,
                                  SO4 = f.SO4,
                                  S = f.S,
                                  Cl = f.Cl,
                                  H2PO4 = f.H2PO4,
                                  P = f.P,
                                  HCO3 = f.HCO3,

                                  // Micronutrients Analysis
                                  Fe = f.Fe,
                                  Mn = f.Mn,
                                  Zn = f.Zn,
                                  Cu = f.Cu,
                                  B = f.B,
                                  Mo = f.Mo,

                                  // Solution Properties
                                  TDS = f.TDS,
                                  EC = f.EC,
                                  PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Fertilizer> GetByIdAsync(int id)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (f.Id == id)
                              select new Fertilizer
                              {
                                  // Existing properties
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid,
                                  Active = f.Active,
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy,

                                  // NEW PROPERTIES ADDED

                                  // Basic Information
                                  Brand = f.Brand,
                                  Description = f.Description,
                                  Type = f.Type,
                                  Formulation = f.Formulation,
                                  Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit,
                                  ApplicationMethod = f.ApplicationMethod,

                                  // NPK and Nutrient Percentages
                                  NitrogenPercentage = f.NitrogenPercentage,
                                  PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage,
                                  Micronutrients = f.Micronutrients,

                                  // Stock Management
                                  CurrentStock = f.CurrentStock,
                                  MinimumStock = f.MinimumStock,
                                  StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit,
                                  Supplier = f.Supplier,

                                  // Storage and Application
                                  ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions,
                                  ApplicationInstructions = f.ApplicationInstructions,

                                  // Chemical Analysis Parameters
                                  Ca = f.Ca,
                                  K = f.K,
                                  Mg = f.Mg,
                                  Na = f.Na,
                                  NH4 = f.NH4,
                                  N = f.N,
                                  SO4 = f.SO4,
                                  S = f.S,
                                  Cl = f.Cl,
                                  H2PO4 = f.H2PO4,
                                  P = f.P,
                                  HCO3 = f.HCO3,

                                  // Micronutrients Analysis
                                  Fe = f.Fe,
                                  Mn = f.Mn,
                                  Zn = f.Zn,
                                  Cu = f.Cu,
                                  B = f.B,
                                  Mo = f.Mo,

                                  // Solution Properties
                                  TDS = f.TDS,
                                  EC = f.EC,
                                  PH = f.PH
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        // ADDITIONAL QUERY METHODS FOR ENHANCED FUNCTIONALITY

        /// <summary>
        /// Get fertilizers with low stock levels
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> GetLowStockFertilizersAsync(int catalogId = 0)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && f.CurrentStock.HasValue
                                    && f.MinimumStock.HasValue
                                    && f.CurrentStock <= f.MinimumStock
                              select new Fertilizer
                              {
                                  // Include all properties as in GetAllAsync method
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid,
                                  Active = f.Active,
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy,
                                  Brand = f.Brand,
                                  Description = f.Description,
                                  Type = f.Type,
                                  Formulation = f.Formulation,
                                  Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit,
                                  ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage,
                                  PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage,
                                  Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock,
                                  MinimumStock = f.MinimumStock,
                                  StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit,
                                  Supplier = f.Supplier,
                                  ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions,
                                  ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        /// <summary>
        /// Get fertilizers expiring soon (within specified days)
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> GetExpiringSoonFertilizersAsync(int catalogId = 0, int daysAhead = 30)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(daysAhead);
                
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && f.ExpirationDate.HasValue
                                    && f.ExpirationDate <= cutoffDate
                                    && f.ExpirationDate >= DateTime.UtcNow
                              select new Fertilizer
                              {
                                  // Include all properties
                                  Id = f.Id, CatalogId = f.CatalogId, Name = f.Name, Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid, Active = f.Active, DateCreated = f.DateCreated, DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy, UpdatedBy = f.UpdatedBy, Brand = f.Brand, Description = f.Description,
                                  Type = f.Type, Formulation = f.Formulation, Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit, ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage, PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage, Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock, MinimumStock = f.MinimumStock, StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit, Supplier = f.Supplier, ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions, ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        /// <summary>
        /// Get fertilizers by type
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> GetByTypeAsync(string type, int catalogId = 0)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && f.Type == type
                              select new Fertilizer
                              {
                                  // Include all properties
                                  Id = f.Id, CatalogId = f.CatalogId, Name = f.Name, Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid, Active = f.Active, DateCreated = f.DateCreated, DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy, UpdatedBy = f.UpdatedBy, Brand = f.Brand, Description = f.Description,
                                  Type = f.Type, Formulation = f.Formulation, Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit, ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage, PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage, Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock, MinimumStock = f.MinimumStock, StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit, Supplier = f.Supplier, ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions, ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        /// <summary>
        /// Get fertilizers by supplier
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> GetBySupplierAsync(string supplier, int catalogId = 0)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && f.Supplier == supplier
                              select new Fertilizer
                              {
                                  // Include all properties
                                  Id = f.Id, CatalogId = f.CatalogId, Name = f.Name, Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid, Active = f.Active, DateCreated = f.DateCreated, DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy, UpdatedBy = f.UpdatedBy, Brand = f.Brand, Description = f.Description,
                                  Type = f.Type, Formulation = f.Formulation, Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit, ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage, PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage, Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock, MinimumStock = f.MinimumStock, StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit, Supplier = f.Supplier, ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions, ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        /// <summary>
        /// Search fertilizers by name, brand, description, or supplier
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> SearchAsync(string searchTerm, int catalogId = 0)
        {
            try
            {
                var lowerSearchTerm = searchTerm.ToLower();
                
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && (f.Name.ToLower().Contains(lowerSearchTerm) ||
                                        (f.Brand != null && f.Brand.ToLower().Contains(lowerSearchTerm)) ||
                                        (f.Description != null && f.Description.ToLower().Contains(lowerSearchTerm)) ||
                                        (f.Supplier != null && f.Supplier.ToLower().Contains(lowerSearchTerm)))
                              select new Fertilizer
                              {
                                  // Include all properties
                                  Id = f.Id, CatalogId = f.CatalogId, Name = f.Name, Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid, Active = f.Active, DateCreated = f.DateCreated, DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy, UpdatedBy = f.UpdatedBy, Brand = f.Brand, Description = f.Description,
                                  Type = f.Type, Formulation = f.Formulation, Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit, ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage, PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage, Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock, MinimumStock = f.MinimumStock, StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit, Supplier = f.Supplier, ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions, ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        /// <summary>
        /// Get expired fertilizers
        /// </summary>
        public async Task<IReadOnlyList<Fertilizer>> GetExpiredFertilizersAsync(int catalogId = 0)
        {
            try
            {
                var today = DateTime.UtcNow;
                
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && f.Active
                                    && f.ExpirationDate.HasValue
                                    && f.ExpirationDate < today
                              select new Fertilizer
                              {
                                  // Include all properties
                                  Id = f.Id, CatalogId = f.CatalogId, Name = f.Name, Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid, Active = f.Active, DateCreated = f.DateCreated, DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy, UpdatedBy = f.UpdatedBy, Brand = f.Brand, Description = f.Description,
                                  Type = f.Type, Formulation = f.Formulation, Concentration = f.Concentration,
                                  ConcentrationUnit = f.ConcentrationUnit, ApplicationMethod = f.ApplicationMethod,
                                  NitrogenPercentage = f.NitrogenPercentage, PhosphorusPercentage = f.PhosphorusPercentage,
                                  PotassiumPercentage = f.PotassiumPercentage, Micronutrients = f.Micronutrients,
                                  CurrentStock = f.CurrentStock, MinimumStock = f.MinimumStock, StockUnit = f.StockUnit,
                                  PricePerUnit = f.PricePerUnit, Supplier = f.Supplier, ExpirationDate = f.ExpirationDate,
                                  StorageInstructions = f.StorageInstructions, ApplicationInstructions = f.ApplicationInstructions,
                                  Ca = f.Ca, K = f.K, Mg = f.Mg, Na = f.Na, NH4 = f.NH4, N = f.N,
                                  SO4 = f.SO4, S = f.S, Cl = f.Cl, H2PO4 = f.H2PO4, P = f.P, HCO3 = f.HCO3,
                                  Fe = f.Fe, Mn = f.Mn, Zn = f.Zn, Cu = f.Cu, B = f.B, Mo = f.Mo,
                                  TDS = f.TDS, EC = f.EC, PH = f.PH
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}