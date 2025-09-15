
// =============================================================================
// TEMPLATES QUERY HANDLER
// =============================================================================

// Agrismart-main/AgriSmart.Application.Agronomic/Handlers/Queries/
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.DTOs;
using AgriSmart.Infrastructure.Data;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetIrrigationDesignTemplatesQueryHandler : IRequestHandler<GetIrrigationDesignTemplatesQuery, List<IrrigationEngineeringDesignDto>>
    {
        private readonly AgriSmartContext _context;
        private readonly IMapper _mapper;

        public GetIrrigationDesignTemplatesQueryHandler(AgriSmartContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<IrrigationEngineeringDesignDto>> Handle(GetIrrigationDesignTemplatesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.IrrigationEngineeringDesigns
                .Include(d => d.Client)
                .Include(d => d.Farm)
                .Include(d => d.CropProduction)
                .Include(d => d.Container)
                .Include(d => d.Dropper)
                .Include(d => d.GrowingMedium)
                .Include(d => d.Creator)
                .Where(d => d.IsTemplate && d.IsActive);

            // Apply filters
            if (!string.IsNullOrEmpty(request.DesignType))
                query = query.Where(d => d.DesignType == request.DesignType);

            if (request.PublicOnly)
                query = query.Where(d => d.IsPublic);

            if (request.CreatedBy.HasValue)
                query = query.Where(d => d.CreatedBy == request.CreatedBy.Value);

            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                var searchLower = request.SearchTerm.ToLower();
                query = query.Where(d => d.Name.ToLower().Contains(searchLower) ||
                                        (d.Description != null && d.Description.ToLower().Contains(searchLower)) ||
                                        (d.Tags != null && d.Tags.ToLower().Contains(searchLower)));
            }

            var templates = await query
                .OrderBy(d => d.DesignType)
                .ThenBy(d => d.Name)
                .ToListAsync(cancellationToken);

            return _mapper.Map<List<IrrigationEngineeringDesignDto>>(templates);
        }
    }
}