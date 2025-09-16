using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using AgriSmart.Infrastructure.Data;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateIrrigationEngineeringDesignCommandHandler : IRequestHandler<CreateIrrigationEngineeringDesignCommand, IrrigationEngineeringDesignDto>
    {
        private readonly AgriSmartContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CreateIrrigationEngineeringDesignCommandHandler> _logger;

        public CreateIrrigationEngineeringDesignCommandHandler(
            AgriSmartContext context,
            IMapper mapper,
            ILogger<CreateIrrigationEngineeringDesignCommandHandler> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IrrigationEngineeringDesignDto> Handle(CreateIrrigationEngineeringDesignCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Creating new irrigation engineering design: {Name}", request.Name);

                // Map command to entity
                var design = _mapper.Map<IrrigationEngineeringDesign>(request);

                // Set metadata
                design.CreatedAt = DateTime.UtcNow;
                design.CreatedBy = request.CreatedBy;
                design.IsActive = true;
                design.RequiresRecalculation = true;
                design.Status = "draft";
                design.Version = "1.0";

                // Add to context and save
                _context.IrrigationEngineeringDesigns.Add(design);
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Successfully created irrigation engineering design with ID: {Id}", design.Id);

                // Map entity back to DTO
                var result = _mapper.Map<IrrigationEngineeringDesignDto>(design);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating irrigation engineering design: {Name}", request.Name);
                throw;
            }
        }
    }
}