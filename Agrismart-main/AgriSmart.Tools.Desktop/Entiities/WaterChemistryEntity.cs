using AgriSmart.Core.Entities;
using AgriSmart.Tools.DataModels;
using System;

namespace AgriSmart.Tools.Entities
{
    public class WaterChemistryEntity : BaseEntity
    {
        public int WaterId { get; set; }

        private double _Ca;
        public double Ca { get => _Ca; set { _Ca = value; OnPropertyChanged(); } }

        private double _K;   
        public double K { get => _K; set { _K = value; OnPropertyChanged(); } }

        private double _Mg;
        public double Mg { get => _Mg; set { _Mg = value; OnPropertyChanged(); } }

        private double _Na;
        public double Na { get => _Na; set { _Na = value; OnPropertyChanged(); } }

        private double _NH4;
        public double NH4 { get => _NH4; set { _NH4 = value; OnPropertyChanged(); } }

        private double _Fe;
        public double Fe { get => _Fe; set { _Fe = value; OnPropertyChanged(); } }

        private double _Cu;
        public double Cu { get => _Cu; set { _Cu = value; OnPropertyChanged(); } }

        private double _Mn;
        public double Mn { get => _Mn; set { _Mn = value; OnPropertyChanged(); } }

        private double _Zn;
        public double Zn { get => _Zn; set { _Zn = value; OnPropertyChanged(); } }

        private double _NO3;
        public double NO3 { get => _NO3; set { _NO3 = value; OnPropertyChanged(); } }

        private double _SO4;
        public double SO4 { get => _SO4; set { _SO4 = value; OnPropertyChanged(); } }

        private double _Cl;
        public double Cl { get => _Cl; set { _Cl = value; OnPropertyChanged(); } }

        private double _B;
        public double B { get => _Cl; set { _Cl = value; OnPropertyChanged(); } }

        private double _H2PO4;
        public double H2PO4 { get => _H2PO4; set { _H2PO4 = value; OnPropertyChanged(); } }

        private double _HCO3;
        public double HCO3 { get => _HCO3; set { _HCO3 = value; OnPropertyChanged(); } }

        private double _BO4;
        public double BO4 { get => _BO4; set { _BO4 = value; OnPropertyChanged(); } }

        private double _MOO4;
        public double MOO4 { get => _MOO4; set { _MOO4 = value; OnPropertyChanged(); } }

        private double _EC;
        public double EC { get => _EC; set { _EC = value; OnPropertyChanged(); } }//electric conductivity

        private double _pH;
        public double pH { get => _pH; set { _pH = value; OnPropertyChanged(); } }

        private double _CO3;
        public double CO3 { get => _CO3; set { _CO3 = value; OnPropertyChanged(); } }

        private DateTime _AnalysisDate;
        public DateTime AnalysisDate { get => _AnalysisDate; set { _AnalysisDate = value; OnPropertyChanged(); } }

        public WaterChemistryEntity()
        {
        }

        public WaterChemistryEntity(WaterChemistryModel model)
        {
            this.CopyPropertiesFrom(model);
        }

