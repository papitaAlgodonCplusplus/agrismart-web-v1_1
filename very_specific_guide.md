# Very Specific Implementation Guide - Missing APIs Without Breaking Anything

## 🎯 Overview
This guide provides step-by-step instructions to implement missing DELETE endpoints and Crop PUT/POST methods without breaking existing functionality.

## 📋 What We're Implementing
- **27 missing DELETE endpoints** 
- **2 missing Crop endpoints** (POST, PUT)
- **Total: 29 new API methods**

---

## 🔧 PART 1: MISSING DELETE ENDPOINTS

### Step 1: Create Delete Command Models

Create these files in `AgriSmart.Application.Agronomic/Commands/`:

#### **1.1 DeleteFarmCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteFarmCommand : IRequest<Response<DeleteFarmResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.2 DeleteCompanyCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCompanyCommand : IRequest<Response<DeleteCompanyResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.3 DeleteUserCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteUserCommand : IRequest<Response<DeleteUserResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.4 DeleteCropCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropCommand : IRequest<Response<DeleteCropResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.5 DeleteDeviceCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteDeviceCommand : IRequest<Response<DeleteDeviceResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.6 DeleteProductionUnitCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteProductionUnitCommand : IRequest<Response<DeleteProductionUnitResponse>>
    {
        public int Id { get; set; }
    }
}
```

#### **1.7 Additional Delete Commands** (Follow same pattern)
Create these following the exact same pattern:
- `DeleteClientCommand.cs`
- `DeleteCropProductionCommand.cs`
- `DeleteCropProductionIrrigationSectorCommand.cs`
- `DeleteCropPhaseCommand.cs`
- `DeleteCropPhaseOptimalCommand.cs`
- `DeleteCatalogCommand.cs`
- `DeleteFertilizerCommand.cs`
- `DeleteFertilizerChemistryCommand.cs`
- `DeleteFertilizerInputCommand.cs`
- `DeleteWaterCommand.cs`
- `DeleteWaterChemistryCommand.cs`
- `DeleteSensorCommand.cs`
- `DeleteMeasurementVariableCommand.cs`
- `DeleteRelayModuleCommand.cs`
- `DeleteDropperCommand.cs`
- `DeleteAnalyticalEntityCommand.cs`
- `DeleteLicenseCommand.cs`
- `DeleteContainerCommand.cs`
- `DeleteGrowingMediumCommand.cs`
- `DeleteCalculationSettingCommand.cs`
- `DeleteIrrigationEventCommand.cs`

### Step 2: Create Delete Response Models

Create these files in `AgriSmart.Application.Agronomic/Responses/Commands/`:

#### **2.1 DeleteFarmResponse.cs**
```csharp
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteFarmResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Farm deleted successfully";
    }
}
```

#### **2.2 Additional Delete Responses** (Follow same pattern)
Create all response classes following the same pattern:
- `DeleteCompanyResponse.cs`
- `DeleteUserResponse.cs`
- `DeleteCropResponse.cs`
- `DeleteDeviceResponse.cs`
- `DeleteProductionUnitResponse.cs`
- ... (and all others listed in commands)

### Step 3: Create Delete Command Handlers

Create these files in `AgriSmart.Application.Agronomic/Handlers/Commands/`:

#### **3.1 DeleteFarmCommandHandler.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Data;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteFarmCommandHandler : IRequestHandler<DeleteFarmCommand, Response<DeleteFarmResponse>>
    {
        private readonly IAgriSmartDbContext _context;
        
        public DeleteFarmCommandHandler(IAgriSmartDbContext context)
        {
            _context = context;
        }
        
        public async Task<Response<DeleteFarmResponse>> Handle(DeleteFarmCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var farm = await _context.Farms.FindAsync(request.Id);
                if (farm == null)
                {
                    return new Response<DeleteFarmResponse> 
                    { 
                        Success = false, 
                        Exception = "Farm not found" 
                    };
                }
                
                // Soft delete by setting Active = false (preserves data integrity)
                farm.Active = false;
                await _context.SaveChangesAsync(cancellationToken);
                
                return new Response<DeleteFarmResponse> 
                { 
                    Success = true, 
                    Result = new DeleteFarmResponse { Id = request.Id } 
                };
            }
            catch (Exception ex)
            {
                return new Response<DeleteFarmResponse> 
                { 
                    Success = false, 
                    Exception = ex.Message 
                };
            }
        }
    }
}
```

