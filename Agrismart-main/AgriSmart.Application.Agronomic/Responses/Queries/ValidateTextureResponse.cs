namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record ValidateTextureResponse
    {
        public bool IsValid { get; set; }
        public string TextureClass { get; set; }
        public string ErrorMessage { get; set; }
    }
}
