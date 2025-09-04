using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllInputPresentationsResponse
    {
        public List<InputPresentationModel>? InputPresentations { get; set; }
    }
}
