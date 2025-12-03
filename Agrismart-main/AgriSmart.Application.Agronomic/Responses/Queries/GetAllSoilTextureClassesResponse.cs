using AgriSmart.Core.Entities;
using System.Collections.Generic;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllSoilTextureClassesResponse
    {
        public List<SoilTextureClass> TextureClasses { get; set; } = new List<SoilTextureClass>();
    }
}
