using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    // Create Handler
    public class CreateIrrigationPlanHandler : IRequestHandler<CreateIrrigationPlanCommand, Response<CreateIrrigationPlanResponse>>
    {
        private readonly IIrrigationPlanCommandRepository _commandRepository;

        public CreateIrrigationPlanHandler(IIrrigationPlanCommandRepository commandRepository)
        {
            _commandRepository = commandRepository;
        }

        public async Task<Response<CreateIrrigationPlanResponse>> Handle(CreateIrrigationPlanCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationPlan = new IrrigationPlan
                {
                    Name = command.Name,
                    DayMask = command.DayMask,
                    Active = command.Active,
                    CreatedBy = command.CreatedBy,
                    DateCreated = DateTime.UtcNow
                };

                var result = await _commandRepository.AddAsync(irrigationPlan);

                var response = new CreateIrrigationPlanResponse
                {
                    Id = result.Id,
                    Name = result.Name,
                    DayMask = result.DayMask
                };

                return new Response<CreateIrrigationPlanResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<CreateIrrigationPlanResponse>(ex);
            }
        }
    }

    // Update Handler
    public class UpdateIrrigationPlanHandler : IRequestHandler<UpdateIrrigationPlanCommand, Response<UpdateIrrigationPlanResponse>>
    {
        private readonly IIrrigationPlanCommandRepository _commandRepository;
        private readonly IIrrigationPlanQueryRepository _queryRepository;

        public UpdateIrrigationPlanHandler(
            IIrrigationPlanCommandRepository commandRepository,
            IIrrigationPlanQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateIrrigationPlanResponse>> Handle(UpdateIrrigationPlanCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationPlan = await _queryRepository.GetByIdAsync(command.Id);

                if (irrigationPlan == null)
                    return new Response<UpdateIrrigationPlanResponse>(new Exception("IrrigationPlan not found"));

                irrigationPlan.Name = command.Name;
                irrigationPlan.DayMask = command.DayMask;
                irrigationPlan.Active = command.Active;
                irrigationPlan.UpdatedBy = command.UpdatedBy;
                irrigationPlan.DateUpdated = DateTime.UtcNow;

                var result = await _commandRepository.UpdateAsync(irrigationPlan);

                var response = new UpdateIrrigationPlanResponse
                {
                    Id = result.Id,
                    Name = result.Name,
                    DayMask = result.DayMask
                };

                return new Response<UpdateIrrigationPlanResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<UpdateIrrigationPlanResponse>(ex);
            }
        }
    }

    // Delete Handler
    public class DeleteIrrigationPlanHandler : IRequestHandler<DeleteIrrigationPlanCommand, Response<DeleteIrrigationPlanResponse>>
    {
        private readonly IIrrigationPlanCommandRepository _commandRepository;
        private readonly IIrrigationPlanQueryRepository _queryRepository;

        public DeleteIrrigationPlanHandler(
            IIrrigationPlanCommandRepository commandRepository,
            IIrrigationPlanQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<DeleteIrrigationPlanResponse>> Handle(DeleteIrrigationPlanCommand command, CancellationToken cancellationToken)
        {
            try
            {
                var irrigationPlan = await _queryRepository.GetByIdAsync(command.Id);

                if (irrigationPlan == null)
                    return new Response<DeleteIrrigationPlanResponse>(new Exception("IrrigationPlan not found"));

                await _commandRepository.DeleteAsync(irrigationPlan);

                var response = new DeleteIrrigationPlanResponse { Id = command.Id };
                return new Response<DeleteIrrigationPlanResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<DeleteIrrigationPlanResponse>(ex);
            }
        }
    }
}