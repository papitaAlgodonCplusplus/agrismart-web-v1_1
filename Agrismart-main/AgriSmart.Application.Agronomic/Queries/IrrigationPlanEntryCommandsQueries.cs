using AgriSmart.Core.Responses;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.Commands
{
    using AgriSmart.Application.Agronomic.Responses.Commands;

    // Create Command
    public class CreateIrrigationPlanEntryCommand : IRequest<Response<CreateIrrigationPlanEntryResponse>>
    {
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public TimeSpan StartTime { get; set; }
        public int Duration { get; set; }
        public int? WStart { get; set; }
        public int? WEnd { get; set; }
        public int? Frequency { get; set; }
        public int Sequence { get; set; } = 1;
        public bool Active { get; set; } = true;
        public int CreatedBy { get; set; }
    }

    // Update Command
    public class UpdateIrrigationPlanEntryCommand : IRequest<Response<UpdateIrrigationPlanEntryResponse>>
    {
        public int Id { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public TimeSpan StartTime { get; set; }
        public int Duration { get; set; }
        public int? WStart { get; set; }
        public int? WEnd { get; set; }
        public int? Frequency { get; set; }
        public int Sequence { get; set; }
        public bool Active { get; set; }
        public int UpdatedBy { get; set; }
    }

    // Delete Command
    public class DeleteIrrigationPlanEntryCommand : IRequest<Response<DeleteIrrigationPlanEntryResponse>>
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Queries
{
    using AgriSmart.Application.Agronomic.Responses.Queries;

    // Get All Query
    public class GetAllIrrigationPlanEntriesQuery : IRequest<Response<GetAllIrrigationPlanEntriesResponse>>
    {
        public int? IrrigationPlanId { get; set; }
        public int? IrrigationModeId { get; set; }
    }

    // Get By Id Query
    public class GetIrrigationPlanEntryByIdQuery : IRequest<Response<GetIrrigationPlanEntryByIdResponse>>
    {
        public int Id { get; set; }
    }

    // Get By Plan Id Query
    public class GetIrrigationPlanEntriesByPlanIdQuery : IRequest<Response<GetIrrigationPlanEntriesResponse>>
    {
        public int IrrigationPlanId { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class CreateIrrigationPlanEntryResponse
    {
        public int Id { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public TimeSpan StartTime { get; set; }
        public int Duration { get; set; }
    }

    public class UpdateIrrigationPlanEntryResponse
    {
        public int Id { get; set; }
        public int IrrigationPlanId { get; set; }
        public int IrrigationModeId { get; set; }
        public TimeSpan StartTime { get; set; }
        public int Duration { get; set; }
    }

    public class DeleteIrrigationPlanEntryResponse
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    using System.Collections.Generic;

    public class GetAllIrrigationPlanEntriesResponse
    {
        public List<IrrigationPlanEntryDto> IrrigationPlanEntries { get; set; } = new List<IrrigationPlanEntryDto>();
    }

    public class GetIrrigationPlanEntryByIdResponse
    {
        public IrrigationPlanEntryDto IrrigationPlanEntry { get; set; }
    }

    public class GetIrrigationPlanEntriesResponse
    {
        public List<IrrigationPlanEntryDto> IrrigationPlanEntries { get; set; } = new List<IrrigationPlanEntryDto>();
    }

    public class IrrigationPlanEntryDto
    {
        public int Id { get; set; }
        public int IrrigationPlanId { get; set; }
        public string IrrigationPlanName { get; set; } = string.Empty;
        public int IrrigationModeId { get; set; }
        public string IrrigationModeName { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public int Duration { get; set; }
        public int? WStart { get; set; }
        public int? WEnd { get; set; }
        public int? Frequency { get; set; }
        public int Sequence { get; set; }
        public bool Active { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}
