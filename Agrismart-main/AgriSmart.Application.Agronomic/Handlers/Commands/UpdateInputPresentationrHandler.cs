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
    public class UpdateInputPresentationHandler : IRequestHandler<UpdateInputPresentationCommand, Response<UpdateInputPresentationResponse>>
    {
        private readonly IInputPresentationCommandRepository _inputPresentationCommandRepository;
        private readonly IInputPresentationQueryRepository _inputPresentationQueryRepository;

        public UpdateInputPresentationHandler(IInputPresentationCommandRepository inputPresentationCommandRepository, IInputPresentationQueryRepository inputPresentationQueryRepository)
        {
            _inputPresentationCommandRepository = inputPresentationCommandRepository;
            _inputPresentationQueryRepository = inputPresentationQueryRepository;
        }

        public async Task<Response<UpdateInputPresentationResponse>> Handle(UpdateInputPresentationCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateInputPresentationValidator validator = new UpdateInputPresentationValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateInputPresentationResponse>(new Exception(errors.ToString()));
                }

                InputPresentation getResult = await _inputPresentationQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.MeasurementUnitId = command.MeasurementUnitId;
                    getResult.Description = command.Description;
                    getResult.Quantity = command.Quantity;
                    getResult.Active = command.Active;
                }

                InputPresentation updateInputPresentationResult = await _inputPresentationCommandRepository.UpdateAsync(getResult);

                if (updateInputPresentationResult != null)
                {
                    UpdateInputPresentationResponse updateInputPresentationResponse = new UpdateInputPresentationResponse()
                    {
                        Name = updateInputPresentationResult.Name,
                        MeasurementUnitId = updateInputPresentationResult.MeasurementUnitId,
                        Description = updateInputPresentationResult.Description,
                        Quantity = updateInputPresentationResult.Quantity,
                        Active = updateInputPresentationResult.Active
                    };

                    return new Response<UpdateInputPresentationResponse>(updateInputPresentationResponse);
                }
                return new Response<UpdateInputPresentationResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateInputPresentationResponse>(ex);
            }
        }
    }
}
