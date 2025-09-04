using AgriSmart.Tools.DataModels;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System;
using AgriSmart.Tools.Entities;
using AgriSmart.Tools.Services;
using AgriSmart.Tools.Configuration;
using Microsoft.Extensions.Options;
using AgriSmart.Tools.Services.Responses;
using AgriSmart.Core.Entities;

namespace AgriSmart.Tools.Desktop
{
    public class Session
    {
        private readonly IAgriSmartApiClient _apiClient;


        private IList<FertilizerInputModel> fertilizersInputs;
        private List<FertilizerModel> fertilizers;
        private List<MeasurementUnitModel> measurementUnits;
        private List<InputPresentationModel> inputPresentations;
        private List<FertilizerChemistryModel> fertilizerChemistries;
        private List<WaterModel> waters;
        private List<WaterChemistryModel> waterChemistries;
        private CropPhaseSolutionRequirementModel cropPhaseSolutionRequirements;

        public CompanyEntity Company { get; set; }
        public FarmEntity Farm { get; set; }
        public int CatalogId { get; set; } = -1;
        public string Name { get; set; }
        public CropPhaseSolutionRequirementEntity Requirements { get; set; }
        public ObservableCollection<FertilizerInputEntity> FertilizerInputs { get; set; }
        public ObservableCollection<InputPresentationEntity> InputPresentations { get; set; }
        public ObservableCollection<FertilizerEntity> Fertilizers { get; set; }
        public ObservableCollection<FertilizerChemistryEntity> FertilizerChemistries { get; set; }
        public ObservableCollection<MeasurementUnitEntity> MeasurementUnits { get; set; }
        public ObservableCollection<WaterEntity> Waters { get; set; }
        public ObservableCollection<WaterChemistryEntity> WaterChemistries { get; set; }
        public ObservableCollection<CropPhaseSolutionRequirementEntity> CropPhaseRequirements { get; set; }
        public List<SolutionFeatureInfo> WaterFeaturesInfo { get; set; }
        public List<SolutionFeatureCategoryInfo> WaterFeaturesCategoryInfo { get; set; }
        public List<SolutionFeatureInfo> SolutionFeaturesInfo { get; set; }
        public List<SolutionFeatureCategoryInfo> SolutionFeaturesCategoryInfo { get; set; }
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public List<SaveResponse> SaveResults { get; set; }
        public double TargetEC { get; set; }
        public Session()
        {

        }
        public Session(IAgriSmartApiClient apiClient)
        {
            _apiClient = apiClient;
        }
        private async Task<List<FertilizerInputModel>> LoadFertilizerInputs()
        {
            var response = await _apiClient.GetFertilizerInputs(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<FertilizerModel>> LoadFertilizers()
        {
            var response = await _apiClient.GetFertilizers(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<MeasurementUnitModel>> LoadMeasurementUnits()
        {
            var response = await _apiClient.GetMeasurementUnits(LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<InputPresentationModel>> LoadInputPresentations()
        {
            var response = await _apiClient.GetInputPresentations(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<FertilizerChemistryModel>> LoadFertilizerChemistries()
        {
            var response = await _apiClient.GetFertilizerChemitries(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<WaterModel>> LoadWaters()
        {
            var response = await _apiClient.GetWaters(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<List<WaterChemistryModel>> LoadWaterChimestries()
        {
            var response = await _apiClient.GetWaterChemistries(CatalogId, LoggedUser.getInstance().User.Token);
            return response;
        }
        private async Task<CropPhaseSolutionRequirementModel> LoadCropPhaseSolutionRequirements()
        {
            var response = await _apiClient.GetCropPhaseSolutionRequirement(CropPhaseId, LoggedUser.getInstance().User.Token);
            return response;
        }
        public async Task<bool> LoadModels()
        {
            try
            {
                measurementUnits = await LoadMeasurementUnits();
                fertilizersInputs = await LoadFertilizerInputs();
                fertilizers = await LoadFertilizers();
                inputPresentations = await LoadInputPresentations();
                fertilizerChemistries = await LoadFertilizerChemistries();
                waters = await LoadWaters();
                waterChemistries = await LoadWaterChimestries();
                cropPhaseSolutionRequirements = await LoadCropPhaseSolutionRequirements();
            }
            catch (Exception)
            {
                return false;
                throw;
            }

            return true;

        }
        public void LoadEntities()
        {
            Task.Run(() => LoadModels()).Wait();

            AddMeasureUnits();
            AddFertilizerChemistries();
            AddFertilizers();
            AddInputPresentations();
            AddFertilizerInputs();
            AddWaterChemistries();
            AddWaters();
            AddCropSolutionRequirement();
            AcceptAllChanges();
        }
        public void AcceptAllChanges()
        {
            foreach (var item in FertilizerChemistries.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }

            foreach (var item in Fertilizers.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }

            foreach (var item in InputPresentations.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }

            foreach (var item in FertilizerInputs.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }

            foreach (var item in Waters.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }

            foreach (var item in WaterChemistries.ToList()) // ToList to avoid modification during iteration
            {
                item.IsNew = false;
                item.IsModified = false;
                item.IsDeleted = false;
            }
        }
        private void AddMeasureUnits()
        {
            MeasurementUnits = new ObservableCollection<MeasurementUnitEntity>();

            foreach (MeasurementUnitModel unit in measurementUnits)
            {
                MeasurementUnitEntity newUnit = new MeasurementUnitEntity(unit);
                MeasurementUnits.Add(newUnit);
            }
        }
        private void AddFertilizerChemistries()
        {
            FertilizerChemistries = new ObservableCollection<FertilizerChemistryEntity>();
            FertilizerChemistries.CollectionChanged += FertilizerChemistry_CollectionChanged;

            foreach (FertilizerChemistryModel fertilizerChemistryModel in fertilizerChemistries)
            {
                FertilizerChemistryEntity newFertilizarChemitry = new FertilizerChemistryEntity(fertilizerChemistryModel);

                FertilizerChemistries.Add(newFertilizarChemitry);
            }
        }
        private void FertilizerChemistry_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (FertilizerChemistryEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += FertilizerChemistry_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (FertilizerChemistryEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged += FertilizerChemistry_PropertyChanged;
                }
            }
        }
        private void FertilizerChemistry_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is FertilizerChemistryEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        private void AddFertilizers()
        {
            Fertilizers = new ObservableCollection<FertilizerEntity>();
            Fertilizers.CollectionChanged += Fertilizer_CollectionChanged;

            foreach (FertilizerModel fertilizerModel in fertilizers)
            {
                FertilizerChemistryEntity fertilizerChemistry = FertilizerChemistries.Where(x => x.FertilizerId == fertilizerModel.Id).FirstOrDefault();
                FertilizerEntity newFertilizer = new FertilizerEntity(fertilizerModel, fertilizerChemistry);
                Fertilizers.Add(newFertilizer);
            }
        }
        private void Fertilizer_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (FertilizerEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += Fertilizer_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (FertilizerEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged += Fertilizer_PropertyChanged;
                }
            }
        }
        private void Fertilizer_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is FertilizerEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        private void AddInputPresentations()
        {
            InputPresentations = new ObservableCollection<InputPresentationEntity>();
            InputPresentations.CollectionChanged += InputPresentations_CollectionChanged;

            foreach (InputPresentationModel presentationModel in inputPresentations)
            {
                MeasurementUnitEntity measurementUnit = MeasurementUnits.Where(x => x.Id == presentationModel.MeasurementUnitId).FirstOrDefault();
                InputPresentationEntity presentation = new InputPresentationEntity(presentationModel, measurementUnit);
                InputPresentations.Add(presentation);
            }

        }
        private void InputPresentations_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (InputPresentationEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += InputPresentation_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (InputPresentationEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged += InputPresentation_PropertyChanged;
                }
            }
        }
        private void InputPresentation_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is InputPresentationEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        private void AddFertilizerInputs()
        {
            FertilizerInputs = new ObservableCollection<FertilizerInputEntity>();
            FertilizerInputs.CollectionChanged += FertilizerInputs_CollectionChanged;

            foreach (FertilizerInputModel fertilizerInputModel in fertilizersInputs)
            {
                FertilizerEntity fertilizer = Fertilizers.Where(x => x.Id == fertilizerInputModel.FertilizerId).FirstOrDefault();
                InputPresentationEntity inputPresentation = InputPresentations.Where(x => x.Id == fertilizerInputModel.InputPresentationId).FirstOrDefault();
                FertilizerInputEntity newFertilizerInput = new FertilizerInputEntity(fertilizerInputModel, fertilizer, inputPresentation);
                FertilizerInputs.Add(newFertilizerInput);
            }
        }
        private void FertilizerInputs_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (FertilizerInputEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += FertilizerInput_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (FertilizerInputEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged -= FertilizerInput_PropertyChanged;
                }
            }
        }
        private void FertilizerInput_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is FertilizerInputEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        private void AddWaterChemistries()
        {
            WaterChemistries = new ObservableCollection<WaterChemistryEntity>();
            WaterChemistries.CollectionChanged += WaterChemistries_CollectionChanged;

            foreach (WaterChemistryModel waterChemistryModel in waterChemistries)
            {
                WaterChemistryEntity newWaterChemistry = new WaterChemistryEntity(waterChemistryModel);
                WaterChemistries.Add(newWaterChemistry);
            }
        }
        private void WaterChemistries_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (WaterChemistryEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += FertilizerInput_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (WaterChemistryEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged -= FertilizerInput_PropertyChanged;
                }
            }
        }
        private void WaterChemistry_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is WaterChemistryEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        private void AddWaters()
        {
            Waters = new ObservableCollection<WaterEntity>();
            Waters.CollectionChanged += Waters_CollectionChanged;

            foreach (WaterModel waterModel in waters)
            {
                List<WaterChemistryEntity> chemistries = WaterChemistries.Where(x => x.WaterId == waterModel.Id).ToList();
                WaterEntity newWater = new WaterEntity(waterModel, chemistries);
                Waters.Add(newWater);
            }
        }
        private void AddCropSolutionRequirement()
        {
            Requirements = new CropPhaseSolutionRequirementEntity(cropPhaseSolutionRequirements);
        }
        private void Waters_CollectionChanged(object? sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            if (e.NewItems != null)
            {
                foreach (WaterEntity newItem in e.NewItems)
                {
                    newItem.IsNew = true;
                    newItem.PropertyChanged += Water_PropertyChanged;
                }
            }

            if (e.OldItems != null)
            {
                foreach (WaterEntity oldItem in e.OldItems)
                {
                    oldItem.IsDeleted = true;
                    // Optionally, move to a separate deleted list
                    oldItem.PropertyChanged -= Water_PropertyChanged;
                }
            }
        }
        private void Water_PropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (sender is WaterEntity obj && !obj.IsNew)
            {
                obj.IsModified = true;
            }
        }
        public SaveResponse SaveInputPresentations()
        {
            return TaskSaveInputPresentations().Result;
        }
        public SaveResponse SaveFertilizersAndChemistries()
        {
            return TaskSaveFertilizersAndChemistries().Result;
        }
        public SaveResponse SaveWatersAndChemistries()
        {
            return TaskSaveWatersAndChemistries().Result;
        }
        public SaveResponse SaveFertilizerInputs()
        {
            return TaskSaveFertilizerInputs().Result;
        }
        private async Task<SaveResponse> TaskSaveInputPresentations()
        {
            SaveResponse result = new SaveResponse();

            try
            {
                List<InputPresentationEntity> newInputPresentations = InputPresentations.Where(x => x.IsNew).ToList();
                List<InputPresentationEntity> modifiedInputPresentations = InputPresentations.Where(x => x.IsModified).ToList();

                foreach (InputPresentationEntity inputPresentation in newInputPresentations)
                {
                    InputPresentationModel model = new InputPresentationModel(inputPresentation);
                    var saveInputPresentationResult = await _apiClient.PostInputPresentationAsync(model, LoggedUser.getInstance().User.Token);

                    InputPresentationModel resultModel = saveInputPresentationResult.Result;
                    inputPresentation.Id = resultModel.Id;

                    if (!saveInputPresentationResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveInputPresentationResult.Exception;
                        return result;
                    }

                    inputPresentation.AcceptChanges();
                }

                foreach (InputPresentationEntity inputPresentation in modifiedInputPresentations)
                {
                    InputPresentationModel model = new InputPresentationModel(inputPresentation);
                    var saveInputPresentationResult = await _apiClient.PutInputPresentationAsync(model, LoggedUser.getInstance().User.Token);

                    if (!saveInputPresentationResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveInputPresentationResult.Exception;
                        return result;
                    }

                    inputPresentation.AcceptChanges();
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ExceptionMessage = ex.Message;

            }

            return result;
        }
        private async Task<SaveResponse> TaskSaveFertilizersAndChemistries()
        {
            SaveResponse result = new SaveResponse();

            try
            {
                List<FertilizerEntity> newFertilizers = Fertilizers.Where(x => x.IsNew).ToList();
                List<FertilizerEntity> modifiedFertilizer = Fertilizers.Where(x => x.IsModified).ToList();

                foreach (FertilizerEntity fertilizer in newFertilizers)
                {
                    FertilizerModel model = new FertilizerModel(fertilizer);
                    var response = await _apiClient.PostFertilizerAsync(model, LoggedUser.getInstance().User.Token);

                    FertilizerModel resultModel = response.Result;
                    fertilizer.Id = resultModel.Id;

                    var saveChemistryResult = TaskSaveFertilizerChemistry(fertilizer.FertilizerChemistry).Result;

                    if (! saveChemistryResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveChemistryResult.Exception;
                        return result;
                    }

                    fertilizer.AcceptChanges();
                }

                foreach (FertilizerEntity fertilizer in modifiedFertilizer)
                {
                    FertilizerModel model = new FertilizerModel(fertilizer);
                    var response = await _apiClient.PutFertilizerAsync(model, LoggedUser.getInstance().User.Token);

                    var saveChemistryResult = TaskSaveFertilizerChemistry(fertilizer.FertilizerChemistry).Result;

                    if (saveChemistryResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveChemistryResult.Exception;
                        return result;
                    }

                    fertilizer.AcceptChanges();
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ExceptionMessage = ex.Message;
            }

            return result;
        }
        private async Task<SaveResponse> TaskSaveWatersAndChemistries()
        {
            SaveResponse result = new SaveResponse();

            try
            {
                List<WaterEntity> newWaters = Waters.Where(x => x.IsNew).ToList();
                List<WaterEntity> modifiedWaters = Waters.Where(x => x.IsModified).ToList();

                foreach (WaterEntity water in newWaters)
                {
                    WaterModel model = new WaterModel(water);
                    var response = await _apiClient.PostWaterAsync(model, LoggedUser.getInstance().User.Token);

                    WaterModel resultModel = response.Result;
                    water.Id = resultModel.Id;

                    var saveWaterResult = TaskSaveWaterChemistries(water.Chemistries).Result;

                    if (!saveWaterResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveWaterResult.Exception;
                        return result;
                    }

                  water.AcceptChanges();
                }

                foreach (WaterEntity water in modifiedWaters)
                {
                    WaterModel model = new WaterModel(water);
                    var response = await _apiClient.PutWaterAsync(model, LoggedUser.getInstance().User.Token);

                    var saveWaterResult = TaskSaveWaterChemistries(water.Chemistries).Result;

                    if (saveWaterResult.Success)
                    {
                        result.Success = false;
                        result.ExceptionMessage = saveWaterResult.Exception;
                        return result;
                    }

                    water.AcceptChanges();
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ExceptionMessage = ex.Message;
            }

            return result;
        }
        private async Task<SaveResponse> TaskSaveFertilizerInputs()
        {
            var result = new SaveResponse();

            try
            {
                List<FertilizerInputEntity> newFertilizerInputs = FertilizerInputs.Where(x => x.IsNew).ToList();
                List<FertilizerInputEntity> modifiedFertilizerInputs = FertilizerInputs.Where(x => x.IsModified).ToList();

                foreach (FertilizerInputEntity fertilizerInput in newFertilizerInputs)
                {
                    FertilizerInputModel model = new FertilizerInputModel(fertilizerInput);
                    var response = await _apiClient.PostFertilizerInputAsync(model, LoggedUser.getInstance().User.Token);
                }

                foreach (FertilizerInputEntity fertilizerInput in modifiedFertilizerInputs)
                {
                    FertilizerInputModel model = new FertilizerInputModel(fertilizerInput);
                    var response = await _apiClient.PutFertilizerInputAsync(model, LoggedUser.getInstance().User.Token);
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ExceptionMessage = ex.Message;
            }

            return result;
        }
        private async Task<Response<FertilizerChemistryModel>> TaskSaveFertilizerChemistry(FertilizerChemistryEntity chemistry)
        {         
            FertilizerChemistryModel model = new FertilizerChemistryModel(chemistry);

            try
            {
                if (chemistry.IsNew)
                {
                    var response = await _apiClient.PostFertilizerChemistryAsync(model, LoggedUser.getInstance().User.Token);
                    chemistry.AcceptChanges();
                    return response;
                }

                if (chemistry.IsModified)
                {
                    var response = await _apiClient.PutFertilizerChemistryAsync(model, LoggedUser.getInstance().User.Token);
                    chemistry.AcceptChanges();
                    return response;
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<FertilizerChemistryModel>(ex.Message);
            }
        }
        private async Task<Response<WaterChemistryModel>> TaskSaveWaterChemistries(List<WaterChemistryEntity> waterChemistries)
        {
            try
            {
                foreach (WaterChemistryEntity waterChemistry in waterChemistries)
                {
                    WaterChemistryModel model = new WaterChemistryModel(waterChemistry);

                    if (waterChemistry.IsNew)
                    {
                        var response = await _apiClient.PostWaterChemistryAsync(model, LoggedUser.getInstance().User.Token);
                        waterChemistry.AcceptChanges();
                        return response;
                    }

                    if (waterChemistry.IsModified)
                    {
                        var response = await _apiClient.PutWaterChemistryAsync(model, LoggedUser.getInstance().User.Token);
                        waterChemistry.AcceptChanges();
                        return response;
                    }

                    return null;
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<WaterChemistryModel>(ex.Message);
            }

        }

    }

}
    
