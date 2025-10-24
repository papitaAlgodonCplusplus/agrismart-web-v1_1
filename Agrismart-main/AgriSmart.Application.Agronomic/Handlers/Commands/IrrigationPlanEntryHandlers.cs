using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateIrrigationPlanEntryHandler : IRequestHandler<CreateIrrigationPlanEntryCommand, Response<CreateIrrigationPlanEntryResponse>>
    {
        private readonly IIrrigationPlanEntryCommandRepository _commandRepository;

        public CreateIrrigationPlanEntryHandler(IIrrigationPlanEntryCommandRepository commandRepository)
        {
            _commandRepository = commandRepository;
        }

        public async Task<Response<CreateIrrigationPlanEntryResponse>> Handle(CreateIrrigationPlanEntryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var entry = new IrrigationPlanEntry
                {
                    IrrigationPlanId = command.IrrigationPlanId,
                    IrrigationModeId = command.IrrigationModeId,
                    StartTime = command.StartTime,
                    Duration = command.Duration,
                    WStart = command.WStart,
                    WEnd = command.WEnd,
                    Frequency = command.Frequency,
                    Sequence = command.Sequence,
                    Active = command.Active,
                    CreatedBy = command.CreatedBy,
                    DateCreated = DateTime.UtcNow
                };

                var result = await _commandRepository.AddAsync(entry);

                return new Response<CreateIrrigationPlanEntryResponse>(new CreateIrrigationPlanEntryResponse
                {
                    Id = result.Id,
                    IrrigationPlanId = result.IrrigationPlanId,
                    IrrigationModeId = result.IrrigationModeId
                });
            }
            catch (Exception ex)
            {
                return new Response<CreateIrrigationPlanEntryResponse>(ex);
            }
        }
    }

    public class UpdateIrrigationPlanEntryHandler : IRequestHandler<UpdateIrrigationPlanEntryCommand, Response<UpdateIrrigationPlanEntryResponse>>
    {
        private readonly IIrrigationPlanEntryCommandRepository _commandRepository;
        private readonly IIrrigationPlanEntryQueryRepository _queryRepository;

        public UpdateIrrigationPlanEntryHandler(
            IIrrigationPlanEntryCommandRepository commandRepository,
            IIrrigationPlanEntryQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateIrrigationPlanEntryResponse>> Handle(UpdateIrrigationPlanEntryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var entry = await _queryRepository.GetByIdAsync(command.Id);
                if (entry == null)
                    return new Response<UpdateIrrigationPlanEntryResponse>(new Exception("IrrigationPlanEntry not found"));

                entry.IrrigationPlanId = command.IrrigationPlanId;
                entry.IrrigationModeId = command.IrrigationModeId;
                entry.StartTime = command.StartTime;
                entry.Duration = command.Duration;
                entry.WStart = command.WStart;
                entry.WEnd = command.WEnd;
                entry.Frequency = command.Frequency;
                entry.Sequence = command.Sequence;
                entry.Active = command.Active;
                entry.UpdatedBy = command.UpdatedBy;
                entry.DateUpdated = DateTime.UtcNow;

                var result = await _commandRepository.UpdateAsync(entry);

                return new Response<UpdateIrrigationPlanEntryResponse>(new UpdateIrrigationPlanEntryResponse
                {
                    Id = result.Id,
                    IrrigationPlanId = result.IrrigationPlanId,
                    IrrigationModeId = result.IrrigationModeId
                });
            }
            catch (Exception ex)
            {
                return new Response<UpdateIrrigationPlanEntryResponse>(ex);
            }
        }
    }

    public class DeleteIrrigationPlanEntryHandler : IRequestHandler<DeleteIrrigationPlanEntryCommand, Response<DeleteIrrigationPlanEntryResponse>>
    {
        private readonly IIrrigationPlanEntryCommandRepository _commandRepository;
        private readonly IIrrigationPlanEntryQueryRepository _queryRepository;

        public DeleteIrrigationPlanEntryHandler(
            IIrrigationPlanEntryCommandRepository commandRepository,
            IIrrigationPlanEntryQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<DeleteIrrigationPlanEntryResponse>> Handle(DeleteIrrigationPlanEntryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var entry = await _queryRepository.GetByIdAsync(command.Id);
                if (entry == null)
                    return new Response<DeleteIrrigationPlanEntryResponse>(new Exception("IrrigationPlanEntry not found"));

                await _commandRepository.DeleteAsync(entry);

                return new Response<DeleteIrrigationPlanEntryResponse>(new DeleteIrrigationPlanEntryResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteIrrigationPlanEntryResponse>(ex);
            }
        }
    }
}

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllIrrigationPlanEntriesHandler : IRequestHandler<GetAllIrrigationPlanEntriesQuery, Response<GetAllIrrigationPlanEntriesResponse>>
    {
        private readonly IIrrigationPlanEntryQueryRepository _queryRepository;

        public GetAllIrrigationPlanEntriesHandler(IIrrigationPlanEntryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetAllIrrigationPlanEntriesResponse>> Handle(GetAllIrrigationPlanEntriesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var entries = query.IrrigationPlanId.HasValue
                    ? await _queryRepository.GetByIrrigationPlanIdAsync(query.IrrigationPlanId.Value)
                    : query.IrrigationModeId.HasValue
                        ? await _queryRepository.GetByIrrigationModeIdAsync(query.IrrigationModeId.Value)
                        : await _queryRepository.GetAllAsync();

                return new Response<GetAllIrrigationPlanEntriesResponse>(new GetAllIrrigationPlanEntriesResponse
                {
                    IrrigationPlanEntries = entries.Select(x => new IrrigationPlanEntryDto
                    {
                        Id = x.Id,
                        IrrigationPlanId = x.IrrigationPlanId,
                        IrrigationPlanName = x.IrrigationPlan?.Name ?? "",
                        IrrigationModeId = x.IrrigationModeId,
                        IrrigationModeName = x.IrrigationMode?.Name ?? "",
                        StartTime = x.StartTime,
                        Duration = x.Duration,
                        WStart = x.WStart,
                        WEnd = x.WEnd,
                        Frequency = x.Frequency,
                        Sequence = x.Sequence,
                        Active = x.Active,
                        DateCreated = x.DateCreated,
                        DateUpdated = x.DateUpdated,
                        CreatedBy = x.CreatedBy,
                        UpdatedBy = x.UpdatedBy
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return new Response<GetAllIrrigationPlanEntriesResponse>(ex);
            }
        }
    }

    public class GetIrrigationPlanEntryByIdHandler : IRequestHandler<GetIrrigationPlanEntryByIdQuery, Response<GetIrrigationPlanEntryByIdResponse>>
    {
        private readonly IIrrigationPlanEntryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryByIdHandler(IIrrigationPlanEntryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetIrrigationPlanEntryByIdResponse>> Handle(GetIrrigationPlanEntryByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var entry = await _queryRepository.GetByIdAsync(query.Id);
                if (entry == null)
                    return new Response<GetIrrigationPlanEntryByIdResponse>(new Exception("IrrigationPlanEntry not found"));

                return new Response<GetIrrigationPlanEntryByIdResponse>(new GetIrrigationPlanEntryByIdResponse
                {
                    IrrigationPlanEntry = new IrrigationPlanEntryDto
                    {
                        Id = entry.Id,
                        IrrigationPlanId = entry.IrrigationPlanId,
                        IrrigationPlanName = entry.IrrigationPlan?.Name ?? "",
                        IrrigationModeId = entry.IrrigationModeId,
                        IrrigationModeName = entry.IrrigationMode?.Name ?? "",
                        StartTime = entry.StartTime,
                        Duration = entry.Duration,
                        WStart = entry.WStart,
                        WEnd = entry.WEnd,
                        Frequency = entry.Frequency,
                        Sequence = entry.Sequence,
                        Active = entry.Active,
                        DateCreated = entry.DateCreated,
                        DateUpdated = entry.DateUpdated,
                        CreatedBy = entry.CreatedBy,
                        UpdatedBy = entry.UpdatedBy
                    }
                });
            }
            catch (Exception ex)
            {
                return new Response<GetIrrigationPlanEntryByIdResponse>(ex);
            }
        }
    }
}