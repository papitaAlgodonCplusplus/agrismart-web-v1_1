// Agrismart-main/AgriSmart.Core/Common/Response.cs
using System;

namespace AgriSmart.Core.Common
{
    public class Response<T>
    {
        public bool Success { get; set; }
        public T? Result { get; set; }
        public string? Exception { get; set; }
        public string? Message { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        public Response()
        {
        }
        
        public Response(T result)
        {
            Success = true;
            Result = result;
        }
        
        public Response(string error)
        {
            Success = false;
            Exception = error;
        }
        
        public static Response<T> CreateSuccess(T result, string? message = null)
        {
            return new Response<T>
            {
                Success = true,
                Result = result,
                Message = message
            };
        }
        
        public static Response<T> CreateError(string error, string? message = null)
        {
            return new Response<T>
            {
                Success = false,
                Exception = error,
                Message = message
            };
        }
    }
}
