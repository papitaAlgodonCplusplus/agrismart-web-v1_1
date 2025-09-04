namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public class Response<T>
    {
        public bool Success { get; set; }
        public string? Exception { get; set; }
        public T? Result { get; set; }
    }
}
