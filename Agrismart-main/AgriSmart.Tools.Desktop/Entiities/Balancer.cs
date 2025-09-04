using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using AgriSmart.Tools.Common;
using AgriSmart.Tools.Desktop;
using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools
{
    public class Balancer
    {
        public Balance Balance = null;
        public List<SolutionFeatureEntity> SolutionFeatures { get { return getSolutionQualityFeatures(); } }
        private Session session;
        private WaterEntity water = null;
        private List<BalanceItem> BalanceItems = new List<BalanceItem>();
        public Balancer(Session session)
        {
            this.session = session;
        }
        public void GetBalance()
        {
            Balance = new Balance();
            BalanceItems.Clear();

            foreach (CropPhaseSolutionRequirementItemEntity rqto in session.Requirements.SolutionFeatures)
            {
                BalanceItem balanceItem = new BalanceItem(rqto);

                foreach (FertilizerInputEntity fertilizerInput in session.FertilizerInputs.Where(x => x.Selected).ToList())
                {
                    Supply supply = new Supply(rqto.RequirementName);
                    supply.Source = fertilizerInput.Fertilizer;
                    supply.Amount = fertilizerInput.Amount;
                    balanceItem.AddSupply(supply);
                }

                double val = balanceItem.FertilizerSupply;

                AddItem(balanceItem);

                if (water != null)
                {
                    Supply supplyWater = new Supply(rqto.RequirementName);
                    supplyWater.Source = water;
                    supplyWater.Amount = 0;
                    balanceItem.AddSupply(supplyWater);
                }

            }

            fillBalance();
        }
        private void fillBalance()
        {
            if (BalanceItems.Count > 0)
            {
                BalanceMaster masterRequirements = new BalanceMaster();
                masterRequirements.ItemName = "Requirements";
                masterRequirements.Caption = "Requirements";
                Balance.AddMasterRow(masterRequirements);

                BalanceMaster masterSupply = new BalanceMaster();
                masterSupply.ItemName = "Supplies";
                masterSupply.Caption = "Supplies";
                Balance.AddMasterRow(masterSupply);

                BalanceDetail requirementDetail = new BalanceDetail();
                requirementDetail.ParentName = "Requirements";
                requirementDetail.ItemName = "Requirements";
                requirementDetail.Caption = "Requirements";
                requirementDetail.RequirementMaster = masterRequirements;

                masterRequirements.AddBalanceDetail(requirementDetail);

                var classType = typeof(BalanceDetail);


                foreach (CropPhaseSolutionRequirementItemEntity rto in session.Requirements.SolutionFeatures)
                {
                    if (rto.RequirementName != "NH4" && rto.RequirementName != "Cl" && rto.RequirementName != "Na" )
                    {
                        classType.GetProperty(rto.RequirementName).SetValue(requirementDetail, rto.Value);
                    }
                }

                foreach (BalanceItem balanceItem in BalanceItems)
                {
                    foreach (Supply supply in balanceItem.FertilizerSupplies)
                    {
                        string sourceName = "";
                        Int64 sourceId = -1;

                        Type t = supply.Source.GetType();

                        if (t.Equals(typeof(FertilizerEntity)))
                        {
                            FertilizerEntity fertilizer = (FertilizerEntity)supply.Source;
                            sourceName = fertilizer.Name;
                            sourceId = fertilizer.Id;
                        }
                        else
                        {
                            WaterEntity water = (WaterEntity)supply.Source;
                            sourceName = water.Name;
                        }

                        BalanceDetail supplyDetail = null;

                        if (masterSupply.BalanceDetails != null)
                            supplyDetail = masterSupply.BalanceDetails.Where(x => x.ItemName == sourceName).FirstOrDefault();

                        if (supplyDetail == null)
                        {
                            supplyDetail = new BalanceDetail();
                            supplyDetail.SupplyMaster = masterSupply;
                            supplyDetail.RequirementMaster = masterRequirements;
                            supplyDetail.SourceId = sourceId;
                            supplyDetail.ItemName = sourceName;
                            supplyDetail.Caption = sourceName;
                            supplyDetail.ParentName = "Supplies";
                            supplyDetail.Amount = supply.Amount;
                            masterSupply.AddBalanceDetail(supplyDetail);
                        }

                        if (balanceItem.SolutionFeature.RequirementName != "NH4" && balanceItem.SolutionFeature.RequirementName != "Cl" && balanceItem.SolutionFeature.RequirementName != "Na" )
                        {
                            classType.GetProperty(balanceItem.SolutionFeature.RequirementName).SetValue(supplyDetail, supply.SupplyValue);
                        }
                    }
                }

                //BalanceDs.IndicatorsRow indicatorRow = balanceDs.Indicators.NewIndicatorsRow();

                //indicatorRow.SumAnions = getSumAnions();
                //indicatorRow.SumCations = getSumCations();
                //indicatorRow.KNRel = getKNRel();

                //balanceDs.Indicators.AddIndicatorsRow(indicatorRow);


                //CalculatePercentages(balanceDs);
            }
        }
        public void calculateAmountAdjuster()
        {
            water = session.Waters.Where(x => x.Selected == true).First();
            FertilizerInputEntity fertilizerInput = session.FertilizerInputs.Where(x => x.Fertilizer.FertilizerChemistry.IspHAdjuster == true && x.Selected).FirstOrDefault();
            double amount = water.getAcidConcentration(fertilizerInput.Fertilizer, water.Chemistry.HCO3, 6.17,Enums.ConcentrationUnit.mgL);

            fertilizerInput.Amount = amount;

            GetBalance();
        }
        public void updateAmount(Int64 fertilizerId, double amount)
        {
            FertilizerInputEntity fertilizer = session.FertilizerInputs.Where(x => x.Id == fertilizerId).FirstOrDefault();
            fertilizer.Amount = amount;
            GetBalance();
        }
        private void AddItem(BalanceItem item)
        {
            if (BalanceItems == null)
            {
                BalanceItems = new List<BalanceItem>();
            }

            BalanceItems.Add(item);
        }
        private double getECRequired()
        {
            double sumElectroConductivity = 0;

            foreach (BalanceItem balacenItem in BalanceItems)
            {
                double ElectroConductivity  = Constants.ElectroConductivityCoefficientDic[balacenItem.SolutionFeature.RequirementName];
                double valencia = Constants.ValenciaDic[balacenItem.SolutionFeature.RequirementName];
                sumElectroConductivity += balacenItem.SolutionFeature.Value * ElectroConductivity;
            }

            return sumElectroConductivity / 1000.00;
        }
        private double getECWater()
        {
            double sumElectroConductivity = 0;

            foreach (BalanceItem balacenItem in BalanceItems)
            {
                double ElectroConductivity = Constants.ElectroConductivityCoefficientDic[balacenItem.SolutionFeature.RequirementName];
                double valencia = Constants.ValenciaDic[balacenItem.SolutionFeature.RequirementName];
                sumElectroConductivity += balacenItem.WaterSupply * ElectroConductivity;
            }

            return sumElectroConductivity / 1000.00;
        }
        private double getECFertilizerSupply()
        {
            double sumElectroConductivity = 0;

            foreach (BalanceItem balacenItem in BalanceItems)
            {
                double ElectroConductivity = Constants.ElectroConductivityCoefficientDic[balacenItem.SolutionFeature.RequirementName];
                double valencia = Constants.ValenciaDic[balacenItem.SolutionFeature.RequirementName];
                sumElectroConductivity += balacenItem.FertilizerSupply * ElectroConductivity;
            }

            return sumElectroConductivity / 1000.00;
        }
        private double getECConvertionFactor(double targetEC)
        {
            double actualEC = getECFertilizerSupply();
            double targetECOnlyFertilizer = targetEC - getECWater();
            return targetECOnlyFertilizer / actualEC;
        }
        private void RecalculateAmount()
        {
            foreach (FertilizerInputEntity fertilizerInput in session.FertilizerInputs.Where(x => x.Selected).ToList())
            {
                double actualAmount = fertilizerInput.Amount;

                double newAmount = actualAmount * getECConvertionFactor(session.TargetEC);

                fertilizerInput.Amount = newAmount;

            }
        }
        public double getSumAnions()
        {
            double sum = 0;

            foreach (BalanceItem balacenItem in BalanceItems)
            {
                if (Constants.IsAnionDic[balacenItem.SolutionFeature.RequirementName])
                {
                    sum += balacenItem.FertilizerSupply;
                }
            }

            return sum;
        }
        public double getSumCations()
        {
            double sum = 0;

            foreach (BalanceItem balacenItem in BalanceItems)
            {
                if (!Constants.IsAnionDic[balacenItem.SolutionFeature.RequirementName])
                {
                    sum += balacenItem.FertilizerSupply;
                }
            }

            return sum;
        }
        public double getKNRel()
        {
            double sumK = 0;
            double sumN = 0;

            return 100;
        }

        //private BalanceDs getBalance2()
        //{
        //    foreach (CropSolutionRequirementItem rqto in requirements.SolutionFeatures)
        //    {
        //        BalanceItem balanceItem = new BalanceItem(rqto);

        //        foreach (FertilizerInput fertilizerInput in session.FertilizerInputs.Where(x => x.Selected).ToList())
        //        {
        //            Supply supply = new Supply(rqto.RequirementName);
        //            supply.Source = fertilizerInput.Fertilizer;
        //            supply.Amount = fertilizerInput.Amount;
        //            balanceItem.AddSupply(supply);
        //        }

        //        double val = balanceItem.FertilizerSupply;

        //        AddItem(balanceItem);

        //        if (water != null)
        //        {
        //            Supply supplyWater = new Supply(rqto.RequirementName);
        //            supplyWater.Source = water;
        //            supplyWater.Amount = 0;
        //            balanceItem.AddSupply(supplyWater);
        //        }

        //    }

        //    return getBalanceDataSet2();
        //}

        //private BalanceDs getBalanceDataSet2()
        //{
        //    BalanceDs balanceDs = new BalanceDs();

        //    if (BalanceItems.Count > 0)
        //    {
        //        BalanceDs.masterRow masterRequirementRow = balanceDs.master.NewmasterRow();
        //        masterRequirementRow.itemName = "Requirements";
        //        masterRequirementRow.caption = "Requirements";
        //        masterRequirementRow.ElectroConductivity = getECRequired();
        //        balanceDs.master.AddmasterRow(masterRequirementRow);

        //        BalanceDs.masterRow masterSupplyRow = balanceDs.master.NewmasterRow();
        //        masterSupplyRow.itemName = "Supplies";
        //        masterSupplyRow.caption = "Supplies";
        //        masterSupplyRow.ElectroConductivity = getECFertilizerSupply();
        //        balanceDs.master.AddmasterRow(masterSupplyRow);

        //        BalanceDs.detailRow detailRequirementRow = balanceDs.detail.NewdetailRow();
        //        detailRequirementRow.parentName = "Requirements";
        //        detailRequirementRow.itemName = "Requirements";
        //        detailRequirementRow.caption = "Requirements";

        //        balanceDs.detail.AdddetailRow(detailRequirementRow);

        //        foreach (CropSolutionRequirementItem rto in requirements.SolutionFeatures)
        //        {
        //            if (rto.RequirementName != "NH4" && rto.RequirementName != "Cl" && rto.RequirementName != "Na")
        //            {
        //                detailRequirementRow[rto.RequirementName] = rto.Value;
        //            }
        //        }

        //        foreach (BalanceItem balanceItem in BalanceItems)
        //        {
        //            foreach (Supply supply in balanceItem.FertilizerSupplies)
        //            {
        //                string sourceName = "";

        //                Type t = supply.Source.GetType();

        //                if (t.Equals(typeof(Fertilizer)))
        //                {
        //                    Fertilizer fertilizer = (Fertilizer)supply.Source;
        //                    sourceName = fertilizer.Name;
        //                }
        //                else
        //                {
        //                    Water water = (Water)supply.Source;
        //                    sourceName = water.Name;
        //                }

        //                BalanceDs.detailRow detailRow = balanceDs.detail.Where(x => x.itemName == sourceName).FirstOrDefault();

        //                if (detailRow == null)
        //                {
        //                    detailRow = balanceDs.detail.NewdetailRow();
        //                    detailRow.itemName = sourceName;
        //                    detailRow.caption = sourceName;
        //                    detailRow.parentName = "Supplies";
        //                    detailRow.Amount = supply.Amount;

        //                    balanceDs.detail.AdddetailRow(detailRow);
        //                }

        //                if (balanceItem.SolutionFeature.RequirementName != "NH4" && balanceItem.SolutionFeature.RequirementName != "Cl" && balanceItem.SolutionFeature.RequirementName != "Na")
        //                {
        //                    detailRow[balanceItem.SolutionFeature.RequirementName] = supply.SupplyValue;
        //                }
        //            }
        //        }

        //        BalanceDs.IndicatorsRow indicatorRow = balanceDs.Indicators.NewIndicatorsRow();

        //        indicatorRow.SumAnions = getSumAnions();
        //        indicatorRow.SumCations = getSumCations();
        //        indicatorRow.KNRel = getKNRel();

        //        balanceDs.Indicators.AddIndicatorsRow(indicatorRow);


        //        CalculatePercentages(balanceDs);
        //    }

        //    return balanceDs;
        //}

        //public void CalculatePercentages(BalanceDs balanceDs)
        //{
        //    foreach (DataColumn col in balanceDs.detail.Columns)
        //    {
        //        if (col.ColumnName.Contains("_p"))
        //        {
        //            BalanceDs.masterRow rqtoRow = balanceDs.master.Where(x => x.itemName == "Requirements").FirstOrDefault();

        //            double totalVal = Convert.ToDouble(rqtoRow[col.ColumnName.Replace("_p", "")]);

        //            foreach (BalanceDs.detailRow detail in balanceDs.detail.Rows)
        //            {
        //                double per = Convert.ToDouble(detail[col.ColumnName.Replace("_p", "")]) / totalVal * 100;
        //                detail[col.ColumnName] = per;
        //            }
        //        }
        //    }
        //}

        private List<SolutionFeatureEntity> getSolutionQualityFeatures()
        {
            List<SolutionFeatureEntity> output = new List<SolutionFeatureEntity>();

            foreach (SolutionFeatureInfo info in session.SolutionFeaturesInfo)
            {
                SolutionFeatureEntity newWaterQualityFeature = new SolutionFeatureEntity(info, this);
                int pos = session.SolutionFeaturesCategoryInfo.IndexOf(new SolutionFeatureCategoryInfo(info.CategoryName));
                newWaterQualityFeature.Category = new SolutionFeatureCategory(session.WaterFeaturesCategoryInfo[pos]);
                output.Add(newWaterQualityFeature);
            }

            return output;
        }
        public double GetValueFromFeature(string featureName)
        {
            return (double)this.GetType().GetProperty(featureName).GetValue(this, null);
        }
        public double GetValueFromMethod(string methodName)
        {
            object[] parameters = null;

            return (double)this.GetType().GetMethod(methodName).Invoke(this, parameters);
        }
    }
}