#### **3.2 DeleteCompanyCommandHandler.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Data;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Response<DeleteCompanyResponse>>
    {
        private readonly IAgriSmartDbContext _context;
        
        public DeleteCompanyCommandHandler(IAgriSmartDbContext context)
        {
            _context = context;
        }
        
        public async Task<Response<DeleteCompanyResponse>> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var company = await _context.Companies.FindAsync(request.Id);
                if (company == null)
                {
                    return new Response<DeleteCompanyResponse> 
                    { 
                        Success = false, 
                        Exception = "Company not found" 
                    };
                }
                
                // Soft delete
                company.Active = false;
                await _context.SaveChangesAsync(cancellationToken);
                
                return new Response<DeleteCompanyResponse> 
                { 
                    Success = true, 
                    Result = new DeleteCompanyResponse { Id = request.Id } 
                };
            }
            catch (Exception ex)
            {
                return new Response<DeleteCompanyResponse> 
                { 
                    Success = false, 
                    Exception = ex.Message 
                };
            }
        }
    }
}
```

#### **3.3 Create All Other Delete Handlers**
Follow the exact same pattern for all remaining delete command handlers. Replace:
- `Company`/`Companies` with the appropriate entity name
- Table reference (`_context.Companies`) with correct DbSet
- Response type accordingly

### Step 4: Create Delete Validators

Create these files in `AgriSmart.Application.Agronomic/Validators/Commands/`:

#### **4.1 DeleteFarmValidator.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteFarmValidator : BaseValidator<DeleteFarmCommand>
    {
        public DeleteFarmValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteFarmCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}
```

#### **4.2 Create All Other Delete Validators**
Follow the same pattern for all delete validators.

### Step 5: Add DELETE Methods to Controllers

#### **5.1 Update FarmController.cs**
Add this method to `AgriSmart.API.Agronomic/Controllers/FarmController.cs`:

```csharp
/// <summary>
/// Delete a farm (soft delete)
/// </summary>
/// <param name="Id">Farm ID to delete</param>
/// <returns></returns>
[HttpDelete("{Id:int}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Response<DeleteFarmResponse>>> Delete([FromRoute] int Id)
{
    var command = new DeleteFarmCommand { Id = Id };
    var response = await _mediator.Send(command);

    if (response.Success)
        return Ok(response);

    if (response.Exception?.Contains("not found") == true)
        return NotFound(response);

    return BadRequest(response);
}
```

#### **5.2 Update CompanyController.cs**
Add these methods to the Company controller:

```csharp
/// <summary>
/// Create a new company
/// </summary>
/// <param name="command">Company creation data</param>
/// <returns></returns>
[HttpPost]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<Response<CreateCompanyResponse>>> Post(CreateCompanyCommand command)
{
    var response = await _mediator.Send(command);
    if (response.Success) return Ok(response);
    return BadRequest(response);
}

/// <summary>
/// Update an existing company
/// </summary>
/// <param name="command">Company update data</param>
/// <returns></returns>
[HttpPut]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<Response<UpdateCompanyResponse>>> Put(UpdateCompanyCommand command)
{
    var response = await _mediator.Send(command);
    if (response.Success) return Ok(response);
    return BadRequest(response);
}

/// <summary>
/// Delete a company (soft delete)
/// </summary>
/// <param name="Id">Company ID to delete</param>
/// <returns></returns>
[HttpDelete("{Id:int}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Response<DeleteCompanyResponse>>> Delete([FromRoute] int Id)
{
    var command = new DeleteCompanyCommand { Id = Id };
    var response = await _mediator.Send(command);

    if (response.Success) return Ok(response);
    if (response.Exception?.Contains("not found") == true) return NotFound(response);
    return BadRequest(response);
}
```