        private double ConvertToMeqL(string feature)
        {
            double value = GetValueFromFeature(feature);

            return FormulaCalculations.ConvertToMeqL(value, feature);
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

        public string getIntepretation(string rule, double value)
        {
            System.Data.DataTable table = new System.Data.DataTable();

            string ruleToApply = rule.Replace("val", value.ToString());

            if (ruleToApply != string.Empty)
            {
                table.Columns.Clear();
                table.Columns.Add("", typeof(string));
                table.Columns[0].Expression = ruleToApply;

                System.Data.DataRow r = table.NewRow();
                table.Rows.Add(r);
                return (string)r[0];
            }
            else
                return "";
        }

        public double getSumAnions()
        {
            return ConvertToMeqL("HCO3") + ConvertToMeqL("Cl") + ConvertToMeqL("H2PO4") + ConvertToMeqL("NO3") + ConvertToMeqL("SO4");
        }

        public double getSumCations()
        {
            return NH4 + Ca + Mg + K + Na;
        }

        public double CationAnionDiff()
        {
            return getSumAnions() - getSumCations();
        }

        public double CationAnionDiffPer()
        {
            return (getSumAnions() - getSumCations()) / getSumCations() * 100;
        }

        public double AnionCationDiff()
        {
            return getSumCations() - getSumAnions();
        }

        public double AnionCationDiffPer()
        {
            return Math.Abs(getSumCations() - getSumAnions()) / getSumAnions() * 100;
        }

        public double GetSAR()
        {
            if (Ca + Mg == 0)
                return 0;
            else
                return Na / Math.Sqrt((Ca + Mg) / 2);
        }

        public double GetSARCorrected()
        {
            double CaCorrected = GetCaCorrected();
            if (CaCorrected + Mg == 0)
                return 0;
            else
                return Na / Math.Sqrt((CaCorrected + Mg) / 2);
        }

        public double GetPSI()
        {
            return Na / getSumCations() * 100;
        }

        public double GetCaMgRel()
        {
            if (Mg == 0)
                return 0;
            else
                return Ca / Mg;
        }

        public double GetCSR()
        {
            return HCO3 + CO3 - Ca - Mg;
        }

        public double GetBI()
        {
            return (NH4 + K + 2 * Ca + 2 * Mg + Na) - (HCO3 + Cl + NO3 + 2 * H2PO4 + 2 * SO4);
        }

        public double GetScott()
        {
            return (Na + Cl + SO4) / (Ca + Mg);
        }

        public double GetIcar()
        {
            return ((Na + Cl + SO4) / (Ca + Mg + K)) * 100;
        }

        public double GetIk()
        {
            double ce = (2 * Ca) + Mg + (2 * Na) + (Cl + SO4) / 2;
            return (Na + Cl + SO4) / (Ca + Mg + K) / Math.Sqrt(ce);
        }

        public double GetIas()
        {
            return (Na + Cl + SO4) / (Ca + Mg + K) - (HCO3 + CO3) / 2;
        }

        public double GetDt()
        {
            return ((Ca * 2.5) + (Mg * 4.14)) / 10;
        }

        public double GetElectrostaticaBalance()
        {
            return (NH4 + K + 2 * Ca + 2 * Mg + Na) - (HCO3 + Cl + NO3 + 2 * H2PO4 + 2 * SO4);
        }

        private int GetWaterSARClass()
        {
            double sar = GetSARCorrected();

            if (sar > -4.19516 * Math.Log(EC) + 45.837950)
            {
                return 4;
            }
            else if (sar > -3.2272 * Math.Log(EC) + 33.3457)
            {
                return 3;
            }
            else if (sar > -2.1731 * Math.Log(EC) + 20.28705)
            {
                return 2;
            }
            else
            {
                return 1;
            }
        }

        private int GetRiversideCode()
        {
            double waterSARClass = GetWaterSARClass();
            double waterSAR = GetSARCorrected();

            if (EC == 1 && (waterSARClass == 1 || waterSARClass == 2) || (EC == 2 && waterSARClass == 1))
            {
                return 1;
            }
            else if (EC == 6 && (waterSARClass == 2 || waterSARClass == 3) || (waterSARClass == 4 && (EC == 4 || EC == 5 || waterSARClass == 6) && waterSAR < 1.699 * Math.Log(EC) + 1.9164))
            {
                return 3;
            }
            else
            {
                return 2;
            }
        }

        public double GetCaCorrected()
        {
            double HCO3divCa2 = HCO3 / Ca;
            double PorcDeltaEC = 0;
            double ValorTablaInf = 0;
            double ValorTablaSup = 0;

            if (EC > 8)
            {
                double baseFormula = -0.000012 * Math.Pow(HCO3divCa2, 6) + 0.000443 * Math.Pow(HCO3divCa2, 5) - 0.00634 * Math.Pow(HCO3divCa2, 4) + 0.045642 * Math.Pow(HCO3divCa2, 3) - 0.177727 * Math.Pow(HCO3divCa2, 2) + 0.454639 * Math.Pow(HCO3divCa2, 1) + 1.759203;

                return baseFormula * Math.Pow(HCO3divCa2, -0.665);
            }
            else
            if (EC == 8)
            {
                return 2.706 * Math.Pow(HCO3divCa2, -0.66665);
            }
            else
            if (EC >= 6)
            {
                PorcDeltaEC = (EC - 6) / 2 * 100;
                ValorTablaInf = 2.58745 * Math.Pow(HCO3divCa2, -0.66685);
                ValorTablaSup = 2.70600 * Math.Pow(HCO3divCa2, -0.66665);
            }
            else
            if (EC >= 4)
            {
                PorcDeltaEC = (EC - 4) / 2 * 100;
                ValorTablaInf = 2.43962 * Math.Pow(HCO3divCa2, -0.66648);
                ValorTablaSup = 2.58745 * Math.Pow(HCO3divCa2, -0.66685);
            }
            else
            if (EC >= 3)
            {
                PorcDeltaEC = (EC - 3) / 1 * 100;
                ValorTablaInf = 2.34725 * Math.Pow(HCO3divCa2, -0.666287);
                ValorTablaSup = 2.43962 * Math.Pow(HCO3divCa2, -0.66648);
            }
            else
            if (EC >= 2)
            {
                PorcDeltaEC = (EC - 2) / 1 * 100;
                ValorTablaInf = 2.22882 * Math.Pow(HCO3divCa2, -0.66699);
                ValorTablaSup = 2.34725 * Math.Pow(HCO3divCa2, -0.666287);
            }
            else
            if (EC >= 1.5)
            {
                PorcDeltaEC = (EC - 1.5) / 0.5 * 100;
                ValorTablaInf = 2.16051 * Math.Pow(HCO3divCa2, -0.6665);
                ValorTablaSup = 2.22882 * Math.Pow(HCO3divCa2, -0.66699);
            }
            else
            if (EC >= 1)
            {
                PorcDeltaEC = (EC - 1) / 0.5 * 100;
                ValorTablaInf = 2.07381 * Math.Pow(HCO3divCa2, -0.6662);
                ValorTablaSup = 2.16051 * Math.Pow(HCO3divCa2, -0.6665);
            }
            else
            if (EC >= 0.7)
            {
                PorcDeltaEC = (EC - 0.7) / 0.3 * 100;
                ValorTablaInf = 2.00629 * Math.Pow(HCO3divCa2, -0.66677);
                ValorTablaSup = 2.07381 * Math.Pow(HCO3divCa2, -0.6662);
            }
            else
            if (EC >= 0.5)
            {
                PorcDeltaEC = (EC - 0.5) / 0.2 * 100;
                ValorTablaInf = 1.95356 * Math.Pow(HCO3divCa2, -0.66677);
                ValorTablaSup = 2.00629 * Math.Pow(HCO3divCa2, -0.6662);
            }
            else
            if (EC >= 0.3)
            {
                PorcDeltaEC = (EC - 0.3) / 0.2 * 100;
                ValorTablaInf = 1.89073 * Math.Pow(HCO3divCa2, -0.66632);
                ValorTablaSup = 1.95356 * Math.Pow(HCO3divCa2, -0.66692);
            }
            else
            if (EC >= 0.2)
            {
                PorcDeltaEC = (EC - 0.2) / 0.1 * 100;
                ValorTablaInf = 1.84596 * Math.Pow(HCO3divCa2, -0.6669);
                ValorTablaSup = 1.89073 * Math.Pow(HCO3divCa2, -0.66632);
            }
            else
            {
                PorcDeltaEC = (EC - 0.1) / 0.1 * 100;
                ValorTablaInf = 1.78991 * Math.Pow(HCO3divCa2, -0.6669);
                ValorTablaSup = 1.84596 * Math.Pow(HCO3divCa2, -0.6669);
            }

            return (PorcDeltaEC / 100 * (ValorTablaSup - ValorTablaInf)) + ValorTablaInf;
        }
    }
}
