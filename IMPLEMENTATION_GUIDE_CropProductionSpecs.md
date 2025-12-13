# CropProductionSpecs CRUD Implementation Guide

This guide contains all the necessary code to implement the complete CRUD system for CropProductionSpecs.

## Completed Steps ✅

1. ✅ SQL Table Creation
2. ✅ Entity Class
3. ✅ Commands (Create, Update, Delete)
4. ✅ Queries (GetAll, GetById)
5. ✅ Response Classes
6. ✅ Validators

## Remaining Implementation Steps

### 7. Repository Interfaces and Implementations

**File: `AgriSmart.Core/Repositories/Commands/ICropProductionSpecsCommandRepository.cs`**
```csharp
using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface ICropProductionSpecsCommandRepository
    {
        Task<CropProductionSpecs> CreateAsync(CropProductionSpecs entity);
        Task<CropProductionSpecs> UpdateAsync(CropProductionSpecs entity);
        Task<bool> DeleteAsync(int id, int deletedBy);
    }
}
```

**File: `AgriSmart.Core/Repositories/Query/ICropProductionSpecsQueryRepository.cs`**
```csharp
using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Query
{
    public interface ICropProductionSpecsQueryRepository
    {
        Task<IReadOnlyList<CropProductionSpecs>> GetAllAsync(bool includeInactives = false);
        Task<CropProductionSpecs?> GetByIdAsync(int id);
    }
}
```

**File: `AgriSmart.Infrastructure/Repositories/Command/CropProductionSpecsCommandRepository.cs`**
```csharp
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class CropProductionSpecsCommandRepository : ICropProductionSpecsCommandRepository
    {
        private readonly ApplicationDbContext _context;

        public CropProductionSpecsCommandRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CropProductionSpecs> CreateAsync(CropProductionSpecs entity)
        {
            entity.DateCreated = DateTime.UtcNow;
            entity.Active = true;

            await _context.CropProductionSpecs.AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<CropProductionSpecs> UpdateAsync(CropProductionSpecs entity)
        {
            entity.DateUpdated = DateTime.UtcNow;

            _context.CropProductionSpecs.Update(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(int id, int deletedBy)
        {
            var entity = await _context.CropProductionSpecs.FindAsync(id);
            if (entity == null)
                return false;

            // Soft delete
            entity.Active = false;
            entity.DateUpdated = DateTime.UtcNow;
            entity.UpdatedBy = deletedBy;

            _context.CropProductionSpecs.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
```

**File: `AgriSmart.Infrastructure/Repositories/Query/CropProductionSpecsQueryRepository.cs`**
```csharp
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CropProductionSpecsQueryRepository : ICropProductionSpecsQueryRepository
    {
        private readonly ApplicationDbContext _context;

        public CropProductionSpecsQueryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropProductionSpecs>> GetAllAsync(bool includeInactives = false)
        {
            var query = _context.CropProductionSpecs.AsQueryable();

            if (!includeInactives)
            {
                query = query.Where(x => x.Active);
            }

            return await query
                .OrderByDescending(x => x.DateCreated)
                .ToListAsync();
        }

        public async Task<CropProductionSpecs?> GetByIdAsync(int id)
        {
            return await _context.CropProductionSpecs
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
```

### 8. Command Handlers

**File: `AgriSmart.Application.Agronomic/Handlers/Commands/CreateCropProductionSpecsCommandHandler.cs`**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateCropProductionSpecsCommandHandler : IRequestHandler<CreateCropProductionSpecsCommand, Response<CreateCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _repository;

        public CreateCropProductionSpecsCommandHandler(ICropProductionSpecsCommandRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<CreateCropProductionSpecsResponse>> Handle(CreateCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var entity = new CropProductionSpecs
                {
                    Name = request.Name,
                    Description = request.Description,
                    BetweenRowDistance = request.BetweenRowDistance,
                    BetweenContainerDistance = request.BetweenContainerDistance,
                    BetweenPlantDistance = request.BetweenPlantDistance,
                    Area = request.Area,
                    ContainerVolume = request.ContainerVolume,
                    AvailableWaterPercentage = request.AvailableWaterPercentage,
                    CreatedBy = request.CreatedBy,
                    Active = true
                };

                var result = await _repository.CreateAsync(entity);

                var response = new CreateCropProductionSpecsResponse
                {
                    Id = result.Id,
                    Name = result.Name,
                    Description = result.Description,
                    BetweenRowDistance = result.BetweenRowDistance,
                    BetweenContainerDistance = result.BetweenContainerDistance,
                    BetweenPlantDistance = result.BetweenPlantDistance,
                    Area = result.Area,
                    ContainerVolume = result.ContainerVolume,
                    AvailableWaterPercentage = result.AvailableWaterPercentage,
                    Active = result.Active
                };

                return new Response<CreateCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<CreateCropProductionSpecsResponse>($"Error creating crop production specs: {ex.Message}");
            }
        }
    }
}
```

**File: `AgriSmart.Application.Agronomic/Handlers/Commands/UpdateCropProductionSpecsCommandHandler.cs`**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateCropProductionSpecsCommandHandler : IRequestHandler<UpdateCropProductionSpecsCommand, Response<UpdateCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _commandRepository;
        private readonly ICropProductionSpecsQueryRepository _queryRepository;

        public UpdateCropProductionSpecsCommandHandler(
            ICropProductionSpecsCommandRepository commandRepository,
            ICropProductionSpecsQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateCropProductionSpecsResponse>> Handle(UpdateCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var entity = await _queryRepository.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new Response<UpdateCropProductionSpecsResponse>("Crop production specs not found");
                }

                entity.Name = request.Name;
                entity.Description = request.Description;
                entity.BetweenRowDistance = request.BetweenRowDistance;
                entity.BetweenContainerDistance = request.BetweenContainerDistance;
                entity.BetweenPlantDistance = request.BetweenPlantDistance;
                entity.Area = request.Area;
                entity.ContainerVolume = request.ContainerVolume;
                entity.AvailableWaterPercentage = request.AvailableWaterPercentage;
                entity.Active = request.Active;
                entity.UpdatedBy = request.UpdatedBy;

                var result = await _commandRepository.UpdateAsync(entity);

                var response = new UpdateCropProductionSpecsResponse
                {
                    Id = result.Id,
                    Name = result.Name,
                    Description = result.Description,
                    BetweenRowDistance = result.BetweenRowDistance,
                    BetweenContainerDistance = result.BetweenContainerDistance,
                    BetweenPlantDistance = result.BetweenPlantDistance,
                    Area = result.Area,
                    ContainerVolume = result.ContainerVolume,
                    AvailableWaterPercentage = result.AvailableWaterPercentage,
                    Active = result.Active
                };

                return new Response<UpdateCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropProductionSpecsResponse>($"Error updating crop production specs: {ex.Message}");
            }
        }
    }
}
```