#### **5.3 Update UserController.cs**
Add these methods:

```csharp
/// <summary>
/// Update an existing user
/// </summary>
/// <param name="command">User update data</param>
/// <returns></returns>
[HttpPut]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<Response<UpdateUserResponse>>> Put(UpdateUserCommand command)
{
    var response = await _mediator.Send(command);
    if (response.Success) return Ok(response);
    return BadRequest(response);
}

/// <summary>
/// Delete a user (soft delete)
/// </summary>
/// <param name="Id">User ID to delete</param>
/// <returns></returns>
[HttpDelete("{Id:int}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Response<DeleteUserResponse>>> Delete([FromRoute] int Id)
{
    var command = new DeleteUserCommand { Id = Id };
    var response = await _mediator.Send(command);

    if (response.Success) return Ok(response);
    if (response.Exception?.Contains("not found") == true) return NotFound(response);
    return BadRequest(response);
}
```

---

## 🌾 PART 2: MISSING CROP PUT AND POST ENDPOINTS

### Step 6: Create Crop Command Models

#### **6.1 CreateCropCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropCommand : IRequest<Response<CreateCropResponse>>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; } = true;
    }
}
```

#### **6.2 UpdateCropCommand.cs**
```csharp
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCropCommand : IRequest<Response<UpdateCropResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
    }
}
```

### Step 7: Create Crop Response Models

#### **7.1 CreateCropResponse.cs**
```csharp
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class CreateCropResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public string Message { get; set; } = "Crop created successfully";
    }
}
```

#### **7.2 UpdateCropResponse.cs**
```csharp
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class UpdateCropResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public string Message { get; set; } = "Crop updated successfully";
    }
}
```

### Step 8: Create Crop Command Handlers

#### **8.1 CreateCropCommandHandler.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Data;
using AgriSmart.Core.Responses;
using AgriSmart.Domain.Agronomic.Entities;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateCropCommandHandler : IRequestHandler<CreateCropCommand, Response<CreateCropResponse>>
    {
        private readonly IAgriSmartDbContext _context;
        
        public CreateCropCommandHandler(IAgriSmartDbContext context)
        {
            _context = context;
        }
        
        public async Task<Response<CreateCropResponse>> Handle(CreateCropCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var crop = new Crop
                {
                    Name = request.Name,
                    Description = request.Description,
                    Active = request.Active
                };
                
                _context.Crops.Add(crop);
                await _context.SaveChangesAsync(cancellationToken);
                
                return new Response<CreateCropResponse> 
                { 
                    Success = true, 
                    Result = new CreateCropResponse 
                    { 
                        Id = crop.Id,
                        Name = crop.Name,
                        Description = crop.Description,
                        Active = crop.Active
                    } 
                };
            }
            catch (Exception ex)
            {
                return new Response<CreateCropResponse> 
                { 
                    Success = false, 
                    Exception = ex.Message 
                };
            }
        }
    }
}
```

#### **8.2 UpdateCropCommandHandler.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Data;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateCropCommandHandler : IRequestHandler<UpdateCropCommand, Response<UpdateCropResponse>>
    {
        private readonly IAgriSmartDbContext _context;
        
        public UpdateCropCommandHandler(IAgriSmartDbContext context)
        {
            _context = context;
        }
        
        public async Task<Response<UpdateCropResponse>> Handle(UpdateCropCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var crop = await _context.Crops.FindAsync(request.Id);
                if (crop == null)
                {
                    return new Response<UpdateCropResponse> 
                    { 
                        Success = false, 
                        Exception = "Crop not found" 
                    };
                }
                
                crop.Name = request.Name;
                crop.Description = request.Description;
                crop.Active = request.Active;
                
                await _context.SaveChangesAsync(cancellationToken);
                
                return new Response<UpdateCropResponse> 
                { 
                    Success = true, 
                    Result = new UpdateCropResponse 
                    { 
                        Id = crop.Id,
                        Name = crop.Name,
                        Description = crop.Description,
                        Active = crop.Active
                    } 
                };
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropResponse> 
                { 
                    Success = false, 
                    Exception = ex.Message 
                };
            }
        }
    }
}
```

### Step 9: Create Crop Validators

#### **9.1 CreateCropValidator.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropValidator : BaseValidator<CreateCropCommand>
    {
        public CreateCropValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropCommand command)
        {
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Description == null || string.IsNullOrEmpty(command.Description?.ToString()))
                return false;
            return true;
        }
    }
}
```

