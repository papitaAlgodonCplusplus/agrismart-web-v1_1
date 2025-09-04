namespace AgriSmart.Tools.Common
{
    public static class Enums
    {
        public enum ConcentrationUnit { mmolL, mgL };
        public enum Texture { Clay = 1, ClayLoam = 2, SandyClayLoam = 3, SiltyClayLoam = 4, SandyClay = 5, SiltyClay = 6, Silt = 7, SiltLoam = 8, Sand = 9, LoamySand = 10, SandyLoam = 11, Loam = 12, UnClassified = 13}
        public enum EToReferenceMethod { PenmanMontiehtFAO56, Hargreaves }
        public enum IrrigationSystem{ drip, sprinkle, furrow }
        public enum PipelineMaterialType { PVC, PE, HG }
    }
}
