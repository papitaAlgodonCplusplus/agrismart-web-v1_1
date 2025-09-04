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
    public class UpdateFertilizerHandler : IRequestHandler<UpdateFertilizerCommand, Response<UpdateFertilizerResponse>>
    {
        private readonly IFertilizerCommandRepository _fertilizerCommandRepository;
        private readonly IFertilizerQueryRepository _fertilizerQueryRepository;

        public UpdateFertilizerHandler(IFertilizerCommandRepository fertilizerCommandRepository, IFertilizerQueryRepository fertilizerQueryRepository)
        {
            _fertilizerCommandRepository = fertilizerCommandRepository;
            _fertilizerQueryRepository = fertilizerQueryRepository;
        }

        public async Task<Response<UpdateFertilizerResponse>> Handle(UpdateFertilizerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateFertilizerValidator validator = new UpdateFertilizerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateFertilizerResponse>(new Exception(errors.ToString()));
                }

                Fertilizer getResult = await _fertilizerQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Manufacturer = command.Manufacturer;
                    getResult.IsLiquid = command.IsLiquid;
                    getResult.Active = command.Active;
                }

                Fertilizer updateFertilizerResult = await _fertilizerCommandRepository.UpdateAsync(getResult);

                if (updateFertilizerResult != null)
                {
                    UpdateFertilizerResponse updateFertilizerResponse = new UpdateFertilizerResponse()
                    {
                        Id = updateFertilizerResult.Id,
                        Name = updateFertilizerResult.Name,
                        Manufacturer = updateFertilizerResult.Manufacturer,
                        IsLiquid = updateFertilizerResult.IsLiquid,
                        Active = updateFertilizerResult.Active
                    };

                    return new Response<UpdateFertilizerResponse>(updateFertilizerResponse);
                }
                return new Response<UpdateFertilizerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateFertilizerResponse>(ex);
            }
        }
    }
}