#### **9.2 UpdateCropValidator.cs**
```csharp
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateCropValidator : BaseValidator<UpdateCropCommand>
    {
        public UpdateCropValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateCropCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()) || command.Id <= 0)
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Description == null || string.IsNullOrEmpty(command.Description?.ToString()))
                return false;
            return true;
        }
    }
}
```

### Step 10: Update CropController

Add these methods to `AgriSmart.API.Agronomic/Controllers/CropController.cs`:

```csharp
/// <summary>
/// Create a new crop
/// </summary>
/// <param name="command">Crop creation data</param>
/// <returns></returns>
[HttpPost]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<Response<CreateCropResponse>>> Post(CreateCropCommand command)
{
    var response = await _mediator.Send(command);
    if (response.Success) return Ok(response);
    return BadRequest(response);
}

/// <summary>
/// Update an existing crop
/// </summary>
/// <param name="command">Crop update data</param>
/// <returns></returns>
[HttpPut]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<ActionResult<Response<UpdateCropResponse>>> Put(UpdateCropCommand command)
{
    var response = await _mediator.Send(command);
    if (response.Success) return Ok(response);
    return BadRequest(response);
}

/// <summary>
/// Delete a crop (soft delete)
/// </summary>
/// <param name="Id">Crop ID to delete</param>
/// <returns></returns>
[HttpDelete("{Id:int}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<Response<DeleteCropResponse>>> Delete([FromRoute] int Id)
{
    var command = new DeleteCropCommand { Id = Id };
    var response = await _mediator.Send(command);

    if (response.Success) return Ok(response);
    if (response.Exception?.Contains("not found") == true) return NotFound(response);
    return BadRequest(response);
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Core Entities (Priority 1)
- [ ] **Farm DELETE** ✅ (Implementation provided above)
- [ ] **Company DELETE** ✅ (Implementation provided above)  
- [ ] **User DELETE** ✅ (Implementation provided above)
- [ ] **Crop DELETE/POST/PUT** ✅ (Implementation provided above)
- [ ] **Device DELETE** (Follow Farm pattern)
- [ ] **ProductionUnit DELETE** (Follow Farm pattern)

### Phase 2: Production Management (Priority 2)
- [ ] **CropProduction DELETE** (Follow Farm pattern)
- [ ] **CropProductionIrrigationSector DELETE** (Follow Farm pattern)
- [ ] **CropPhase DELETE** (Follow Farm pattern)
- [ ] **CropPhaseOptimal DELETE** (Follow Farm pattern)

### Phase 3: Resources & Catalogs (Priority 3)
- [ ] **Fertilizer DELETE** (Follow Farm pattern)
- [ ] **FertilizerChemistry DELETE** (Follow Farm pattern)
- [ ] **FertilizerInput DELETE** (Follow Farm pattern)
- [ ] **Water DELETE** (Follow Farm pattern)
- [ ] **WaterChemistry DELETE** (Follow Farm pattern)
- [ ] **Catalog DELETE** (Follow Farm pattern)

### Phase 4: IoT & Infrastructure (Priority 4)
- [ ] **Sensor DELETE** (Follow Farm pattern)
- [ ] **MeasurementVariable DELETE** (Follow Farm pattern)
- [ ] **RelayModule DELETE** (Follow Farm pattern)
- [ ] **Dropper DELETE** (Follow Farm pattern)

### Phase 5: System & Configuration (Priority 5)
- [ ] **Client DELETE** (Follow Farm pattern)
- [ ] **AnalyticalEntity DELETE** (Follow Farm pattern)
- [ ] **License DELETE** (Follow Farm pattern)
- [ ] **Container DELETE** (Follow Farm pattern)
- [ ] **GrowingMedium DELETE** (Follow Farm pattern)
- [ ] **CalculationSetting DELETE** (Follow Farm pattern)
- [ ] **IrrigationEvent DELETE** (Follow Farm pattern)

---

## 🚨 CRITICAL SAFETY NOTES

### **1. Always Use Soft Deletes**
```csharp
// ✅ CORRECT - Soft delete (preserves data)
entity.Active = false;

