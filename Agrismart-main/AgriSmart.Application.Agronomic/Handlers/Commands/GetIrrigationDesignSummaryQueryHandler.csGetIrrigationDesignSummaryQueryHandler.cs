
// Agrismart-main/AgriSmart.Application.Agronomic/Handlers/Queries/
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.DTOs;
using AgriSmart.Infrastructure.Data;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetIrrigationDesignSummaryQueryHandler : IRequestHandler<GetIrrigationDesignSummaryQuery, IrrigationDesignSummaryDto>
    {
        private readonly AgriSmartContext _context;
        private readonly IMapper _mapper;

        public GetIrrigationDesignSummaryQueryHandler(AgriSmartContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IrrigationDesignSummaryDto> Handle(GetIrrigationDesignSummaryQuery request, CancellationToken cancellationToken)
        {
            var query = _context.IrrigationEngineeringDesigns.AsQueryable();

            // Apply filters
            if (!request.IncludeInactive)
                query = query.Where(d => d.IsActive);

            if (request.ClientId.HasValue)
                query = query.Where(d => d.ClientId == request.ClientId.Value);

            if (request.FarmId.HasValue)
                query = query.Where(d => d.FarmId == request.FarmId.Value);

            if (request.FromDate.HasValue)
                query = query.Where(d => d.CreatedAt >= request.FromDate.Value);

            if (request.ToDate.HasValue)
                query = query.Where(d => d.CreatedAt <= request.ToDate.Value);

            var designs = await query.ToListAsync(cancellationToken);

            var summary = new IrrigationDesignSummaryDto
            {
                TotalDesigns = designs.Count,
                ActiveDesigns = designs.Count(d => d.IsActive),
                CompletedDesigns = designs.Count(d => d.Status == "completed" || d.Status == "approved"),
                DesignsRequiringRecalculation = designs.Count(d => d.RequiresRecalculation && d.IsActive),
                TotalAreaDesigned = designs.Where(d => d.IsActive).Sum(d => d.TotalArea),
                TotalProjectValue = designs.Where(d => d.IsActive).Sum(d => d.TotalProjectCost)
            };

            // Calculate averages (avoiding division by zero)
            var activeDesignsWithArea = designs.Where(d => d.IsActive && d.TotalArea > 0).ToList();
            var activeDesignsWithCost = designs.Where(d => d.IsActive && d.TotalProjectCost > 0).ToList();
            var activeDesignsWithEfficiency = designs.Where(d => d.IsActive && d.ApplicationEfficiency > 0).ToList();

            summary.AverageCostPerSquareMeter = activeDesignsWithCost.Any() && activeDesignsWithArea.Any()
                ? activeDesignsWithCost.Where(d => d.TotalArea > 0).Average(d => d.TotalProjectCost / d.TotalArea)
                : 0;

            summary.AverageEfficiency = activeDesignsWithEfficiency.Any()
                ? activeDesignsWithEfficiency.Average(d => d.ApplicationEfficiency)
                : 0;

            // Design type statistics
            summary.DesignTypeStats = designs
                .Where(d => d.IsActive)
                .GroupBy(d => d.DesignType)
                .Select(g => new DesignTypeStatDto
                {
                    DesignType = g.Key,
                    Count = g.Count(),
                    TotalArea = g.Sum(d => d.TotalArea),
                    AverageCost = g.Where(d => d.TotalProjectCost > 0).Any() 
                        ? g.Where(d => d.TotalProjectCost > 0).Average(d => d.TotalProjectCost)
                        : 0
                })
                .ToList();

            // Monthly activity
            summary.MonthlyActivity = designs
                .Where(d => d.IsActive)
                .GroupBy(d => new { d.CreatedAt.Year, d.CreatedAt.Month })
                .Select(g => new MonthlyDesignActivityDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    MonthName = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                    DesignsCreated = g.Count(),
                    DesignsCompleted = g.Count(d => d.Status == "completed" || d.Status == "approved"),
                    TotalAreaDesigned = g.Sum(d => d.TotalArea)
                })
                .OrderBy(m => m.Year)
                .ThenBy(m => m.Month)
                .ToList();

            return summary;
        }
    }
}
