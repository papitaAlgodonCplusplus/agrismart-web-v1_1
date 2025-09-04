using System;
using System.Collections.Generic;
using static AgriSmart.Tools.Common.Enums;
using static AgriSmart.Tools.Common.Constants;


namespace AgriSmart.Tools.Entities
{
    public abstract class PipelineEntity
    {
        public double PipelineLength { get; set; }
        public double NominalDiameter { get; set; }
        public double BetweenOutputDistance { get; set; }
        public PipelineMaterialType PipelineMaterialType { get; set; }
        public double OperatingPressure { get; set; }
        public double MaximunPressureLossAllowed { get; set; }
        public double GroudLevelDifference {  get; set; }
        public DropperEntity Dropper { get; set; }

        //outputs

        public double FlowRate { get { return getPipelineFlowRate(); } }
        public double Diameter { get { return getCalculatedDiameter(); } }
        public double DesingCriteria { get { return getDesignCriteria(); } }       
        public double HazenWilliamsLosses { get { return getHazenWilliamsLosses(); } }
        public double PressureRequired { get { return getPressureRequired(); } }

        public PipelineEntity(PipelineInputEntity input)
        {
            PipelineLength = input.PipelineLength;
            NominalDiameter = input.NominalDiameter;
            BetweenOutputDistance = input.BetweenOutputDistance;
            PipelineMaterialType = input.PipelineMaterialType;
            OperatingPressure = input.OperatingPressure;
            MaximunPressureLossAllowed = input.MaximunPressureLossAllowed;
            GroudLevelDifference = input.GroudLevelDifference;
        }

        public int getNumberOfOutputs()
        {
            return Convert.ToInt32(PipelineLength / BetweenOutputDistance);
        }
        double getF()
        {
            int numberOfOutputs = getNumberOfOutputs();

            double materialTypeCoefficient = FrictionCoefficientDic.GetValueOrDefault(PipelineMaterialType);
            // First term: (2 * N) / (2 * N - 1)
            double term1 = (2 * numberOfOutputs) / (2 * numberOfOutputs - 1);

            // Second term: 1 / (m + 1)
            double term2 = 1 / (materialTypeCoefficient + 1);

            // Third term: sqrt(m - 1) / (6 * N^2)
            double term3 = Math.Sqrt(materialTypeCoefficient - 1) / (6 * Math.Pow(numberOfOutputs, 2));

            // Combine terms to calculate F
            double F = term1 * (term2 + term3);

            return F;
        }
        double getCalculatedDiameter()
        {
            double frictionFactor = getF();

            double Hf = getHazenWilliamsLosses();

            // Constants
            double constant = 1.131e9;

            // Numerator: constant * Q^1.852 * L * F
            double numerator = constant * Math.Pow(getPipelineFlowRate(), 1.852) * PipelineLength * frictionFactor;

            // Denominator: Hf * C^1.852
            double denominator = Hf * Math.Pow(RoughnessCoefficientDic.GetValueOrDefault(PipelineMaterialType), 1.852);

            // Calculate D raised to the power of 0.205
            double D = Math.Pow(numerator / denominator, 0.205);

            return D;
        }
        public double getHazenWilliamsLosses()
        {
            int numberOfOutputs = Convert.ToInt32(PipelineLength / BetweenOutputDistance);

            double roughnessCoefficient = RoughnessCoefficientDic.GetValueOrDefault(PipelineMaterialType);

            double frictionFactor = getF();
            // Constants
            double constant = 1.131e9;

            // Calculate head loss (Hf)
            double headLoss = constant * Math.Pow(getPipelineFlowRate() / roughnessCoefficient, 1.852)
                                          * Math.Pow(NominalDiameter, -4.87)
                                          * PipelineLength * frictionFactor;

            return headLoss;
        }
        public abstract double getDesignCriteria();
        public abstract double getPipelineFlowRate();
        public abstract double getPermissibleLossAllowed();
        public abstract bool getAreLossesAcceptable();
        public abstract double getPressureRequired();
        double getPipelineTransversalArea()
        {
            double radio = NominalDiameter / 2;

            return (Math.PI * Math.Pow(radio / 1000, 2));
        }
        double getFlowVelocity()
        {
            return (getPipelineFlowRate() / getPipelineTransversalArea()) / 3600;
        }
        double getFulFillTime()
        {
            return (PipelineLength / getFlowVelocity()) / 60; 
        }
    }
}