// ❌ WRONG - Hard delete (destroys data)
_context.Remove(entity);
```

### **2. Always Check Entity Exists**
```csharp
// ✅ CORRECT
var entity = await _context.Entities.FindAsync(id);
if (entity == null)
{
    return new Response { Success = false, Exception = "Entity not found" };
}
```

### **3. Always Use Try-Catch**
```csharp
// ✅ CORRECT
try
{
    // Operation here
}
catch (Exception ex)
{
    return new Response { Success = false, Exception = ex.Message };
}
```

### **4. Always Validate Input**
```csharp
// ✅ CORRECT
protected override bool AreFiltersValid(DeleteCommand command)
{
    if (command.Id <= 0) return false;
    return true;
}
```

---

## 🧪 TESTING STRATEGY

### **1. Test Each Endpoint Individually**
```bash
# Test DELETE Farm
curl -X DELETE "https://localhost:7029/Farm/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test POST Crop  
curl -X POST "https://localhost:7029/Crop" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Crop","description":"Test Description","active":true}'

# Test PUT Crop
curl -X PUT "https://localhost:7029/Crop" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"id":1,"name":"Updated Crop","description":"Updated Description","active":true}'
```

### **2. Verify Swagger Documentation**
After implementation, check:
- https://localhost:7029/swagger
- Verify all new endpoints appear
- Test endpoints directly from Swagger UI

### **3. Test Error Cases**
- Test with invalid IDs (0, negative, non-existent)
- Test with invalid request bodies
- Test with missing authentication

---

## 🔄 DEPLOYMENT STEPS

### **1. Build and Test Locally**
```bash
dotnet build AgriSmart.sln
dotnet test AgriSmart.sln
```

### **2. Start API and Test**
```bash
dotnet run --project AgriSmart.Api.Agronomic --urls https://localhost:7029
```

### **3. Verify in Swagger**
Navigate to https://localhost:7029/swagger and test new endpoints

### **4. Update Frontend Services** (If needed)
Update Angular services to use new endpoints:
```typescript
// Example: Update company.service.ts
delete(id: number): Observable<void> {
  return this.apiService.delete<void>(`${this.baseUrl}/${id}`);
}
```

---

## ✅ SUCCESS CRITERIA

You'll know the implementation is successful when:

1. **All 29 new endpoints appear in Swagger documentation**
2. **All endpoints return proper HTTP status codes**
3. **Soft deletes work (entities become inactive, not removed)**
4. **Validation works (invalid requests return 400)**
5. **Authentication works (unauthorized returns 401)**
6. **Error handling works (exceptions return proper messages)**
7. **Existing functionality still works unchanged**

---

## 🆘 TROUBLESHOOTING

### **Common Issues & Solutions**

#### **Issue: "Handler not found"**
**Solution:** Register handler in DI container or ensure namespace is correct

#### **Issue: "Validation failed"** 
**Solution:** Check validator implementation and required fields

#### **Issue: "Entity not found in context"**
**Solution:** Verify DbSet exists in IAgriSmartDbContext

#### **Issue: "Swagger not showing new endpoints"**
**Solution:** Rebuild project and restart API

#### **Issue: "401 Unauthorized"**
**Solution:** Ensure `[Authorize]` attribute is present on controller

---

This implementation guide provides everything needed to safely add all missing API endpoints without breaking existing functionality. Follow the patterns established and implement in phases for best results.