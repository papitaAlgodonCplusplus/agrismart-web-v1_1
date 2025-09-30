
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Responses;
using AgriSmart.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteNutrientRecipeHandler : IRequestHandler<DeleteNutrientRecipeCommand, Response<DeleteNutrientRecipeResponse>>
    {
        private readonly AgriSmartContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteNutrientRecipeHandler(
            AgriSmartContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetSessionUserId()
        {
            if (_httpContextAccessor.HttpContext?.User?.Claims?.Count() > 0)
                return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "0");
            else
                return 0;
        }

        public async Task<Response<DeleteNutrientRecipeResponse>> Handle(DeleteNutrientRecipeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var recipe = await _context.NutrientFormulationRecipes
                    .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

                if (recipe == null)
                {
                    return new Response<DeleteNutrientRecipeResponse>(new Exception($"Recipe with ID {request.Id} not found"));
                }

                // Hard delete since Active property doesn't exist
                _context.NutrientFormulationRecipes.Remove(recipe);
                await _context.SaveChangesAsync(cancellationToken);

                return new Response<DeleteNutrientRecipeResponse>(new DeleteNutrientRecipeResponse
                {
                    Id = recipe.Id,
                    Message = "Recipe deleted successfully"
                });
            }
            catch (Exception ex)
            {
                return new Response<DeleteNutrientRecipeResponse>(ex);
            }
        }
    }
}
