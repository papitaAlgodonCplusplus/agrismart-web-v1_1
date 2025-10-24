using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Collections.Generic;

// ==================== COMMANDS AND QUERIES ====================
namespace AgriSmart.Application.Agronomic.Commands
{
    using AgriSmart.Application.Agronomic.Responses.Commands;

    public class CreateIrrigationModeCommand : IRequest<Response<CreateIrrigationModeResponse>>
    {
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; } = true;
        public int CreatedBy { get; set; }
    }

    public class UpdateIrrigationModeCommand : IRequest<Response<UpdateIrrigationModeResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; }
        public int UpdatedBy { get; set; }
    }

    public class DeleteIrrigationModeCommand : IRequest<Response<DeleteIrrigationModeResponse>>
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Queries
{
    using AgriSmart.Application.Agronomic.Responses.Queries;

    public class GetAllIrrigationModesQuery : IRequest<Response<GetAllIrrigationModesResponse>>
    {
    }

    public class GetIrrigationModeByIdQuery : IRequest<Response<GetIrrigationModeByIdResponse>>
    {
        public int Id { get; set; }
    }
}

// ==================== RESPONSES ====================
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class CreateIrrigationModeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateIrrigationModeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class DeleteIrrigationModeResponse
    {
        public int Id { get; set; }
    }
}

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public class GetAllIrrigationModesResponse
    {
        public List<IrrigationModeDto> IrrigationModes { get; set; } = new List<IrrigationModeDto>();
    }

    public class GetIrrigationModeByIdResponse
    {
        public IrrigationModeDto IrrigationMode { get; set; }
    }

    public class IrrigationModeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}

// ==================== COMMAND HANDLERS ====================
namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    using AgriSmart.Application.Agronomic.Commands;
    using AgriSmart.Application.Agronomic.Responses.Commands;
    using AgriSmart.Core.Entities;
    using AgriSmart.Core.Repositories.Commands;
    using AgriSmart.Core.Repositories.Queries;
    using System.Threading;
    using System.Threading.Tasks;

    public class CreateIrrigationModeHandler : IRequestHandler<CreateIrrigationModeCommand, Response<CreateIrrigationModeResponse>>
    {
        private readonly IIrrigationModeCommandRepository _commandRepository;

        public CreateIrrigationModeHandler(IIrrigationModeCommandRepository commandRepository)
        {
            _commandRepository = commandRepository;
        }

        public async Task<Response<CreateIrrigationModeResponse>> Handle(CreateIrrigationModeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationMode = new IrrigationMode
                {
                    Name = command.Name,
                    Active = command.Active,
                    CreatedBy = command.CreatedBy,
                    DateCreated = DateTime.UtcNow
                };

                var result = await _commandRepository.AddAsync(irrigationMode);

                return new Response<CreateIrrigationModeResponse>(new CreateIrrigationModeResponse
                {
                    Id = result.Id,
                    Name = result.Name
                });
            }
            catch (Exception ex)
            {
                return new Response<CreateIrrigationModeResponse>(ex);
            }
        }
    }

    public class UpdateIrrigationModeHandler : IRequestHandler<UpdateIrrigationModeCommand, Response<UpdateIrrigationModeResponse>>
    {
        private readonly IIrrigationModeCommandRepository _commandRepository;
        private readonly IIrrigationModeQueryRepository _queryRepository;

        public UpdateIrrigationModeHandler(
            IIrrigationModeCommandRepository commandRepository,
            IIrrigationModeQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateIrrigationModeResponse>> Handle(UpdateIrrigationModeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationMode = await _queryRepository.GetByIdAsync(command.Id);
                if (irrigationMode == null)
                    return new Response<UpdateIrrigationModeResponse>(new Exception("IrrigationMode not found"));

                irrigationMode.Name = command.Name;
                irrigationMode.Active = command.Active;
                irrigationMode.UpdatedBy = command.UpdatedBy;
                irrigationMode.DateUpdated = DateTime.UtcNow;

                var result = await _commandRepository.UpdateAsync(irrigationMode);

                return new Response<UpdateIrrigationModeResponse>(new UpdateIrrigationModeResponse
                {
                    Id = result.Id,
                    Name = result.Name
                });
            }
            catch (Exception ex)
            {
                return new Response<UpdateIrrigationModeResponse>(ex);
            }
        }
    }

    public class DeleteIrrigationModeHandler : IRequestHandler<DeleteIrrigationModeCommand, Response<DeleteIrrigationModeResponse>>
    {
        private readonly IIrrigationModeCommandRepository _commandRepository;
        private readonly IIrrigationModeQueryRepository _queryRepository;

        public DeleteIrrigationModeHandler(
            IIrrigationModeCommandRepository commandRepository,
            IIrrigationModeQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<DeleteIrrigationModeResponse>> Handle(DeleteIrrigationModeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationMode = await _queryRepository.GetByIdAsync(command.Id);
                if (irrigationMode == null)
                    return new Response<DeleteIrrigationModeResponse>(new Exception("IrrigationMode not found"));

                await _commandRepository.DeleteAsync(irrigationMode);

                return new Response<DeleteIrrigationModeResponse>(new DeleteIrrigationModeResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteIrrigationModeResponse>(ex);
            }
        }
    }
}

// ==================== QUERY HANDLERS ====================
namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    using AgriSmart.Application.Agronomic.Queries;
    using AgriSmart.Application.Agronomic.Responses.Queries;
    using AgriSmart.Core.Repositories.Queries;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    public class GetAllIrrigationModesHandler : IRequestHandler<GetAllIrrigationModesQuery, Response<GetAllIrrigationModesResponse>>
    {
        private readonly IIrrigationModeQueryRepository _queryRepository;

        public GetAllIrrigationModesHandler(IIrrigationModeQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetAllIrrigationModesResponse>> Handle(GetAllIrrigationModesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationModes = await _queryRepository.GetAllAsync();

                return new Response<GetAllIrrigationModesResponse>(new GetAllIrrigationModesResponse
                {
                    IrrigationModes = irrigationModes.Select(x => new IrrigationModeDto
                    {
                        Id = x.Id,
                        Name = x.Name,
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
                return new Response<GetAllIrrigationModesResponse>(ex);
            }
        }
    }

    public class GetIrrigationModeByIdHandler : IRequestHandler<GetIrrigationModeByIdQuery, Response<GetIrrigationModeByIdResponse>>
    {
        private readonly IIrrigationModeQueryRepository _queryRepository;

        public GetIrrigationModeByIdHandler(IIrrigationModeQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<GetIrrigationModeByIdResponse>> Handle(GetIrrigationModeByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationMode = await _queryRepository.GetByIdAsync(query.Id);
                if (irrigationMode == null)
                    return new Response<GetIrrigationModeByIdResponse>(new Exception("IrrigationMode not found"));

                return new Response<GetIrrigationModeByIdResponse>(new GetIrrigationModeByIdResponse
                {
                    IrrigationMode = new IrrigationModeDto
                    {
                        Id = irrigationMode.Id,
                        Name = irrigationMode.Name,
                        Active = irrigationMode.Active,
                        DateCreated = irrigationMode.DateCreated,
                        DateUpdated = irrigationMode.DateUpdated,
                        CreatedBy = irrigationMode.CreatedBy,
                        UpdatedBy = irrigationMode.UpdatedBy
                    }
                });
            }
            catch (Exception ex)
            {
                return new Response<GetIrrigationModeByIdResponse>(ex);
            }
        }
    }
}