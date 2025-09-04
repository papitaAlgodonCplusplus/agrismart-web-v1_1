namespace AgriSmart.Core.Calculations
{
    public interface IFertilizerCalculator
    {
        Task<int> EToCalculation(float temperatura, float humidity);
    }
}
