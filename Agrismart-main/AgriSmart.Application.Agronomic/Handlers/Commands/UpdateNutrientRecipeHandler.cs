
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
    public class UpdateNutrientRecipeHandler : IRequestHandler<UpdateNutrientRecipeCommand, Response<UpdateNutrientRecipeResponse>>
    {
        private readonly AgriSmartContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateNutrientRecipeHandler(
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

        public async Task<Response<UpdateNutrientRecipeResponse>> Handle(UpdateNutrientRecipeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Find existing recipe
                var recipe = await _context.NutrientFormulationRecipes
                    .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

                if (recipe == null)
                {
                    return new Response<UpdateNutrientRecipeResponse>(new Exception($"Recipe with ID {request.Id} not found"));
                }

                // Update recipe properties
                recipe.Name = request.Name;
                recipe.Description = request.Description;
                recipe.CropId = request.CropId;
                recipe.CropPhaseId = request.CropPhaseId;
                recipe.WaterSourceId = request.WaterSourceId;
                recipe.TargetPh = request.TargetPh;
                recipe.TargetEc = request.TargetEc;
                recipe.VolumeLiters = request.VolumeLiters;
                recipe.TargetNitrogen = request.TargetNitrogen;
                recipe.TargetPhosphorus = request.TargetPhosphorus;
                recipe.TargetPotassium = request.TargetPotassium;
                recipe.TargetCalcium = request.TargetCalcium;
                recipe.TargetMagnesium = request.TargetMagnesium;
                recipe.TargetSulfur = request.TargetSulfur;
                recipe.TargetIron = request.TargetIron;
                recipe.AchievedNitrogen = request.AchievedNitrogen;
                recipe.AchievedPhosphorus = request.AchievedPhosphorus;
                recipe.AchievedPotassium = request.AchievedPotassium;
                recipe.AchievedCalcium = request.AchievedCalcium;
                recipe.AchievedMagnesium = request.AchievedMagnesium;
                recipe.AchievedSulfur = request.AchievedSulfur;
                recipe.AchievedIron = request.AchievedIron;
                recipe.TotalCost = request.TotalCost;
                recipe.CostPerLiter = request.CostPerLiter;
                recipe.RecipeType = request.RecipeType;
                recipe.Instructions = request.Instructions;
                recipe.Warnings = request.Warnings;
                recipe.Notes = request.Notes;
                recipe.UpdatedBy = GetSessionUserId();
                recipe.DateUpdated = DateTime.Now;

                _context.NutrientFormulationRecipes.Update(recipe);

                // Update fertilizers - delete existing and recreate
                var existingFertilizers = await _context.NutrientFormulationRecipeFertilizers
                    .Where(f => f.RecipeId == request.Id)
                    .ToListAsync(cancellationToken);

                _context.NutrientFormulationRecipeFertilizers.RemoveRange(existingFertilizers);

                // Add new fertilizers
                if (request.Fertilizers != null && request.Fertilizers.Any())
                {
                    foreach (var fertDto in request.Fertilizers)
                    {
                        var recipeFertilizer = new NutrientFormulationRecipeFertilizer
                        {
                            RecipeId = recipe.Id,
                            FertilizerId = fertDto.FertilizerId,
                            ConcentrationGramsPerLiter = fertDto.ConcentrationGramsPerLiter,
                            TotalGrams = fertDto.TotalGrams,
                            TotalKilograms = fertDto.TotalKilograms,
                            NitrogenContribution = fertDto.NitrogenContribution,
                            PhosphorusContribution = fertDto.PhosphorusContribution,
                            PotassiumContribution = fertDto.PotassiumContribution,
                            CalciumContribution = fertDto.CalciumContribution,
                            MagnesiumContribution = fertDto.MagnesiumContribution,
                            SulfurContribution = fertDto.SulfurContribution,
                            PercentageOfN = fertDto.PercentageOfN,
                            PercentageOfP = fertDto.PercentageOfP,
                            PercentageOfK = fertDto.PercentageOfK,
                            CostPerUnit = fertDto.CostPerUnit,
                            TotalCost = fertDto.TotalCost,
                            CostPortion = fertDto.CostPortion,
                            ApplicationOrder = fertDto.ApplicationOrder,
                            ApplicationNotes = fertDto.ApplicationNotes,
                            CreatedBy = GetSessionUserId(),
                            DateCreated = DateTime.Now
                        };

                        await _context.NutrientFormulationRecipeFertilizers.AddAsync(recipeFertilizer, cancellationToken);
                    }
                }

                await _context.SaveChangesAsync(cancellationToken);

                return new Response<UpdateNutrientRecipeResponse>(new UpdateNutrientRecipeResponse
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Message = "Recipe updated successfully"
                });
            }
            catch (Exception ex)
            {
                return new Response<UpdateNutrientRecipeResponse>(ex);
            }
        }
    }
}
