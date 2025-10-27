// Agrismart-main/AgriSmart.Application.Agronomic/IrrigationPlanEntryHistories/Queries/GetAllIrrigationPlanEntryHistoriesQuery.cs
using AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Queries;
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Queries;
using MediatR;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Queries
{
    public class GetAllIrrigationPlanEntryHistoriesQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
    }

    public class GetIrrigationPlanEntryHistoryByIdQuery : IRequest<Response<IrrigationPlanEntryHistory>>
    {
        public int Id { get; set; }
    }

    public class GetIrrigationPlanEntryHistoriesByPlanIdQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
        public int IrrigationPlanId { get; set; }
    }

    public class GetIrrigationPlanEntryHistoriesByModeIdQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
        public int IrrigationModeId { get; set; }
    }

    public class GetIrrigationPlanEntryHistoriesByEntryIdQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
        public int IrrigationPlanEntryId { get; set; }
    }

    public class GetIrrigationPlanEntryHistoriesByDateRangeQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class GetIrrigationPlanEntryHistoriesByStatusQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
        public string ExecutionStatus { get; set; }
    }

    public class GetActiveIrrigationExecutionsQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
    }

    public class GetTodayIrrigationExecutionsQuery : IRequest<Response<List<IrrigationPlanEntryHistory>>>
    {
    }
}

// Agrismart-main/AgriSmart.Application.Agronomic/IrrigationPlanEntryHistories/Handlers/QueryHandlers.cs
namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Handlers
{
    public class GetAllIrrigationPlanEntryHistoriesHandler : IRequestHandler<GetAllIrrigationPlanEntryHistoriesQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetAllIrrigationPlanEntryHistoriesHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetAllIrrigationPlanEntryHistoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetAllAsync();
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoryByIdHandler : IRequestHandler<GetIrrigationPlanEntryHistoryByIdQuery, Response<IrrigationPlanEntryHistory>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoryByIdHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<IrrigationPlanEntryHistory>> Handle(GetIrrigationPlanEntryHistoryByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var history = await _queryRepository.GetByIdAsync(request.Id);
                if (history == null)
                {
                    return new Response<IrrigationPlanEntryHistory>("Irrigation plan entry history not found");
                }
                return new Response<IrrigationPlanEntryHistory>(history);
            }
            catch (Exception ex)
            {
                return new Response<IrrigationPlanEntryHistory>($"Error retrieving irrigation plan entry history: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoriesByPlanIdHandler : IRequestHandler<GetIrrigationPlanEntryHistoriesByPlanIdQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoriesByPlanIdHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetIrrigationPlanEntryHistoriesByPlanIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetByIrrigationPlanIdAsync(request.IrrigationPlanId);
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoriesByModeIdHandler : IRequestHandler<GetIrrigationPlanEntryHistoriesByModeIdQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoriesByModeIdHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetIrrigationPlanEntryHistoriesByModeIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetByIrrigationModeIdAsync(request.IrrigationModeId);
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoriesByEntryIdHandler : IRequestHandler<GetIrrigationPlanEntryHistoriesByEntryIdQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoriesByEntryIdHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetIrrigationPlanEntryHistoriesByEntryIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetByIrrigationPlanEntryIdAsync(request.IrrigationPlanEntryId);
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoriesByDateRangeHandler : IRequestHandler<GetIrrigationPlanEntryHistoriesByDateRangeQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoriesByDateRangeHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetIrrigationPlanEntryHistoriesByDateRangeQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetByDateRangeAsync(request.StartDate, request.EndDate);
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetIrrigationPlanEntryHistoriesByStatusHandler : IRequestHandler<GetIrrigationPlanEntryHistoriesByStatusQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetIrrigationPlanEntryHistoriesByStatusHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetIrrigationPlanEntryHistoriesByStatusQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetByExecutionStatusAsync(request.ExecutionStatus);
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving irrigation plan entry histories: {ex.Message}");
            }
        }
    }

    public class GetActiveIrrigationExecutionsHandler : IRequestHandler<GetActiveIrrigationExecutionsQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetActiveIrrigationExecutionsHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetActiveIrrigationExecutionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetActiveExecutionsAsync();
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving active irrigation executions: {ex.Message}");
            }
        }
    }

    public class GetTodayIrrigationExecutionsHandler : IRequestHandler<GetTodayIrrigationExecutionsQuery, Response<List<IrrigationPlanEntryHistory>>>
    {
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public GetTodayIrrigationExecutionsHandler(IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _queryRepository = queryRepository;
        }

        public async Task<Response<List<IrrigationPlanEntryHistory>>> Handle(GetTodayIrrigationExecutionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var histories = await _queryRepository.GetTodayExecutionsAsync();
                return new Response<List<IrrigationPlanEntryHistory>>(histories);
            }
            catch (Exception ex)
            {
                return new Response<List<IrrigationPlanEntryHistory>>($"Error retrieving today's irrigation executions: {ex.Message}");
            }
        }
    }
}