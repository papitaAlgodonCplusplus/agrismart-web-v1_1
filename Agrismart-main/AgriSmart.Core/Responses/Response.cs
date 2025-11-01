namespace AgriSmart.Core.Responses
{
    public class Response<T>
    {
        public bool Success { get; set; }
        public string? Exception { get; set; }
        public T? Result { get; set; }

        public Response()
        {
        }

        public Response(T arg)
        {
            Result = arg;
            Success = true;
            Exception = null;
        }

        public Response(Exception ex)
        {
            Exception = ex.Message;
            Success = false;
            Result = default;
        }
    }
}
