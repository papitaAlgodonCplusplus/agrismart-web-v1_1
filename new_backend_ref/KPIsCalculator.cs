using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Entities;
using TimeZoneConverter;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;
using System.Collections.Generic;
using AgriSmart.AgronomicProcess.Common;
using System.Globalization;
using AgriSmart.AgronomicProcess.Services.Commands;
using AgriSmart.AgronomicProcess.Responses;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class KPIsCalculator
    {
        private MeasurementKPIEntity lastestMeasurermentKPI;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public KPIsCalculator(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient, string token)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;
            _token = token;
        }
        public async Task<ProcessResponse> Calculate(CropProductionEntity cropProduction, CancellationToken ct)
        {
            try
            {
                List<SaveResponse> responses = new List<SaveResponse>();

                if (ct.IsCancellationRequested)
                    return null;

                KPIsCalculationsInput input = new KPIsCalculationsInput();

                input.CropProduction = cropProduction;

                IList<MeasurementVariable> measurementVariables = await _agriSmartApiClient.GetMeasurementVariables(cropProduction.ProductionUnit.Farm.Company.CatalogId, _token);
                input.MeasurementVariables = new List<MeasurementVariable>();
                input.MeasurementVariables.AddRange(measurementVariables);

                IList<CalculationSetting> calculationSettings = await _agriSmartApiClient.GetCalculationSettings(cropProduction.ProductionUnit.Farm.Company.CatalogId, _token);
                input.CalculationSettings = new List<CalculationSetting>();
                input.CalculationSettings.AddRange(calculationSettings);

                int timeZoneId = cropProduction.ProductionUnit.Farm.TimeZoneId;

                TimeZone timeZone = await _agriSmartApiClient.GetTimeZone(timeZoneId, _token);

                TimeZoneInfo localTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZone.Name);

                DateTime userTime = TimeZoneInfo.ConvertTime(DateTime.UtcNow, localTimeZone);

                var utcNowOffset = new DateTimeOffset(userTime);

                var userNowOffset = TimeZoneInfo.ConvertTime(utcNowOffset, localTimeZone);

                //delete current user time hour KPIs
                await _agriSmartApiClient.DeleteMeasurementKPIsByDateRange(new DeleteMeasurementKPIsByDateRangeCommand()
                {
                    CropProductionId = cropProduction.Id,
                    From = TruncateToHour(userNowOffset),
                    To = TruncateToHour(userNowOffset),
                    KPIId = 0
                }, _token);

                string formattedMinDate = DateTime.MinValue.ToString("yyyy-MM-dd HH:mm:ss");
                string formattedNowDate = userTime.ToString("yyyy-MM-dd HH:mm:ss");

                DateTime lastKPIDateTime = DateTime.MinValue;

                MeasurementKPI last = _agriSmartApiClient.GetLastMeasurementKPI(formattedMinDate, formattedNowDate, cropProduction.Id, _token).Result;

                if (last != null)
                    lastKPIDateTime = last.RecordDate;

                input.StartingDate = lastKPIDateTime;

                if (lastKPIDateTime == DateTime.MinValue)
                    input.StartingDate = input.CropProduction.StartDate;

                string formattedPeriodStartingDate = input.StartingDate.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedStartingDateTime = Uri.EscapeDataString(formattedPeriodStartingDate);
                DateTime EndingDateTime = userTime;

                input.EndingDate = EndingDateTime;

                string formattedPeriodEndingDate = input.EndingDate.ToString("yyyy-MM-dd HH:mm:ss");
                string encodedEndingDateTime = Uri.EscapeDataString(formattedPeriodEndingDate);

                List<Measurement> measurements = new List<Measurement>();

                CalculationSetting airTemperatureMeasurementVariableId = calculationSettings.Where(x => x.Name == "AirTemperatureMeasurementVariableId").FirstOrDefault();
                IList<Measurement> tempData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(airTemperatureMeasurementVariableId.Value), _token);
                measurements.AddRange(tempData);

                CalculationSetting airRelativeHumedityMeasurementVariableId = calculationSettings.Where(x => x.Name == "RelativeHumedityMeasurementVariableId").FirstOrDefault();
                IList<Measurement> humData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(airRelativeHumedityMeasurementVariableId.Value), _token);
                measurements.AddRange(humData);

                CalculationSetting photoActiveRadiationMeasurementVariableId = calculationSettings.Where(x => x.Name == "PhotoActiveRadiactionMeasurementVariableId").FirstOrDefault();
                IList<Measurement> parData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(photoActiveRadiationMeasurementVariableId.Value), _token);
                measurements.AddRange(parData);

                CalculationSetting solarRadiationMeasurementVariableId = calculationSettings.Where(x => x.Name == "SolarRadiactionMeasurementVariableId").FirstOrDefault();
                IList<Measurement> radData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(solarRadiationMeasurementVariableId.Value), _token);
                measurements.AddRange(radData);

                CalculationSetting windSpeedMeasurementVariableId = calculationSettings.Where(x => x.Name == "WindSpeedMeasurementVariableId").FirstOrDefault();
                IList<Measurement> windSpeedData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(windSpeedMeasurementVariableId.Value), _token);
                measurements.AddRange(windSpeedData);

                input.ClimateData = measurements;

                input.StartingDate = measurements.Min(x => x.RecordDate);
                input.EndingDate = measurements.Max(x => x.RecordDate);

                List<Measurement> growingMediumMeasurements = new List<Measurement>();

                CalculationSetting growingMediumVolumetricWaterContentMeasurementVariableId = calculationSettings.Where(x => x.Name == "GrowingMediumVolumetricWaterContentMeasurementVariableId").FirstOrDefault();
                IList<Measurement> growingMediumData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(growingMediumVolumetricWaterContentMeasurementVariableId.Value), _token);
                growingMediumMeasurements.AddRange(growingMediumData.OrderByDescending(x => x.RecordDate).ToList());

                input.GrowingMediumData = growingMediumMeasurements;

                List<Measurement> IrrigationData = new List<Measurement>();

                CalculationSetting irrigatedVolumeMeasurementVariableId = calculationSettings.Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
                IList<Measurement> irrigationVolumeData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(irrigatedVolumeMeasurementVariableId.Value), _token);
                IrrigationData.AddRange(irrigationVolumeData.OrderByDescending(x => x.RecordDate).ToList());

                CalculationSetting drainedVolumeMeasurementVariableId = calculationSettings.Where(x => x.Name == "DrainVolume").FirstOrDefault();
                IList<Measurement> drainedVolumeData = await _agriSmartApiClient.GetMeasurements(encodedStartingDateTime, encodedEndingDateTime, cropProduction.Id, Convert.ToInt32(drainedVolumeMeasurementVariableId.Value), _token);
                IrrigationData.AddRange(drainedVolumeData.OrderByDescending(x => x.RecordDate).ToList());

                input.IrrigationData = IrrigationData;

                if (growingMediumMeasurements.Min(x => x.RecordDate) < input.StartingDate)
                    input.StartingDate = growingMediumMeasurements.Min(x => x.RecordDate);

                if (growingMediumMeasurements.Max(x => x.RecordDate) > input.EndingDate)
                    input.EndingDate = growingMediumMeasurements.Max(x => x.RecordDate);


                IList<IrrigationEvent> irrigationEvents = await _agriSmartApiClient.GetIrrigationEvents(formattedPeriodStartingDate, formattedNowDate, cropProduction.Id, true, _token);

                List<IrrigationEventEntity> irrigationEventEntities = new List<IrrigationEventEntity>();

                foreach (IrrigationEvent irrigationEvent in irrigationEvents)
                {
                    IrrigationEventEntity newIrrigationEventEntity = new IrrigationEventEntity(irrigationEvent);
                    irrigationEventEntities.Add(newIrrigationEventEntity);
                }

                input.IrrigationEvents = irrigationEventEntities;

                List<GlobalOutput> globalOutput = KPIsCalculations.Calculate(input);

                var saveBatchResponse = await SaveBatch(globalOutput);

                //var saveBatchResponse = new ;

                _logger.LogWarning("Calculator result: Suceed: {nSucceed} for CropProduction: {CropProductionId}", saveBatchResponse.Result.InsertedCount, cropProduction.Id);

                SaveResponse saveResponse = new SaveResponse();

                saveResponse.TotalMeasurementSucceed = saveBatchResponse.Result.InsertedCount;

                return new ProcessResponse(true, new SaveResponse());
            }
            catch (Exception ex)
            {
                return new ProcessResponse(ex.Message);

                throw;
            }
        }
        
        private async Task<SaveResponse> Save(List<GlobalOutput> outputs)
        {
            SaveResponse output = new SaveResponse();

            int nKPIsSaved = 0;

            try
            {
                foreach (GlobalOutput globalOutput in outputs)
                {
                    //if(globalOutput.IrrigationMetrics)
                    foreach (KPIsOutput kpi in globalOutput.KPIs)
                    {
                        foreach (var prop in kpi.GetType().GetProperties())
                        {
                            string propName = prop.Name;

                            // find any dictionary entry where value matches property name
                            var match = Dictionaries.KPIDictionary
                                .FirstOrDefault(x => x.Value == propName);

                            if (!match.Equals(default(KeyValuePair<int, string>)))
                            {
                                int key = match.Key;
                                var value = prop.GetValue(kpi);

                                if (value != null)
                                {
                                    MeasurementKPI measurementKPI = new MeasurementKPI()
                                    {
                                        CropProductionId = globalOutput.CropProduction.Id,
                                        KPIId = key,
                                        RecordValue = value != null ? Convert.ToDouble(value) : 0,
                                        RecordDate = kpi.Date
                                    };

                                    Response<CreateMeasurementKPIResponse> response =  await _agriSmartApiClient.CreateMeasurementKPI(measurementKPI, _token);

                                    if (response != null)
                                    {
                                        if (response.Success)
                                            output.TotalMeasurementSucceed += 1;
                                        else
                                            output.TotalMeasurementFailed += 1;
                                    }
                                }
                            }
                        }
                    }

                    //foreach(IrrigationEventEntity irrigation in outputs.ir)
                }

                return output;
            }
            catch (Exception)
            {
                return output;
            }

        }
        private async Task<Response<CreateMeasurementKPIsBatchResponse>> SaveBatch(List<GlobalOutput> outputs)
        {
            CreateMeasurementKPIsBatchCommand command = new CreateMeasurementKPIsBatchCommand();
            command.Items = new List<MeasurementKPI>();

            try
            {
                foreach (GlobalOutput globalOutput in outputs)
                {
                    foreach (KPIsOutput kpi in globalOutput.KPIs)
                    {
                        foreach (var prop in kpi.GetType().GetProperties())
                        {
                            string propName = prop.Name;

                            // find any dictionary entry where value matches property name
                            var match = Dictionaries.KPIDictionary
                                .FirstOrDefault(x => x.Value == propName);

                            if (!match.Equals(default(KeyValuePair<int, string>)))
                            {
                                int key = match.Key;
                                var value = prop.GetValue(kpi);

                                if (value != null)
                                {
                                    MeasurementKPI measurementKPI = new MeasurementKPI()
                                    {
                                        CropProductionId = globalOutput.CropProduction.Id,
                                        KPIId = key,
                                        RecordValue = value != null ? Convert.ToDouble(value) : 0,
                                        RecordDate = kpi.Date
                                    };

                                    command.Items.Add(measurementKPI);
                                }
                            }
                        }
                    }
                }

                var response = await _agriSmartApiClient.CreateMeasurementKPIBatch(command, _token);

                return response;
            }
            catch (Exception ex)
            {
                return new Response<CreateMeasurementKPIsBatchResponse>(ex);
            }

        }
        private static DateTimeOffset TruncateToHour(DateTimeOffset dt)
        {
            return new DateTimeOffset(
                dt.Year,
                dt.Month,
                dt.Day,
                dt.Hour,
                0, 0,
                dt.Offset);
        }
    }
}
