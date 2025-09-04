using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateDropperHandler : IRequestHandler<CreateDropperCommand, Response<CreateDropperResponse>>
    {
        private readonly IDropperCommandRepository _dropperCommandRepository;

        public CreateDropperHandler(IDropperCommandRepository dropperCommandRepository)
        {
            _dropperCommandRepository = dropperCommandRepository;            
        }

        public async Task<Response<CreateDropperResponse>> Handle(CreateDropperCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateDropperValidator validator = new CreateDropperValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateDropperResponse>(new Exception(errors.ToString()));
                }

                Dropper newDropper = AgronomicMapper.Mapper.Map<Dropper>(command);

                newDropper.CreatedBy = _dropperCommandRepository.GetSessionUserId();
                newDropper.Active = true;

                var createDropperResult = await _dropperCommandRepository.CreateAsync(newDropper);

                if (createDropperResult != null)
                {
                    CreateDropperResponse createDropperResponse = AgronomicMapper.Mapper.Map<CreateDropperResponse>(createDropperResult);

                    return new Response<CreateDropperResponse>(createDropperResponse);
                }
                return new Response<CreateDropperResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateDropperResponse>(ex);
            }
        }
    }
}
