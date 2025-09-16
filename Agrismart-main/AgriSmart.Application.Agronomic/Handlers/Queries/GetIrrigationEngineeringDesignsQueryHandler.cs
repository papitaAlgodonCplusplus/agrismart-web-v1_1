using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using AgriSmart.Infrastructure.Data;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetIrrigationEngineeringDesignsQueryHandler : IRequestHandler<GetIrrigationEngineeringDesignsQuery, List<IrrigationEngineeringDesignDto>>
    {
        private readonly AgriSmartContext _context;
        private readonly IMapper _mapper;

        public GetIrrigationEngineeringDesignsQueryHandler(AgriSmartContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<IrrigationEngineeringDesignDto>> Handle(GetIrrigationEngineeringDesignsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _context.Set<IrrigationEngineeringDesign>()
                    .Include(d => d.Client)
                    .Include(d => d.Farm)
                    .Include(d => d.CropProduction)
                    .Include(d => d.Container)
                    .Include(d => d.Dropper)
                    .Include(d => d.GrowingMedium)
                    .Include(d => d.Creator)
                    .AsQueryable();

                // Apply filters
                if (request.ClientId.HasValue)
                    query = query.Where(d => d.ClientId == request.ClientId.Value);

                if (request.FarmId.HasValue)
                    query = query.Where(d => d.FarmId == request.FarmId.Value);

                if (request.CropProductionId.HasValue)
                    query = query.Where(d => d.CropProductionId == request.CropProductionId.Value);

                if (!string.IsNullOrEmpty(request.DesignType))
                    query = query.Where(d => d.DesignType == request.DesignType);

                if (!string.IsNullOrEmpty(request.Status))
                    query = query.Where(d => d.Status == request.Status);

                if (request.IsActive.HasValue)
                    query = query.Where(d => d.IsActive == request.IsActive.Value);

                if (request.IsTemplate.HasValue)
                    query = query.Where(d => d.IsTemplate == request.IsTemplate.Value);

                if (request.RequiresRecalculation.HasValue)
                    query = query.Where(d => d.RequiresRecalculation == request.RequiresRecalculation.Value);

                if (request.CreatedAfter.HasValue)
                    query = query.Where(d => d.CreatedAt >= request.CreatedAfter.Value);

                if (request.CreatedBefore.HasValue)
                    query = query.Where(d => d.CreatedAt <= request.CreatedBefore.Value);

                if (request.MinArea.HasValue)
                    query = query.Where(d => d.TotalArea >= request.MinArea.Value);

                if (request.MaxArea.HasValue)
                    query = query.Where(d => d.TotalArea <= request.MaxArea.Value);

                if (request.MinCost.HasValue)
                    query = query.Where(d => d.TotalProjectCost >= request.MinCost.Value);

                if (request.MaxCost.HasValue)
                    query = query.Where(d => d.TotalProjectCost <= request.MaxCost.Value);

                if (request.IsHydraulicallyValid.HasValue)
                    query = query.Where(d => d.IsHydraulicallyValid == request.IsHydraulicallyValid.Value);

                if (request.IsEconomicallyViable.HasValue)
                    query = query.Where(d => d.IsEconomicallyViable == request.IsEconomicallyViable.Value);

                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    var searchTerm = request.SearchTerm.ToLower();
                    query = query.Where(d =>
                        d.Name.ToLower().Contains(searchTerm) ||
                        (d.Description != null && d.Description.ToLower().Contains(searchTerm)) ||
                        (d.Tags != null && d.Tags.ToLower().Contains(searchTerm)));
                }

                if (!string.IsNullOrEmpty(request.Tags))
                {
                    query = query.Where(d => d.Tags != null && d.Tags.Contains(request.Tags));
                }

                // Apply sorting
                if (!string.IsNullOrEmpty(request.SortBy))
                {
                    var isDescending = request.SortDirection?.ToLower() == "desc";

                    query = request.SortBy.ToLower() switch
                    {
                        "name" => isDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name),
                        "area" => isDescending ? query.OrderByDescending(d => d.TotalArea) : query.OrderBy(d => d.TotalArea),
                        "cost" => isDescending ? query.OrderByDescending(d => d.TotalProjectCost) : query.OrderBy(d => d.TotalProjectCost),
                        "status" => isDescending ? query.OrderByDescending(d => d.Status) : query.OrderBy(d => d.Status),
                        "createdat" => isDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt),
                        _ => isDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt)
                    };
                }
                else
                {
                    query = query.OrderByDescending(d => d.CreatedAt);
                }

                // Apply pagination
                var totalCount = await query.CountAsync(cancellationToken);
                var designs = await query
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                // Map to DTOs
                var designDtos = _mapper.Map<List<IrrigationEngineeringDesignDto>>(designs);

                return designDtos;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving irrigation engineering designs: {ex.Message}", ex);
            }
        }
    }
}