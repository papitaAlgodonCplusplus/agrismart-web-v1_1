using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Services.Responses;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Services
{
    public interface IAgriSmartApiClient 
    {
        Task<UserModel> CreateSession(string userName, string password);
        Task<IList<CalculationSettingModel>> GetCalculationSettings(int catalogId, string token);
        Task<IList<CompanyModel>> GetCompanies(string token);
        Task<List<FarmModel>> GetFarms(int companyId, string token);
        Task<List<ProductionUnitModel>> GetProductionUnits(int farmId, string token);
        Task<List<CropProductionModel>> GetCropProductions(int productionUnitId, string token);
        Task<List<CropProductionModel>> GetCropProductionsByCompany(int companyId, string token);
        Task<List<CropModel>> GetCrops(string token);
        Task<List<CropPhaseModel>> GetCropPhases(int cropId, string token);
        Task<List<FertilizerInputModel>> GetFertilizerInputs(int catalogId, string token);
        Task<List<FertilizerModel>> GetFertilizers(int catalogId, string token);
        Task<List<FertilizerChemistryModel>> GetFertilizerChemitries(int catalogId, string token);
        Task<List<InputPresentationModel>> GetInputPresentations(int catalogId, string token);
        Task<List<WaterModel>> GetWaters(int catalogId, string token);
        Task<List<WaterChemistryModel>> GetWaterChemistries(int catalogId, string token);
        Task<List<MeasurementUnitModel>> GetMeasurementUnits(string token);
        Task<CropModel> GetCrop(int cropId, string token);
        Task<CropPhaseSolutionRequirementModel> GetCropPhaseSolutionRequirement(int cropPhaseId, string token);
        Task<ContainerModel> GetContainer(int containerId, string token);
        Task<DropperModel> GetDropper(int dropperId, string token);
        Task<GrowingMediumModel> GetGrowingMedium(int growingMediumId, string token);
        Task<Response<FertilizerModel>> PostFertilizerAsync(FertilizerModel fertilizeryModel, string token);
        Task<Response<FertilizerModel>> PutFertilizerAsync(FertilizerModel fertilizeryModel, string token);
        Task<Response<FertilizerChemistryModel>> PostFertilizerChemistryAsync(FertilizerChemistryModel fertilizerChemistryModel, string token);
        Task<Response<FertilizerChemistryModel>> PutFertilizerChemistryAsync(FertilizerChemistryModel fertilizerChemistryModel, string token);
        Task<Response<WaterModel>> PostWaterAsync(WaterModel waterChemistryModel, string token);
        Task<Response<WaterModel>> PutWaterAsync(WaterModel waterChemistryModel, string token);
        Task<Response<WaterChemistryModel>> PostWaterChemistryAsync(WaterChemistryModel waterChemistryModel, string token);
        Task<Response<WaterChemistryModel>> PutWaterChemistryAsync(WaterChemistryModel waterChemistryModel, string token);
        Task<Response<InputPresentationModel>> PostInputPresentationAsync(InputPresentationModel waterChemistryModel, string token);
        Task<Response<InputPresentationModel>> PutInputPresentationAsync(InputPresentationModel waterChemistryModel, string token);
        Task<Response<FertilizerInputModel>> PostFertilizerInputAsync(FertilizerInputModel fertilizerInputModel, string token);
        Task<Response<FertilizerInputModel>> PutFertilizerInputAsync(FertilizerInputModel fertilizerInputModel, string token);
    }
}