**File: `AgriSmart.Application.Agronomic/Handlers/Commands/DeleteCropProductionSpecsCommandHandler.cs`**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropProductionSpecsCommandHandler : IRequestHandler<DeleteCropProductionSpecsCommand, Response<DeleteCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _repository;

        public DeleteCropProductionSpecsCommandHandler(ICropProductionSpecsCommandRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<DeleteCropProductionSpecsResponse>> Handle(DeleteCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _repository.DeleteAsync(request.Id, request.DeletedBy);

                if (!result)
                {
                    return new Response<DeleteCropProductionSpecsResponse>("Crop production specs not found");
                }

                var response = new DeleteCropProductionSpecsResponse
                {
                    Id = request.Id
                };

                return new Response<DeleteCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropProductionSpecsResponse>($"Error deleting crop production specs: {ex.Message}");
            }
        }
    }
}
```

### 9. Query Handlers

**File: `AgriSmart.Application.Agronomic/Handlers/Queries/GetAllCropProductionSpecsQueryHandler.cs`**
```csharp
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropProductionSpecsQueryHandler : IRequestHandler<GetAllCropProductionSpecsQuery, Response<GetAllCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsQueryRepository _repository;

        public GetAllCropProductionSpecsQueryHandler(ICropProductionSpecsQueryRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<GetAllCropProductionSpecsResponse>> Handle(GetAllCropProductionSpecsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var specs = await _repository.GetAllAsync(request.IncludeInactives);

                var response = new GetAllCropProductionSpecsResponse
                {
                    CropProductionSpecs = specs
                };

                return new Response<GetAllCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropProductionSpecsResponse>($"Error retrieving crop production specs: {ex.Message}");
            }
        }
    }
}
```

**File: `AgriSmart.Application.Agronomic/Handlers/Queries/GetCropProductionSpecsByIdQueryHandler.cs`**
```csharp
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCropProductionSpecsByIdQueryHandler : IRequestHandler<GetCropProductionSpecsByIdQuery, Response<GetCropProductionSpecsByIdResponse>>
    {
        private readonly ICropProductionSpecsQueryRepository _repository;

        public GetCropProductionSpecsByIdQueryHandler(ICropProductionSpecsQueryRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<GetCropProductionSpecsByIdResponse>> Handle(GetCropProductionSpecsByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var specs = await _repository.GetByIdAsync(request.Id);

                if (specs == null)
                {
                    return new Response<GetCropProductionSpecsByIdResponse>("Crop production specs not found");
                }

                var response = new GetCropProductionSpecsByIdResponse
                {
                    CropProductionSpecs = specs
                };

                return new Response<GetCropProductionSpecsByIdResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetCropProductionSpecsByIdResponse>($"Error retrieving crop production specs: {ex.Message}");
            }
        }
    }
}
```

### 10. Controller

**File: `AgriSmart.Api.Agronomic/Controllers/CropProductionSpecsController.cs`**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CropProductionSpecsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CropProductionSpecsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllCropProductionSpecsResponse>>> Get([FromQuery] GetAllCropProductionSpecsQuery query)
        {
            if (query == null)
                query = new GetAllCropProductionSpecsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetCropProductionSpecsByIdResponse>>> GetById([FromRoute] GetCropProductionSpecsByIdQuery query)
        {
            if (query == null)
                query = new GetCropProductionSpecsByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateCropProductionSpecsResponse>>> Post(CreateCropProductionSpecsCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateCropProductionSpecsResponse>>> Put(UpdateCropProductionSpecsCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteCropProductionSpecsResponse>>> Delete([FromRoute] int Id, [FromQuery] int deletedBy)
        {
            var command = new DeleteCropProductionSpecsCommand { Id = Id, DeletedBy = deletedBy };
            var response = await _mediator.Send(command);

            if (response.Success) return Ok(response);
            if (response.Exception?.Contains("not found") == true) return NotFound(response);
            return BadRequest(response);
        }
    }
}
```

### 11. Register Services in DI Container

Add to your `Program.cs` or Startup configuration:

```csharp
// Add repository registrations
services.AddScoped<ICropProductionSpecsCommandRepository, CropProductionSpecsCommandRepository>();
services.AddScoped<ICropProductionSpecsQueryRepository, CropProductionSpecsQueryRepository>();
```

### 12. Add DbSet to ApplicationDbContext

**In `AgriSmart.Infrastructure/Data/ApplicationDbContext.cs`:**
```csharp
public DbSet<CropProductionSpecs> CropProductionSpecs { get; set; }
```

---

## Frontend Implementation (Angular)

See next section for complete Angular implementation.

