using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Services.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Services
{
    public interface IAgriSmartApiClient
    {
        Task<LoginResponse> CreateSession(string userName, string password);
        Task<IList<CalculationSetting>> GetCalculationSettings(int catalogId, string token);
        Task<IList<Company>> GetCompanies(string token);
        Task<IList<Farm>> GetFarms(int companyId, string token);
        Task<IList<ProductionUnit>> GetProductionUnits(int farmId, string token);
        Task<IList<CropProduction>> GetCropProductions(int productionUnitId, string token);
        Task<IList<Device>> GetDevices(int cropProductionId, string token);
        Task<ProcessDeviceRawDataMeasurementsResponse> ProcessDeviceRawData(int deviceId, string token);
        Task<ProcessCropProductionRawDataMeasurementsResponse> ProcessCropProductionRawData(int cropProductionId, string token);
        Task<IList<Crop>> GetCrops(int productionUnitId, string token);
        Task<Crop> GetCrop(int cropId, string token);
        Task<Container> GetContainer(int containerId, string token);
        Task<Dropper> GetDropper(int dropperId, string token);
        Task<GrowingMedium> GetGrowingMedium(int growingMediumId, string token);
        Task<MeasurementKPI> GetLastMeasurementKPI(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token);
        Task<IList<MeasurementKPI>> GetMeasurementKPIs(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token);
        Task<IList<MeasurementVariable>> GetMeasurementVariables(int catalogId, string token);
        Task<IList<Measurement>> GetMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, int measurementVariableId, string token);
        Task<IList<MeasurementBase>> GetMeasurementsBase(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, int measurementVariableId, string token);
        Task<IList<IrrigationMeasurement>> GetIrrigationMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token);
        Task<IList<IrrigationEvent>> GetIrrigationEvents(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token);
        Task<IList<TimeZone>> GetTimeZones(string token);
        Task<TimeZone> GetTimeZone(int id, string token);
    }
}
