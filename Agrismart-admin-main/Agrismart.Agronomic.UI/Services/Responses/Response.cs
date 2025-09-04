namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record Response<T>
    {
        public bool Success { get; set; }
        public string? Exception { get; set; }
        public T? Result { get; set; }
    }
}
