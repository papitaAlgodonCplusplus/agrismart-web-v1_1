using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateWaterHandler : IRequestHandler<UpdateWaterCommand, Response<UpdateWaterResponse>>
    {
        private readonly IWaterCommandRepository _waterCommandRepository;
        private readonly IWaterQueryRepository _waterQueryRepository;

        public UpdateWaterHandler(IWaterCommandRepository waterCommandRepository, IWaterQueryRepository waterQueryRepository)
        {
            _waterCommandRepository = waterCommandRepository;
            _waterQueryRepository = waterQueryRepository;
        }

        public async Task<Response<UpdateWaterResponse>> Handle(UpdateWaterCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateWaterValidator validator = new UpdateWaterValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateWaterResponse>(new Exception(errors.ToString()));
                }

                Water getResult = await _waterQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Active = command.Active;
                }

                Water updateWaterResult = await _waterCommandRepository.UpdateAsync(getResult);

                if (updateWaterResult != null)
                {
                    UpdateWaterResponse updateWaterResponse = new UpdateWaterResponse()
                    {
                        Id = updateWaterResult.Id,
                        Name = updateWaterResult.Name,
                        Active = updateWaterResult.Active
                    };

                    return new Response<UpdateWaterResponse>(updateWaterResponse);
                }
                return new Response<UpdateWaterResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateWaterResponse>(ex);
            }
        }
    }
}