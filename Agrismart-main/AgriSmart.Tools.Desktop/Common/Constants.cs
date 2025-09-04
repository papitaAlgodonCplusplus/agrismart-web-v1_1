using System.Collections.Generic;
using static AgriSmart.Tools.Common.Enums;

namespace AgriSmart.Tools.Common
{
    public static class Constants
    {
        public static Dictionary<string, double> MolecularWeightDic = new Dictionary<string, double> {
            {"N",14.0067},
            {"P",30.9738},
            {"K",39.0980},
            {"Ca",40.080},
            {"Mg",24.305},
            {"S",32.064},
            {"B",10.810},
            {"Cu",63.540},
            {"Fe",55.847},
            {"Mn",54.938},
            {"Mo",95.940},
            {"Zn",65.370},
            {"Cl",35.453},
            {"Na",22.9898},
            {"C",12.01115},
            {"H",1.0080},
            {"O",15.9994},
            {"Si",28086}
        };

        public static double pHCOST = 6.35;

        public static Dictionary<string, double> ElectroConductivityCoefficientDic = new Dictionary<string, double> {
            {"HCO3",0.071},
            {"NO3",1},
            {"H2PO4",0.22},
            {"SO4",0.73},
            {"Cl",1.90},
            {"NH4",3.2},
            {"K",1.74},
            {"Ca",1.9},
            {"Mg",3.08},
            {"Na",2},
            {"Fe",0},
            {"B",0},
            {"Cu",0},
            {"Zn",0},
            {"Mn",0},
            {"Mo",0},
            };

        public static Dictionary<string, double> ValenciaDic = new Dictionary<string, double> {
            {"HCO3",1},
            {"NO3",1},
            {"H2PO4",2},
            {"SO4",2},
            {"Cl",1},
            {"NH4",1},
            {"K",1},
            {"Ca",2},
            {"Mg",2},
            {"Na",2},
            {"Fe",0},
            {"B",0},
            {"Cu",0},
            {"Zn",0},
            {"Mn",0},
            {"Mo",0},
        };

        public static Dictionary<string, bool> IsAnionDic = new Dictionary<string, bool> {
            {"HCO3",true},
            {"NO3",true},
            {"H2PO4",true},
            {"SO4",true},
            {"Cl",true},
            {"NH4",false},
            {"K",false},
            {"Ca",false},
            {"Mg",false},
            {"Na",false},
            {"Fe",false},
            {"B",true},
            {"Cu",false},
            {"Zn",false},
            {"Mn",false},
            {"Mo",true},
        };

        public static Dictionary<PipelineMaterialType, double> RoughnessCoefficientDic = new Dictionary<PipelineMaterialType, double> {
            { PipelineMaterialType.PVC,150},
            { PipelineMaterialType.PE,140},
            { PipelineMaterialType.HG,100}
        };

        public static Dictionary<PipelineMaterialType, double> FrictionCoefficientDic = new Dictionary<PipelineMaterialType, double> {
            { PipelineMaterialType.PVC,1.80},
            { PipelineMaterialType.PE,1.75},
            { PipelineMaterialType.HG,1.90}
        };

    }
}
