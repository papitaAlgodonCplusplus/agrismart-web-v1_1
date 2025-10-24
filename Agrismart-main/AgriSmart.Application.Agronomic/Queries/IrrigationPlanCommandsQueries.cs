using AgriSmart.Core.Responses;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.Commands
{
    using AgriSmart.Application.Agronomic.Responses.Commands;

    // Create Command
    public class CreateIrrigationPlanCommand : IRequest<Response<CreateIrrigationPlanResponse>>
    {
        public string Name { get; set; } = string.Empty;
        public int DayMask { get; set; }
        public bool Active { get; set; } = true;
        public int CreatedBy { get; set; }
    }

    // Update Command
    public class UpdateIrrigationPlanCommand : IRequest<Response<UpdateIrrigationPlanResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DayMask { get; set; }
        public bool Active { get; set; }
        public int UpdatedBy { get; set; }
    }

    // Delete Command
    public class DeleteIrrigationPlanCommand : IRequest<Response<DeleteIrrigationPlanResponse>>
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Queries
{
    using AgriSmart.Application.Agronomic.Responses.Queries;

    // Get All Query
    public class GetAllIrrigationPlansQuery : IRequest<Response<GetAllIrrigationPlansResponse>>
    {
    }

    // Get By Id Query
    public class GetIrrigationPlanByIdQuery : IRequest<Response<GetIrrigationPlanByIdResponse>>
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class CreateIrrigationPlanResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DayMask { get; set; }
    }

    public class UpdateIrrigationPlanResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DayMask { get; set; }
    }

    public class DeleteIrrigationPlanResponse
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    using System.Collections.Generic;

    public class GetAllIrrigationPlansResponse
    {
        public List<IrrigationPlanDto> IrrigationPlans { get; set; } = new List<IrrigationPlanDto>();
    }

    public class GetIrrigationPlanByIdResponse
    {
        public IrrigationPlanDto IrrigationPlan { get; set; }
    }

    public class IrrigationPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DayMask { get; set; }
        public bool Active { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}