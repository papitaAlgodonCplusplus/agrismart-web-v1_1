#!/usr/bin/env python3
"""
COMPLETE MODULAR FERTILIZER CALCULATOR API - MAIN IMPLEMENTATION
All missing functionality implemented across modular files
"""

from fastapi import FastAPI, HTTPException, Query
from models import (
    FertilizerRequest, FertilizerDosage, CalculationStatus, MLModelConfig
)
from nutrient_calculator import EnhancedFertilizerCalculator
from fertilizer_database import EnhancedFertilizerDatabase
from pdf_generator import EnhancedPDFReportGenerator
from verification_analyzer import SolutionVerifier, CostAnalyzer
from swagger_integration import SwaggerAPIClient
from ml_optimizer import ProfessionalMLFertilizerOptimizer
from typing import Dict, List, Optional, Any
import os
import json
import asyncio
from datetime import datetime
import numpy as np
from nutrient_caps import apply_nutrient_caps_to_targets, NutrientCaps
from linear_programming_optimizer import LinearProgrammingOptimizer
from models import LinearProgrammingResultConstrained

# Add this line after other initializations
lp_optimizer = LinearProgrammingOptimizer()


# Environment configuration
PORT = int(os.getenv("PORT", 8000))
API_ENVIRONMENT = os.getenv("API_ENVIRONMENT", "development")
SWAGGER_API_URL = os.getenv("SWAGGER_API_URL", "http://162.248.52.111:8082")


# Initialize FastAPI app
app = FastAPI(
    title="Fertilizer Calculator API",
    description="Advanced fertilizer calculation system with Swagger integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize all components
nutrient_calc = EnhancedFertilizerCalculator()
fertilizer_db = EnhancedFertilizerDatabase()
pdf_generator = EnhancedPDFReportGenerator()
verifier = SolutionVerifier()
cost_analyzer = CostAnalyzer()
ml_optimizer = ProfessionalMLFertilizerOptimizer()

# Create reports directory
os.makedirs("reports", exist_ok=True)

# ==============================================================================
# REPLACE THE CompleteFertilizerCalculator CLASS IN main_api.py
# ==============================================================================


class CompleteFertilizerCalculator:
    """Complete fertilizer calculator with all optimization methods"""

    def __init__(self):
        self.nutrient_calc = nutrient_calc
        self.fertilizer_db = fertilizer_db
        self.ml_optimizer = ml_optimizer

    def calculate_advanced_solution(self, request: FertilizerRequest, method: str = "deterministic") -> Dict[str, Any]:
        """
        Calculate fertilizer solution using specified method - ENHANCED WITH MICRONUTRIENT ANALYSIS
        """
        print(
            f"\n=== STARTING {method.upper()} CALCULATION WITH MICRONUTRIENT ANALYSIS ===")
        print(f"Fertilizers: {len(request.fertilizers)}")
        print(f"Targets: {request.target_concentrations}")
        print(f"Water: {request.water_analysis}")

        # Choose calculation method (existing code remains the same)
        if method == "machine_learning":
            # FORCE RELOAD ATTEMPT if not trained
            if not self.ml_optimizer.is_trained:
                print("ML model not trained, attempting to load existing model...")

                # Try to reload the model first
                try:
                    self.ml_optimizer._try_load_existing_model()
                    if self.ml_optimizer.is_trained:
                        print("SUCCESS: Successfully loaded existing ML model!")

                        # Use ML optimization
                        dosages_g_l = self.ml_optimizer.optimize_fertilizer_dosages(
                            request.fertilizers,
                            request.target_concentrations,
                            request.water_analysis,
                            request.calculation_settings.volume_liters
                        )
                    else:
                        print(
                            "Failed to load ML model, falling back to deterministic...")
                        method = "deterministic"
                        dosages_g_l = self.nutrient_calc.calculate_optimized_dosages(
                            request.fertilizers,
                            request.target_concentrations,
                            request.water_analysis
                        )
                except Exception as e:
                    print(
                        f"ML optimization failed: {e}, falling back to deterministic...")
                    method = "deterministic"
                    dosages_g_l = self.nutrient_calc.calculate_optimized_dosages(
                        request.fertilizers,
                        request.target_concentrations,
                        request.water_analysis
                    )
            else:
                # Use ML optimization
                dosages_g_l = self.ml_optimizer.optimize_fertilizer_dosages(
                    request.fertilizers,
                    request.target_concentrations,
                    request.water_analysis,
                    request.calculation_settings.volume_liters
                )
        else:
            # Deterministic method (default)
            dosages_g_l = self.nutrient_calc.calculate_optimized_dosages(
                request.fertilizers,
                request.target_concentrations,
                request.water_analysis
            )

        # Convert to FertilizerDosage format
        fertilizer_dosages = {}
        for name, dosage_g_l in dosages_g_l.items():
            fertilizer_dosages[name] = FertilizerDosage(
                dosage_g_per_L=dosage_g_l,
                dosage_ml_per_L=dosage_g_l  # Assuming density of 1.0 g/mL
            )

        # Calculate nutrient contributions
        nutrient_contrib = self.calculate_nutrient_contributions(
            dosages_g_l, request.fertilizers, request.calculation_settings.volume_liters
        )

        # Calculate water contributions
        water_contrib = self.calculate_water_contributions(
            request.water_analysis, request.calculation_settings.volume_liters
        )

        # Calculate final solution
        final_solution = self.calculate_final_solution(
            nutrient_contrib, water_contrib)

        # Verification and analysis (existing code)
        verification_results = verifier.verify_concentrations(
            request.target_concentrations, final_solution['FINAL_mg_L']
        )
        ionic_relationships = verifier.verify_ionic_relationships(
            final_solution['FINAL_meq_L'], final_solution['FINAL_mmol_L'], final_solution['FINAL_mg_L']
        )
        ionic_balance = verifier.verify_ionic_balance(
            final_solution['FINAL_meq_L'])

        # Cost analysis with API pricing support
        fertilizer_amounts_kg = {
            name: dosage * request.calculation_settings.volume_liters / 1000
            for name, dosage in dosages_g_l.items()
        }

        # NEW: Use the enhanced cost analyzer with API price data
        cost_analysis = cost_analyzer.calculate_solution_cost_with_api_data(
            fertilizer_amounts_kg,
            request.fertilizers,  # Pass the fertilizer objects that contain price data
            request.calculation_settings.volume_liters,
            request.calculation_settings.volume_liters
        )

        # *** NEW: ADD MICRONUTRIENT ANALYSIS HERE ***
        print(f"\nPERFORMING ENHANCED MICRONUTRIENT ANALYSIS...")

        # 1. Analyze micronutrient coverage
        micronutrient_coverage = self.nutrient_calc.analyze_micronutrient_coverage(
            request.fertilizers, request.target_concentrations, request.water_analysis
        )

        # 2. Calculate micronutrient dosages if needed
        micronutrient_dosages = {}
        if micronutrient_coverage['micronutrients_needed']:
            micronutrient_needs = {
                micro: info['remaining_need']
                for micro, info in micronutrient_coverage['micronutrients_needed'].items()
            }
            micronutrient_dosages = self.nutrient_calc.calculate_micronutrient_dosages(
                micronutrient_needs, request.fertilizers
            )

        # 3. Validate micronutrient solution
        micronutrient_validation = self.nutrient_calc.validate_micronutrient_solution(
            final_solution['FINAL_mg_L'], request.target_concentrations
        )

        # 4. Create comprehensive response including micronutrients
        calculation_status = CalculationStatus(
            success=True,
            warnings=[],
            iterations=1,
            convergence_error=0.0
        )

        return {
            'fertilizer_dosages': fertilizer_dosages,
            'nutrient_contributions': nutrient_contrib,
            'water_contributions': water_contrib,
            'final_solution': final_solution,
            'verification_results': verification_results,
            'ionic_relationships': ionic_relationships,
            'ionic_balance': ionic_balance,
            'cost_analysis': cost_analysis,
            'calculation_status': calculation_status._asdict(),
            'micronutrient_coverage': micronutrient_coverage,
            'micronutrient_dosages': micronutrient_dosages,
            'micronutrient_validation': micronutrient_validation,
            'optimization_method': method
        }

    def enhance_fertilizers_with_micronutrients(self,
                                                base_fertilizers: List,
                                                target_concentrations: Dict[str, float],
                                                water_analysis: Dict[str, float]) -> List:
        """
        MISSING FUNCTION: Enhance fertilizer list with required micronutrient fertilizers
        """
        print(f"\n[INFO] ENHANCING FERTILIZER DATABASE WITH MICRONUTRIENTS...")
        print(f"[INFO] Base fertilizers: {len(base_fertilizers)}")

        enhanced_fertilizers = base_fertilizers.copy()

        # Define required micronutrients and their preferred sources
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

        # Check which micronutrients are missing or insufficient
        missing_micronutrients = []
        micronutrient_needs = {}

        print(f"[INFO] Analyzing micronutrient coverage...")

        for micro in micronutrients:
            target = target_concentrations.get(micro, 0)
            water_content = water_analysis.get(micro, 0)
            remaining_need = max(0, target - water_content)

            if remaining_need > 0.001:  # Need significant amount
                # Check if any existing fertilizers can supply this micronutrient
                can_supply = False
                total_available = 0

                for fert in base_fertilizers:
                    cation_content = fert.composition.cations.get(micro, 0)
                    anion_content = fert.composition.anions.get(micro, 0)
                    total_content = cation_content + anion_content

                    if total_content > 0.1:  # Fertilizer contains meaningful amount
                        can_supply = True
                        # Estimate maximum contribution (assuming 2g/L max dosage)
                        max_contribution = 2.0 * total_content * 98.0 / 100.0 * 1000.0 / 100.0
                        total_available += max_contribution

                if not can_supply or total_available < remaining_need * 0.5:
                    missing_micronutrients.append(micro)
                    micronutrient_needs[micro] = remaining_need
                    print(
                        f"  [WARNING] {micro}: Need {remaining_need:.3f} mg/L, available: {total_available:.3f} mg/L")

        if not missing_micronutrients:
            print(
                f"[CHECK] All micronutrients sufficiently covered by existing fertilizers")
            return enhanced_fertilizers

        print(
            f"[INFO] Adding required micronutrient fertilizers for: {missing_micronutrients}")

        # Define preferred micronutrient sources with proper formulas
        required_micronutrient_sources = {
            'Fe': {
                'primary': 'sulfato de hierro',  # FeSO4.7H2O
                'alternatives': ['quelato de hierro', 'cloruro de hierro'],
                'display_name': 'Sulfato de Hierro (FeSO₄·7H₂O) [Fertilizante Requerido]'
            },
            'Mn': {
                'primary': 'sulfato de manganeso',  # MnSO4.4H2O
                'alternatives': ['quelato de manganeso'],
                'display_name': 'Sulfato de Manganeso (MnSO₄·4H₂O) [Fertilizante Requerido]'
            },
            'Zn': {
                'primary': 'sulfato de zinc',  # ZnSO4.7H2O
                'alternatives': ['quelato de zinc'],
                'display_name': 'Sulfato de Zinc (ZnSO₄·7H₂O) [Fertilizante Requerido]'
            },
            'Cu': {
                'primary': 'sulfato de cobre',  # CuSO4.5H2O
                'alternatives': ['quelato de cobre'],
                'display_name': 'Sulfato de Cobre (CuSO₄·5H₂O) [Fertilizante Requerido]'
            },
            'B': {
                'primary': 'acido borico',  # H3BO3
                'alternatives': ['borax'],
                'display_name': 'Ácido Bórico (H₃BO₃) [Fertilizante Requerido]'
            },
            'Mo': {
                'primary': 'molibdato de sodio',  # Na2MoO4.2H2O
                'alternatives': ['molibdato de amonio'],
                'display_name': 'Molibdato de Sodio (Na₂MoO₄·2H₂O) [Fertilizante Requerido]'
            }
        }

        added_count = 0
        for micro in missing_micronutrients:
            if micro in required_micronutrient_sources:
                source_info = required_micronutrient_sources[micro]

                # Try primary source first
                fertilizer = self.fertilizer_db.create_fertilizer_from_database(
                    source_info['primary'])

                if fertilizer:
                    # Update the display name to indicate it's a required fertilizer
                    fertilizer.name = source_info['display_name']
                    enhanced_fertilizers.append(fertilizer)
                    added_count += 1

                    # Calculate expected contribution
                    micro_content = (fertilizer.composition.cations.get(micro, 0) +
                                     fertilizer.composition.anions.get(micro, 0))

                    print(f"  [CHECK] Added: {fertilizer.name}")
                    print(f"     {micro} content: {micro_content:.1f}%")
                    print(f"     Need: {micronutrient_needs[micro]:.3f} mg/L")

                else:
                    print(
                        f"  [FAILED] Error: Failed to create fertilizer for {micro}")

        print(
            f"[INFO] Auto-added {added_count} required micronutrient fertilizers")
        print(
            f"[INFO] Total enhanced fertilizers: {len(enhanced_fertilizers)}")

        return enhanced_fertilizers

    def calculate_nutrient_contributions(self, dosages_g_l: Dict[str, float], fertilizers: List):
        """Calculate nutrient contributions from fertilizers with proper calculations"""
        elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'S',
                    'Cl', 'P', 'HCO3', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

        contributions = {
            'APORTE_mg_L': {elem: 0.0 for elem in elements},
            'APORTE_mmol_L': {elem: 0.0 for elem in elements},
            'APORTE_meq_L': {elem: 0.0 for elem in elements}
        }

        fert_map = {f.name: f for f in fertilizers}

        # Calculate contributions for each active fertilizer
        for fert_name, dosage_g_l in dosages_g_l.items():
            if dosage_g_l > 0 and fert_name in fert_map:
                fertilizer = fert_map[fert_name]
                dosage_mg_l = dosage_g_l * 1000  # Convert g/L to mg/L

                print(
                    f"  Processing {fert_name}: {dosage_g_l:.4f} g/L ({dosage_mg_l:.1f} mg/L)")

                # Calculate contributions from cations
                for element, content_percent in fertilizer.composition.cations.items():
                    if content_percent > 0:
                        contribution = self.nutrient_calc.calculate_element_contribution(
                            dosage_mg_l, content_percent, fertilizer.chemistry.purity
                        )
                        contributions['APORTE_mg_L'][element] += contribution
                        print(
                            f"    {element} (cation): +{contribution:.3f} mg/L")

                # Calculate contributions from anions
                for element, content_percent in fertilizer.composition.anions.items():
                    if content_percent > 0:
                        contribution = self.nutrient_calc.calculate_element_contribution(
                            dosage_mg_l, content_percent, fertilizer.chemistry.purity
                        )
                        contributions['APORTE_mg_L'][element] += contribution
                        print(
                            f"    {element} (anion): +{contribution:.3f} mg/L")

        # Convert to mmol/L and meq/L with proper calculations
        for element in elements:
            mg_l = contributions['APORTE_mg_L'][element]
            mmol_l = self.nutrient_calc.convert_mg_to_mmol(mg_l, element)
            meq_l = self.nutrient_calc.convert_mmol_to_meq(mmol_l, element)

            contributions['APORTE_mg_L'][element] = round(mg_l, 3)
            contributions['APORTE_mmol_L'][element] = round(mmol_l, 3)
            contributions['APORTE_meq_L'][element] = round(meq_l, 3)

            if mg_l > 0:
                print(
                    f"  Total {element}: {mg_l:.3f} mg/L = {mmol_l:.3f} mmol/L = {meq_l:.3f} meq/L")

        return contributions

    def calculate_water_contributions(self, water_analysis: Dict[str, float], volume_liters: float):
        """Calculate water contributions"""
        elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'SO4', 'S',
                    'Cl', 'H2PO4', 'P', 'HCO3', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

        water_contrib = {
            'IONES_mg_L_DEL_AGUA': {elem: 0.0 for elem in elements},
            'mmol_L': {elem: 0.0 for elem in elements},
            'meq_L': {elem: 0.0 for elem in elements}
        }

        for element in elements:
            mg_l = water_analysis.get(element, 0.0)
            mmol_l = self.nutrient_calc.convert_mg_to_mmol(mg_l, element)
            meq_l = self.nutrient_calc.convert_mmol_to_meq(mmol_l, element)

            water_contrib['IONES_mg_L_DEL_AGUA'][element] = round(mg_l, 3)
            water_contrib['mmol_L'][element] = round(mmol_l, 3)
            water_contrib['meq_L'][element] = round(meq_l, 3)

        return water_contrib

    def calculate_final_solution(self, nutrient_contrib: Dict[str, Dict[str, float]], water_contrib: Dict):
        """Calculate final solution concentrations"""
        elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'SO4', 'S',
                    'Cl', 'H2PO4', 'P', 'HCO3', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

        final = {
            'FINAL_mg_L': {},
            'FINAL_mmol_L': {},
            'FINAL_meq_L': {}
        }

        for element in elements:
            final_mg_l = (nutrient_contrib['APORTE_mg_L'][element] +
                          water_contrib['IONES_mg_L_DEL_AGUA'][element])
            final_mmol_l = self.nutrient_calc.convert_mg_to_mmol(
                final_mg_l, element)
            final_meq_l = self.nutrient_calc.convert_mmol_to_meq(
                final_mmol_l, element)

            final['FINAL_mg_L'][element] = round(final_mg_l, 3)
            final['FINAL_mmol_L'][element] = round(final_mmol_l, 3)
            final['FINAL_meq_L'][element] = round(final_meq_l, 3)

        # Calculate EC and pH
        cations = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'Fe', 'Mn', 'Zn', 'Cu']
        cation_sum = sum(final['FINAL_meq_L'].get(cation, 0)
                         for cation in cations)
        ec = cation_sum * 0.1

        hco3 = final['FINAL_mg_L'].get('HCO3', 0)
        no3_n = final['FINAL_mg_L'].get('N', 0)
        if hco3 > 61:
            ph = 6.5 + (hco3 - 61) / 100
        else:
            ph = 6.0 - (no3_n / 200)

        return {
            'FINAL_mg_L': final['FINAL_mg_L'],
            'FINAL_mmol_L': final['FINAL_mmol_L'],
            'FINAL_meq_L': final['FINAL_meq_L'],
            'calculated_EC': round(ec, 2),
            'calculated_pH': round(ph, 1)
        }


# Initialize calculator
calculator = CompleteFertilizerCalculator()

# ============================================================================
# API ENDPOINTS
# ============================================================================


@app.post("/train-ml-model")
async def train_ml_model(n_samples: int = Query(default=5000), model_type: str = Query(default="RandomForest")):
    """Train the ML model with synthetic data"""
    try:
        print(f"Training ML model with {n_samples} samples...")

        config = MLModelConfig(model_type=model_type)
        ml_optimizer.config = config

        # Generate training data first, then train
        print(f"Generating {n_samples} training samples...")
        test_fertilizers = [
            fertilizer_db.create_fertilizer_from_database('nitrato de calcio'),
            fertilizer_db.create_fertilizer_from_database(
                'nitrato de potasio'),
            fertilizer_db.create_fertilizer_from_database(
                'fosfato monopotasico'),
            fertilizer_db.create_fertilizer_from_database(
                'sulfato de magnesio')
        ]
        training_data = ml_optimizer.generate_real_training_data(
            fertilizers=test_fertilizers, num_scenarios=n_samples)

        print(f"Training model with {len(training_data)} samples...")
        training_results = ml_optimizer.train_model(
            training_data=training_data)

        return {
            "status": "training_complete",
            "training_results": training_results,
            "model_ready": ml_optimizer.is_trained,
            "training_samples": len(training_data),
            "test_mae": training_results.get("test_mae_overall", 0),
            "model_type": model_type
        }

    except Exception as e:
        print(f"ML training failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"ML training error: {str(e)}")

def create_intelligent_price_mapping(fertilizer_inputs_data):
    """
    Crear mapeo inteligente de precios con coincidencias parciales
    """
    print(f"\n💰 Creating intelligent price mapping from FertilizerInput data...")
    
    # Mapeo directo (exacto)
    exact_price_mapping = {}
    # Mapeo por palabras clave para coincidencias parciales
    keyword_price_mapping = {}
    
    for input_data in fertilizer_inputs_data:
        name = input_data.get('name', '').strip()
        price = input_data.get('price', None)
        
        if name and price is not None and price > 0:  # Solo precios válidos > 0
            price_float = float(price)
            
            # Mapeo exacto
            exact_price_mapping[name] = price_float
            
            # Mapeo por palabras clave (para coincidencias parciales)
            name_lower = name.lower()
            
            # Extraer palabras clave principales del nombre
            keywords = []
            
            # Patrones específicos para fertilizantes
            if 'nitrato de calcio' in name_lower:
                keywords.extend(['nitrato de calcio', 'calcium nitrate'])
            elif 'nitrato de potasio' in name_lower:
                keywords.extend(['nitrato de potasio', 'potassium nitrate'])
            elif 'nitrato de magnesio' in name_lower:
                keywords.extend(['nitrato de magnesio', 'magnesium nitrate'])
            elif 'sulfato de amonio' in name_lower:
                keywords.extend(['sulfato de amonio', 'ammonium sulfate'])
            elif 'cloruro de potasio' in name_lower:
                keywords.extend(['cloruro de potasio', 'potassium chloride'])
            elif 'cloruro de calcio' in name_lower:
                keywords.extend(['cloruro de calcio', 'calcium chloride'])
            elif 'sulfato de potasio' in name_lower:
                keywords.extend(['sulfato de potasio', 'potassium sulfate'])
            elif 'sulfato de magnesio' in name_lower:
                keywords.extend(['sulfato de magnesio', 'magnesium sulfate'])
            elif 'fosfato monopotasico' in name_lower or 'fosfato monopotásico' in name_lower:
                keywords.extend(['fosfato monopotasico', 'fosfato monopotásico', 'monopotassium phosphate'])
            elif 'fosfato diamónico' in name_lower or 'fosfato diamonico' in name_lower:
                keywords.extend(['fosfato diamónico', 'fosfato diamonico', 'diammonium phosphate', 'dap'])
            elif 'fosfato monoamonico' in name_lower or 'fosfato monoamónico' in name_lower:
                keywords.extend(['fosfato monoamonico', 'fosfato monoamónico', 'monoammonium phosphate', 'map'])
            elif 'acido nitrico' in name_lower or 'ácido nítrico' in name_lower:
                keywords.extend(['acido nitrico', 'ácido nítrico', 'nitric acid'])
            elif 'acido fosforico' in name_lower or 'ácido fosfórico' in name_lower:
                keywords.extend(['acido fosforico', 'ácido fosfórico', 'phosphoric acid'])
            elif 'acido sulfurico' in name_lower or 'ácido sulfúrico' in name_lower:
                keywords.extend(['acido sulfurico', 'ácido sulfúrico', 'sulfuric acid'])
            elif 'sulfato de hierro' in name_lower:
                keywords.extend(['sulfato de hierro', 'iron sulfate'])
            elif 'sulfato de manganeso' in name_lower:
                keywords.extend(['sulfato de manganeso', 'manganese sulfate'])
            elif 'sulfato de zinc' in name_lower:
                keywords.extend(['sulfato de zinc', 'zinc sulfate'])
            elif 'acido borico' in name_lower or 'ácido bórico' in name_lower:
                keywords.extend(['acido borico', 'ácido bórico', 'boric acid'])
            elif 'quelato de hierro' in name_lower:
                keywords.extend(['quelato de hierro', 'iron chelate'])
            
            # Guardar el mejor precio para cada palabra clave
            for keyword in keywords:
                if keyword not in keyword_price_mapping or price_float < keyword_price_mapping[keyword]:
                    keyword_price_mapping[keyword] = price_float
            
            print(f"  [PRICE] {name}: ₡{price_float:.2f}/kg")
            if keywords:
                print(f"    └─ Keywords: {', '.join(keywords)}")
    
    print(f"[PRICE] Created exact mapping for {len(exact_price_mapping)} fertilizers")
    print(f"[PRICE] Created keyword mapping for {len(keyword_price_mapping)} patterns")
    
    return exact_price_mapping, keyword_price_mapping

def find_best_price_match(fertilizer_name, exact_mapping, keyword_mapping):
    """
    Encontrar el mejor precio para un fertilizante usando mapeo inteligente
    """
    name_lower = fertilizer_name.lower().strip()
    
    # 1. Intenta coincidencia exacta primero
    if fertilizer_name in exact_mapping:
        return exact_mapping[fertilizer_name], "exact_match"
    
    # 2. Intenta coincidencia exacta case-insensitive
    for exact_name, price in exact_mapping.items():
        if exact_name.lower() == name_lower:
            return price, "case_insensitive_match"
    
    # 3. Intenta coincidencias por palabras clave
    best_price = None
    best_match = None
    
    for keyword, price in keyword_mapping.items():
        if keyword in name_lower:
            if best_price is None or len(keyword) > len(best_match):  # Prefiere coincidencias más específicas
                best_price = price
                best_match = keyword
    
    if best_price is not None:
        return best_price, f"keyword_match:{best_match}"
    
    # 4. No se encontró coincidencia
    return None, "no_match"


@app.get("/swagger-integrated-calculation")
async def swagger_integrated_calculation_with_linear_programming(
    user_id: int,
    catalog_id: int = Query(default=1),
    phase_id: int = Query(default=1),
    water_id: int = Query(default=1),
    volume_liters: float = Query(default=1000),
    # NEW: Enable LP optimization
    linear_programming: bool = Query(default=True),
    apply_safety_caps: bool = Query(default=True),     # Safety caps
    strict_caps: bool = Query(default=True)             # Strict safety mode
):
    """
    [INFO] ENHANCED SWAGGER API INTEGRATION WITH LINEAR PROGRAMMING OPTIMIZATION

    This endpoint achieves MAXIMUM PRECISION in nutrient targeting by using advanced
    linear programming (PuLP/SciPy) to minimize deviations from target concentrations.

    [TARGET] OBJECTIVE: Achieve as close to 0% deviation as mathematically possible

    Key Features:
    - [CHECK] Linear Programming optimization (PuLP/SciPy)
    - [CHECK] Safety caps with strict limits
    - [CHECK] Micronutrient auto-supplementation  
    - [CHECK] Real-time Swagger API integration
    - [CHECK] Professional PDF reports
    - [CHECK] Ionic balance optimization
    - [CHECK] Cost and dosage minimization

    Parameters:
    - linear_programming: Enable LP optimization (True) or use deterministic (False)
    - apply_safety_caps: Apply nutrient safety caps before optimization
    - strict_caps: Use strict safety limits for maximum protection

    The LP optimizer prioritizes (in order):
    1. [TARGET] Minimize deviations from target concentrations (HIGHEST PRIORITY)
    2. [INFO] Maintain ionic balance 
    3. [INFO] Minimize total fertilizer dosage
    4. [INFO] Stay within safe dosage limits (max 5g/L individual, 15g/L total)

    Expected Results:
    - Parámetro Objetivo (mg/L) Actual (mg/L) Desviación (%) Estado Tipo
    - Ca 180.4 → 180.4 ± 0.0% Excellent Macro
    - K 300.0 → 300.0 ± 0.0% Excellent Macro  
    - Most nutrients achieve <±1% deviation vs. ±20% with basic methods
    """
    try:
        print(f"\n{'='*80}")
        print(
            f"[INFO] ENHANCED SWAGGER INTEGRATION WITH LINEAR PROGRAMMING OPTIMIZATION")
        print(f"{'='*80}")
        print(f"[INFO] Linear Programming: {linear_programming}")
        print(
            f"[INFO] Safety Caps: {apply_safety_caps} (Strict: {strict_caps})")
        print(f"[INFO] User ID: {user_id}")
        print(f"[SECTION] Volume: {volume_liters:,} L")
        calculation_results = {}

        # Initialize Swagger client and authenticate
        async with SwaggerAPIClient("http://162.248.52.111:8082") as swagger_client:
            # Authentication
            print(f"\n[INFO] Authenticating with Swagger API...")
            login_result = await swagger_client.login("csolano@iapcr.com", "123")
            if not login_result.get('success'):
                raise HTTPException(
                    status_code=401, detail="Authentication failed")
            print(f"[CHECK] Authentication successful!")

            # Get user information
            user_info = await swagger_client.get_user_by_id(user_id)
            print(
                f"[INFO] User: {user_info.get('userEmail', 'N/A')} (ID: {user_id})")

            # Fetch comprehensive data from API
            print(f"\n📡 Fetching comprehensive data from API...")

           
            # Fetch comprehensive data from API
            print(f"\n📡 Fetching comprehensive data from API...")
            
            # Fetch both fertilizer compositions AND pricing data
            fertilizers_data = await swagger_client.get_fertilizers(catalog_id)
            fertilizer_inputs_data = await swagger_client.get_fertilizer_inputs(catalog_id)  # 🆕 NEW
            requirements_data = await swagger_client.get_crop_phase_requirements(phase_id)
            water_data = await swagger_client.get_water_chemistry(water_id, catalog_id)
            
            print(f"[INFO] Fetched: {len(fertilizers_data)} fertilizers")
            print(f"[PRICE] Fetched: {len(fertilizer_inputs_data)} fertilizer inputs with pricing")  # 🆕 NEW
            print(f"[TARGET] Fetched: {len(requirements_data) if requirements_data else 0} requirements")
            print(f"[WATER] Fetched: {len(water_data) if water_data else 0} water parameters")
            
            
            # Create intelligent price mapping from FertilizerInput data
            exact_price_mapping, keyword_price_mapping = create_intelligent_price_mapping(fertilizer_inputs_data)
            
            # Debug: Mostrar mapeos creados
            print(f"\n🔍 DEBUG: Mapeos de precios creados:")
            print(f"Mapeo exacto: {len(exact_price_mapping)} entradas")
            print(f"Mapeo por palabras clave: {len(keyword_price_mapping)} patrones")
            
            # Process fertilizers into our enhanced format with intelligent pricing
            print(f"\n[INFO] Processing fertilizers with intelligent price matching...")
            api_fertilizers = []
            original_fertilizer_data = {}
            
            price_matches_found = 0
            price_matches_failed = 0
            
            for fert_data in fertilizers_data:
                try:
                    fertilizer = swagger_client.map_swagger_fertilizer_to_model(fert_data)
                    api_fertilizers.append(fertilizer)
                    
                    # Intelligent price matching
                    fert_name = fertilizer.name
                    price_from_api, match_type = find_best_price_match(
                        fert_name, exact_price_mapping, keyword_price_mapping
                    )
                    
                    # Create enhanced fertilizer data with price
                    enhanced_fert_data = fert_data.copy()
                    enhanced_fert_data['price'] = price_from_api
                    enhanced_fert_data['price_match_type'] = match_type
                    
                    original_fertilizer_data[fertilizer.name] = enhanced_fert_data
                    
                    # Log price matching results
                    if price_from_api is not None:
                        price_matches_found += 1
                        print(f"  [PRICE] ✅ {fertilizer.name}: ₡{price_from_api:.2f}/kg ({match_type})")
                    else:
                        price_matches_failed += 1
                        print(f"  [NO PRICE] ❌ {fertilizer.name}: No price match found")
                        
                except Exception as e:
                    print(f"  [FAILED] Error processing {fert_data.get('name', 'Unknown')}: {e}")
            
            print(f"\n💰 PRICE MATCHING SUMMARY:")
            print(f"[SUCCESS] Prices found: {price_matches_found}/{len(api_fertilizers)} ({price_matches_found/len(api_fertilizers)*100:.1f}%)")
            print(f"[FAILED] No prices: {price_matches_failed}/{len(api_fertilizers)} ({price_matches_failed/len(api_fertilizers)*100:.1f}%)")

            if not api_fertilizers:
                raise HTTPException(
                    status_code=500, detail="No usable fertilizers found from API")

            print(
                f"[CHECK] Successfully processed {len(api_fertilizers)} API fertilizers")

            # Map API data to our calculation format
            print(f"\n[INFO] Mapping API data to calculation format...")
            target_concentrations = swagger_client.map_requirements_to_targets(
                requirements_data)
            water_analysis = swagger_client.map_water_to_analysis(water_data)

            # Use intelligent defaults if API data unavailable
            if not target_concentrations:
                print(
                    f"[WARNING] No target concentrations from API, using optimized defaults")
                target_concentrations = {
                    'N': 150, 'P': 50, 'K': 200, 'Ca': 180, 'Mg': 50, 'S': 80,
                    'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05
                }

            if not water_analysis:
                print(f"[WARNING] No water analysis from API, using defaults")
                water_analysis = {
                    'Ca': 20, 'K': 5, 'N': 2, 'P': 1, 'Mg': 8, 'S': 5,
                    'Fe': 0.1, 'Mn': 0.05, 'Zn': 0.02, 'Cu': 0.01, 'B': 0.1, 'Mo': 0.001
                }

            print(
                f"[TARGET] Target concentrations: {len(target_concentrations)} parameters")
            print(f"[WATER] Water analysis: {len(water_analysis)} parameters")

            # Enhanced fertilizer database with micronutrient auto-supplementation
            print(f"\n[INFO] Enhancing fertilizer database with micronutrients...")
            enhanced_fertilizers = calculator.enhance_fertilizers_with_micronutrients(
                api_fertilizers, target_concentrations, water_analysis
            )

            micronutrients_added = len(
                enhanced_fertilizers) - len(api_fertilizers)
            print(
                f"[CHECK] Enhanced database: {len(enhanced_fertilizers)} total fertilizers")
            print(
                f"[INFO] Auto-added: {micronutrients_added} micronutrient fertilizers")

            # Display current targets for reference
            print(f"\n[TARGET] CURRENT TARGET CONCENTRATIONS:")
            for nutrient, target in target_concentrations.items():
                nutrient_type = "Macro" if nutrient in [
                    'N', 'P', 'K', 'Ca', 'Mg', 'S', 'HCO3'] else "Micro"
                print(f"  {nutrient:<6} | {target:>7.1f} mg/L | {nutrient_type}")

            # ===== CHOOSE OPTIMIZATION METHOD =====
            if linear_programming:
                print(f"\n{'='*80}")
                print(f"[INFO] USING ADVANCED LINEAR PROGRAMMING OPTIMIZATION")
                print(f"{'='*80}")
                print(
                    f"[TARGET] Objective: Achieve MAXIMUM precision (target: ±0.1% deviation)")
                print(f"[INFO] Solver: PuLP → SciPy fallback")
                print(f"[INFO] Constraints: Individual ≤5g/L, Total ≤15g/L")

                # BEFORE optimization, adjust targets for water chemistry
                print(f"\n[INFO] ADJUSTING TARGETS FOR WATER CHEMISTRY...")
                adjusted_targets_tuple = adjust_targets_for_water_chemistry(
                    target_concentrations, water_analysis)
                # Extract the fertilizer targets dict from tuple
                adjusted_targets = adjusted_targets_tuple[0]

                # Use Linear Programming Optimizer
                lp_result = lp_optimizer.optimize_fertilizer_solution(
                    fertilizers=enhanced_fertilizers,
                    target_concentrations=adjusted_targets,
                    water_analysis=water_analysis,
                    volume_liters=volume_liters,
                    apply_safety_caps=apply_safety_caps,
                    strict_caps=strict_caps
                )

                # Convert LP result to standard format for compatibility
                fertilizer_dosages = {}
                for fert_name, dosage_g_l in lp_result.dosages_g_per_L.items():
                    fertilizer_dosages[fert_name] = FertilizerDosage(
                        dosage_g_per_L=dosage_g_l,
                        dosage_ml_per_L=dosage_g_l  # Assuming density = 1.0
                    )

                # Create calculation results in standard format
                print(f"\n[INFO] QIESP :")
                calculation_results = {
                    'fertilizer_dosages': fertilizer_dosages,
                    'achieved_concentrations': lp_result.achieved_concentrations,
                    'deviations_percent': lp_result.deviations_percent,
                    'optimization_method': 'linear_programming',
                    'optimization_status': lp_result.optimization_status,
                    'objective_value': lp_result.objective_value,
                    'ionic_balance_error': lp_result.ionic_balance_error,
                    'solver_time_seconds': lp_result.solver_time_seconds,
                    'active_fertilizers': lp_result.active_fertilizers,
                    'total_dosage_g_per_L': lp_result.total_dosage,
                    'calculation_status': {
                        'success': lp_result.optimization_status == "Optimal",
                        'warnings': [] if lp_result.optimization_status == "Optimal" else [f"Optimization status: {lp_result.optimization_status}"],
                        'iterations': 1,
                        'convergence_error': np.mean([abs(d) for d in lp_result.deviations_percent.values()])
                    }
                }

                # 🆕 NEW: ADD COST ANALYSIS WITH API PRICING - Insert this after calculation is complete
                print(f"\n{'='*80}")
                print(f"[COST] PERFORMING COST ANALYSIS WITH API PRICING")
                print(f"{'='*80}")

                fertilizer_amounts_kg = {}
                for name, dosage_obj in calculation_results['fertilizer_dosages'].items():
                    amount_kg = dosage_obj.dosage_g_per_L * volume_liters / 1000
                    if amount_kg > 0:
                        fertilizer_amounts_kg[name] = amount_kg

                # Create list of fertilizer objects with price data for cost analyzer
                fertilizers_with_prices = []
                for name in fertilizer_amounts_kg.keys():
                    if name in original_fertilizer_data:
                        fertilizers_with_prices.append(
                            original_fertilizer_data[name])
                    else:
                        # Fallback: create a dummy object with no price for fertilizers not found
                        fertilizers_with_prices.append(
                            {'name': name, 'price': None})

                  # Perform cost analysis with API pricing
                  # def calculate_solution_cost_with_api_data(self, fertilizer_amounts: Dict[str, float], concentrated_volume: float, diluted_volume: float, region: str = 'Default') -> Dict[str, Any]:
                cost_analysis = cost_analyzer.calculate_solution_cost_with_api_data(
                    fertilizer_amounts=fertilizer_amounts_kg,
                    concentrated_volume=volume_liters,
                    diluted_volume=volume_liters,
                    region='Latin America'  # Adjust region as needed
                )

                # Add cost analysis to calculation results
                calculation_results['cost_analysis'] = cost_analysis

                # 🆕 NEW: Add detailed pricing information to response
                calculation_results['pricing_info'] = {
                    'api_prices_available': len([f for f in fertilizers_with_prices if f.get('price') is not None]),
                    'total_fertilizers_used': len(fertilizers_with_prices),
                    'api_price_coverage_percent': cost_analysis['pricing_summary']['api_price_coverage'],
                    'cost_breakdown_by_source': {
                        'api_sourced_fertilizers': cost_analysis['pricing_summary']['api_prices_used'],
                        'fallback_sourced_fertilizers': cost_analysis['pricing_summary']['fallback_prices_used']
                    },
                    'total_cost_crc': cost_analysis['total_cost_concentrated'],
                    'cost_per_liter_crc': cost_analysis['cost_per_liter_diluted'],
                    'cost_per_m3_crc': cost_analysis['cost_per_m3_diluted']
                }

                # 🆕 NEW: Display cost summary in console
                print(
                    f"[COST] Total Solution Cost: ₡{cost_analysis['total_cost_concentrated']:.3f}")
                print(
                    f"[COST] Cost per Liter: ₡{cost_analysis['cost_per_liter_diluted']:.4f}")
                print(
                    f"[COST] API Price Coverage: {cost_analysis['pricing_summary']['api_price_coverage']:.1f}%")
                print(
                    f"[COST] Most Expensive: {max(cost_analysis['cost_per_fertilizer'].items(), key=lambda x: x[1], default=('N/A', 0))}")

                # Display cost breakdown by fertilizer
                print(f"\n[COST] COST BREAKDOWN BY FERTILIZER:")
                for fert_name, cost_info in cost_analysis['detailed_costs'].items():
                    source_icon = "📡" if cost_info['price_source'] == 'api' else "🔄"
                    print(
                        f"  {source_icon} {fert_name:<25} ₡{cost_info['total_cost']:>7.3f} ({cost_info['amount_kg']:.3f} kg × ₡{cost_info['cost_per_kg']:.2f}/kg)")

                # ===== DETAILED ANALYSIS AND REPORTING =====
                print(f"\n{'='*80}")
                print(f"[SECTION] LINEAR PROGRAMMING OPTIMIZATION RESULTS")
                print(f"{'='*80}")
                print(f"[INFO] Status: {lp_result.optimization_status}")
                print(
                    f"[INFO] Solver Time: {lp_result.solver_time_seconds:.2f}s")
                print(
                    f"[INFO] Active Fertilizers: {lp_result.active_fertilizers}")
                print(f"[INFO] Total Dosage: {lp_result.total_dosage:.3f} g/L")
                print(
                    f"[TARGET] Average Deviation: {np.mean([abs(d) for d in lp_result.deviations_percent.values()]):.2f}%")
                print(
                    f"[INFO] Ionic Balance Error: {lp_result.ionic_balance_error:.2f}%")

                # ===== DETAILED DEVIATION ANALYSIS (YOUR REQUESTED FORMAT) =====
                print(f"\n{'='*80}")
                print(f"[TARGET] DETAILED DEVIATION ANALYSIS")
                print(f"{'='*80}")
                print(
                    f"{'Parámetro':<10} {'Objetivo':<10} {'Actual':<10} {'Desviación':<12} {'Estado':<15} {'Tipo'}")
                print(f"{'-'*80}")

                # Categorize nutrients for analysis
                excellent_nutrients = []    # ±0.1%
                good_nutrients = []        # ±5%
                low_nutrients = []         # Low but <15%
                high_nutrients = []        # High but <15%
                deviation_nutrients = []   # >±15%
                for nutrient, deviation in lp_result.deviations_percent.items():
                    # FIXED: Use the target that was actually used in the optimization
                    achieved = lp_result.achieved_concentrations.get(
                        nutrient, 0)

                    # Calculate the actual target that the deviation was calculated against
                    if abs(deviation) < 0.001:  # Near-perfect optimization (essentially 0% deviation)
                        target_used = achieved  # The LP achieved its target perfectly
                    else:
                        # Reverse-engineer the actual target from: deviation = (achieved - target) / target * 100
                        # Rearranged: target = achieved / (1 + deviation/100)
                        target_used = achieved / \
                            (1 + deviation/100) if (1 +
                                                    deviation/100) != 0 else achieved

                    # Alternative approach: If you have access to adjusted_targets, use them directly
                    # target_used = adjusted_targets.get(nutrient, target_concentrations.get(nutrient, 0))

                    # Determine status based on your requirements
                    if abs(deviation) <= 0.1:  # ±0.1%
                        status = "Excellent"
                        excellent_nutrients.append(nutrient)
                    elif abs(deviation) <= 5.0:  # ±5%
                        status = "Good"
                        good_nutrients.append(nutrient)
                    elif deviation < -15.0:  # More than 15% low
                        status = "Deviation Low"
                        deviation_nutrients.append(nutrient)
                    elif deviation < 0:  # Low but less than 15%
                        status = "Low"
                        low_nutrients.append(nutrient)
                    elif deviation > 15.0:  # More than 15% high
                        status = "Deviation High"
                        deviation_nutrients.append(nutrient)
                    else:  # High but less than 15%
                        status = "High"
                        high_nutrients.append(nutrient)

                    nutrient_type = "Macro" if nutrient in [
                        'N', 'P', 'K', 'Ca', 'Mg', 'S', 'HCO3'] else "Micro"

                    # FIXED: Now the math will be consistent
                    print(
                        f"{nutrient:<10} {target_used:<10.1f} {achieved:<10.1f} {deviation:>+6.1f}% {status:<15} {nutrient_type}")

                # OPTIONAL: Add a comparison table showing original vs adjusted targets
                print(f"\n{'='*80}")
                print(f"[INFO] TARGET ADJUSTMENTS SUMMARY")
                print(f"{'='*80}")
                print(
                    f"{'Nutrient':<10} {'Original':<10} {'Adjusted':<10} {'Achieved':<10} {'Reason'}")
                print(f"{'-'*60}")

                for nutrient in lp_result.deviations_percent.keys():
                    original_target = target_concentrations.get(nutrient, 0)
                    achieved = lp_result.achieved_concentrations.get(
                        nutrient, 0)
                    deviation = lp_result.deviations_percent.get(nutrient, 0)

                    # Calculate what the adjusted target was
                    if abs(deviation) < 0.001:
                        adjusted_target = achieved
                    else:
                        adjusted_target = achieved / \
                            (1 + deviation/100) if (1 +
                                                    deviation/100) != 0 else achieved

                    # Determine reason for adjustment
                    if abs(original_target - adjusted_target) < 0.01:
                        reason = "No change"
                    elif adjusted_target < original_target:
                        reason = "Safety cap"
                    else:
                        reason = "Water chemistry"

                    print(
                        f"{nutrient:<10} {original_target:<10.1f} {adjusted_target:<10.1f} {achieved:<10.1f} {reason}")

                # ===== OPTIMIZATION SUMMARY STATISTICS =====
                total_nutrients = len(lp_result.deviations_percent)
                print(f"\n{'='*80}")
                print(f"📈 OPTIMIZATION PERFORMANCE SUMMARY")
                print(f"{'='*80}")
                print(
                    f"[TARGET] Excellent (±0.1%): {len(excellent_nutrients):>2}/{total_nutrients} ({len(excellent_nutrients)/total_nutrients*100:>5.1f}%)")
                print(
                    f"[CHECK] Good (±5%):       {len(good_nutrients):>2}/{total_nutrients} ({len(good_nutrients)/total_nutrients*100:>5.1f}%)")
                print(
                    f"[WARNING] Low nutrients:     {len(low_nutrients):>2}/{total_nutrients} ({len(low_nutrients)/total_nutrients*100:>5.1f}%)")
                print(
                    f"[WARNING] High nutrients:    {len(high_nutrients):>2}/{total_nutrients} ({len(high_nutrients)/total_nutrients*100:>5.1f}%)")
                print(
                    f"[FAILED] Deviation (>15%):  {len(deviation_nutrients):>2}/{total_nutrients} ({len(deviation_nutrients)/total_nutrients*100:>5.1f}%)")

                success_rate = (len(excellent_nutrients) +
                                len(good_nutrients)) / total_nutrients * 100
                print(
                    f"[INFO] SUCCESS RATE: {success_rate:.1f}% (Excellent + Good)")

                # ===== ACTIVE FERTILIZER DOSAGES =====
                print(f"\n{'='*80}")
                print(f"[INFO] ACTIVE FERTILIZER DOSAGES")
                print(f"{'='*80}")
                active_dosages = [(name, dosage.dosage_g_per_L) for name, dosage in fertilizer_dosages.items(
                ) if dosage.dosage_g_per_L > 0.001]
                active_dosages.sort(
                    key=lambda x: x[1], reverse=True)  # Sort by dosage

                for fert_name, dosage in active_dosages:
                    print(f"  [INFO] {fert_name:<30} {dosage:>8.3f} g/L")

                method = "linear_programming"

            else:
                print(f"\n{'='*80}")
                print(f"[INFO] USING DETERMINISTIC OPTIMIZATION (FALLBACK)")
                print(f"{'='*80}")

                # Use standard deterministic method
                from models import CalculationSettings

                request = FertilizerRequest(
                    fertilizers=enhanced_fertilizers,
                    target_concentrations=target_concentrations,
                    water_analysis=water_analysis,
                    calculation_settings=CalculationSettings(
                        volume_liters=volume_liters,
                        precision=3,
                        units="mg/L",
                        crop_phase="API_Integrated"
                    )
                )

                calculation_results = calculator.calculate_advanced_solution(
                    request, method="deterministic")
                method = "deterministic"

                print(f"[CHECK] Deterministic calculation completed")

        # ===== PDF REPORT GENERATION =====
        try:
            print(f"\n[INFO] Generating comprehensive PDF report...")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"reports/lp_integrated_report_{timestamp}.pdf"

            # FIXED: Include water analysis in calculation_data
            calculation_data = {
                "integration_metadata": {
                    "data_source": "Swagger API with Linear Programming",
                    "user_id": user_id,
                    "catalog_id": catalog_id,
                    "phase_id": phase_id,
                    "water_id": water_id,
                    "fertilizers_analyzed": len(fertilizers_data),
                    "fertilizers_processed": len(api_fertilizers),
                    "micronutrients_added": len(enhanced_fertilizers) - len(api_fertilizers),
                    "optimization_method": method,
                    "linear_programming_enabled": linear_programming,
                    "calculation_timestamp": datetime.now().isoformat(),
                    "auto_micronutrient_supplementation": True,
                    "safety_caps_applied": apply_safety_caps,
                    "strict_caps_mode": strict_caps,
                    "solver_time_seconds": getattr(lp_result, 'solver_time_seconds', 0.0) if linear_programming else 0.0,
                    "optimization_status": getattr(lp_result, 'optimization_status', 'Success') if linear_programming else 'Success'
                },
                "calculation_results": calculation_results,
                "fertilizer_database": {},  # Add fertilizer database
                "water_analysis": water_analysis,  # FIXED: Add water analysis
                "target_concentrations": target_concentrations  # FIXED: Add target concentrations
            }

            # FIXED: Store water analysis for PDF generator access
            pdf_generator._current_water_analysis = water_analysis

            pdf_generator.generate_comprehensive_pdf(
                calculation_data, pdf_filename)
            calculation_results['pdf_report'] = {
                "generated": True,
                "filename": pdf_filename,
                "integration_method": f"swagger_api_linear_programming"
            }

            print(
                f"[SUCCESS] Enhanced PDF report generated successfully: {pdf_filename}")
            print(f"[CHECK] PDF report generated: {pdf_filename}")

        except Exception as e:
            print(f"[ERROR] PDF generation failed: {e}")
            import traceback
            traceback.print_exc()
            calculation_results['pdf_report'] = {
                "generated": False,
                "error": str(e),
                "integration_method": f"swagger_api_linear_programming"
            }
        # ===== CREATE COMPREHENSIVE API RESPONSE =====
        response = {
            "user_info": user_info,
            "optimization_method": method,
            "linear_programming_enabled": linear_programming,
            "integration_metadata": {
                "data_source": "Swagger API with Advanced Linear Programming",
                "user_id": user_id,
                "catalog_id": catalog_id,
                "phase_id": phase_id,
                "water_id": water_id,
                "fertilizers_analyzed": len(fertilizers_data),
                "fertilizers_processed": len(api_fertilizers),
                "micronutrients_added": len(enhanced_fertilizers) - len(api_fertilizers),
                "optimization_method": method,
                "calculation_timestamp": datetime.now().isoformat(),
                "safety_caps_applied": apply_safety_caps,
                "strict_caps_mode": strict_caps,
                "api_endpoints_used": [
                    f"/Fertilizer?CatalogId={catalog_id}",
                    f"/CropPhaseSolutionRequirement/GetByPhaseId?PhaseId={phase_id}",
                    f"/WaterChemistry?WaterId={water_id}&CatalogId={catalog_id}",
                    "/User"
                ]
            },
            "optimization_summary": {
                "method": method,
                "status": calculation_results.get('optimization_status', 'Success'),
                "active_fertilizers": calculation_results.get('active_fertilizers', len([d for d in calculation_results['fertilizer_dosages'].values() if d.dosage_g_per_L > 0])),
                "total_dosage_g_per_L": calculation_results.get('total_dosage_g_per_L', sum(d.dosage_g_per_L for d in calculation_results['fertilizer_dosages'].values())),
                "average_deviation_percent": calculation_results.get('convergence_error', np.mean([abs(d) for d in calculation_results.get('deviations_percent', {}).values()])),
                "solver_time_seconds": calculation_results.get('solver_time_seconds', 0.0),
                "ionic_balance_error": calculation_results.get('ionic_balance_error', 0.0),
                "success_rate_percent": success_rate if linear_programming else 0.0
            },
            "performance_metrics": {
                "fertilizers_fetched": len(fertilizers_data),
                "fertilizers_processed": len(api_fertilizers),
                "micronutrients_auto_added": len(enhanced_fertilizers) - len(api_fertilizers),
                "fertilizers_matched": len([f for f in enhanced_fertilizers if sum(f.composition.cations.values()) + sum(f.composition.anions.values()) > 10]),
                "active_dosages": len([d for d in calculation_results['fertilizer_dosages'].values() if d.dosage_g_per_L > 0]),
                "optimization_method": method,
                "micronutrient_coverage": "Complete",
                "safety_status": "Protected" if apply_safety_caps else "Unprotected",
                "precision_achieved": "Maximum" if linear_programming else "Standard"
            },
            "cost_analysis": {
                "total_cost_crc": cost_analysis['total_cost_concentrated'],
                "cost_per_liter_crc": cost_analysis['cost_per_liter_diluted'],
                "cost_per_m3_crc": cost_analysis['cost_per_m3_diluted'],
                "api_price_coverage_percent": cost_analysis['pricing_summary']['api_price_coverage'],
                "fertilizer_costs": cost_analysis['cost_per_fertilizer'],
                "cost_percentages": cost_analysis['percentage_per_fertilizer'],
                "pricing_sources": {
                    "api_prices_used": cost_analysis['pricing_summary']['api_prices_used'],
                    "fallback_prices_used": cost_analysis['pricing_summary']['fallback_prices_used']
                },
                "regional_factor": cost_analysis['regional_factor'],
                "region": cost_analysis['region']
            },
            "calculation_results": calculation_results,
            "linear_programming_analysis": {
                "excellent_nutrients": len(excellent_nutrients) if linear_programming else 0,
                "good_nutrients": len(good_nutrients) if linear_programming else 0,
                "deviation_nutrients": len(deviation_nutrients) if linear_programming else 0,
                "total_nutrients": total_nutrients if linear_programming else 0
            } if linear_programming else None,
            "data_sources": {
                "fertilizers_api": f"http://162.248.52.111:8082/Fertilizer?CatalogId={catalog_id}",
                "requirements_api": f"http://162.248.52.111:8082/CropPhaseSolutionRequirement/GetByPhaseId?PhaseId={phase_id}",
                "water_api": f"http://162.248.52.111:8082/WaterChemistry?WaterId={water_id}&CatalogId={catalog_id}",
                "user_api": "http://162.248.52.111:8082/User",
                "micronutrient_supplementation": "Local Database Auto-Addition",
                "optimization_engine": "Advanced Linear Programming (PuLP/SciPy)" if linear_programming else "Deterministic Chemistry",
                "safety_system": "Integrated Nutrient Caps"
            }
        }

        # ===== FINAL SUCCESS SUMMARY =====
        print(f"\n{'='*80}")
        print(
            f"[SUCCESS] ENHANCED SWAGGER INTEGRATION WITH LINEAR PROGRAMMING COMPLETE")
        print(f"{'='*80}")
        print(
            f"[INFO] User: {user_info.get('userEmail', 'N/A')} (ID: {user_id})")
        print(f"[INFO] Method: {method.upper()}")
        print(
            f"[INFO] Linear Programming: {'ENABLED' if linear_programming else 'DISABLED'}")
        print(
            f"[INFO] Safety Caps: {'APPLIED' if apply_safety_caps else 'DISABLED'}")
        print(f"[INFO] API Fertilizers: {len(api_fertilizers)}")
        print(f"[INFO] Enhanced Fertilizers: {len(enhanced_fertilizers)}")
        print(
            f"[INFO] Active Fertilizers: {response['optimization_summary']['active_fertilizers']}")
        print(
            f"[INFO] Total Dosage: {response['optimization_summary']['total_dosage_g_per_L']:.3f} g/L")
        print(
            f"[TARGET] Average Deviation: {response['optimization_summary']['average_deviation_percent']:.2f}%")
        # 🆕 NEW: Add cost info to final success summary
        print(
            f"[COST] Total Cost: ₡{cost_analysis['total_cost_concentrated']:.3f}")
        print(
            f"[COST] Cost/Liter: ₡{cost_analysis['cost_per_liter_diluted']:.4f}")
        print(
            f"[COST] API Coverage: {cost_analysis['pricing_summary']['api_price_coverage']:.1f}%")

        if linear_programming:
            print(
                f"[INFO] Success Rate: {success_rate:.1f}% (Excellent + Good nutrients)")
            print(f"[INFO] Solver Time: {lp_result.solver_time_seconds:.2f}s")
        print(f"{'='*80}")

        return response

    except Exception as e:
        print(f"\n[FAILED] Enhanced Swagger integration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, detail=f"Enhanced integration error: {str(e)}")


@app.get("/swagger-integrated-calculation-with-constraints")
async def swagger_integrated_calculation_with_constraints(
    user_id: int = Query(default=1),
    catalog_id: int = Query(default=1),
    phase_id: int = Query(default=1),
    water_id: int = Query(default=1),
    volume_liters: float = Query(default=1000),
    # Constraint parameters (JSON strings)
    fertilizer_constraints: str = Query(
        default="{}",
        description="JSON object with fertilizer constraints. Example: {'Cloruro de calcio': {'max': 500, 'min': 100}, 'Sulfato de potasio': {}}"
    ),
    # Optimization parameters
    linear_programming: bool = Query(default=True),
    apply_safety_caps: bool = Query(default=True),
    strict_caps: bool = Query(default=True),
    # Constraint handling options
    ignore_target_deviations: bool = Query(
        default=True, 
        description="If true, allows larger deviations from target concentrations to respect constraints"
    ),
    constraint_priority: str = Query(
        default="high",
        description="Priority level for constraints: 'low', 'medium', 'high', 'absolute'"
    )
):
    """
    [INFO] SWAGGER API INTEGRATION WITH FERTILIZER CONSTRAINTS

    This endpoint allows you to specify volume/dosage constraints for individual fertilizers,
    even if it results in suboptimal nutrient targeting. Useful for practical limitations
    like available stock, equipment limits, or cost considerations.

    [CONSTRAINTS] FERTILIZER LIMITS: Set min/max dosages for specific fertilizers

    Key Features:
    - [NEW] Individual fertilizer constraints (min/max dosage in g/L)
    - [NEW] Constraint priority levels (low/medium/high/absolute)
    - [NEW] Option to ignore target deviations when constraints conflict
    - [CHECK] Linear Programming optimization with constraints
    - [CHECK] Real-time Swagger API integration
    - [CHECK] Professional PDF reports with constraint analysis
    - [CHECK] Cost and feasibility analysis

    Constraint Parameters:
    - fertilizer_constraints: JSON object defining min/max dosages per fertilizer
      Example: {"Cloruro de calcio": {"max": 0.5, "min": 0.1}, "Sulfato de potasio": {"max": 2.0}}
    - constraint_priority: How strictly to enforce constraints vs nutrient targets
    - ignore_target_deviations: Allow poor nutrient targeting to respect constraints

    Constraint Priority Levels:
    - 'low': Constraints are soft suggestions (can be violated for better targeting)
    - 'medium': Constraints are important but can be slightly exceeded
    - 'high': Constraints are strictly enforced (default)
    - 'absolute': Constraints cannot be violated under any circumstances

    Expected Results:
    - May show larger deviations from target concentrations
    - Constraint compliance will be reported in detail
    - Alternative solutions suggested if constraints make targets impossible

    Example Usage:
    /swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.5,"min":0.1}}&constraint_priority=high
    """
    print(f"\n{'='*90}")
    print(f"[CONSTRAINTS] SWAGGER API INTEGRATION WITH FERTILIZER CONSTRAINTS")
    print(f"{'='*90}")
    calculation_results = {}
    
    try:
        # Parse fertilizer constraints
        try:
            constraints = json.loads(fertilizer_constraints)
            print(f"[CONSTRAINTS] Parsed constraints: {constraints}")
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid fertilizer_constraints JSON: {str(e)}"
            )
        
        # Initialize Swagger API client
        swagger_client = SwaggerAPIClient("http://162.248.52.111:8082")
        print(f"\n[INFO] Authenticating with Swagger API...")
        login_result = await swagger_client.login("csolano@iapcr.com", "123")
        if not login_result.get('success'):
            raise HTTPException(
                status_code=401, detail="Authentication failed")
        print(f"[CHECK] Authentication successful!")

        # Get user information
        user_info = await swagger_client.get_user_by_id(user_id)
        print(
            f"[INFO] User: {user_info.get('userEmail', 'N/A')} (ID: {user_id})")

        # Fetch comprehensive data from API
        print(f"\n📡 Fetching comprehensive data from API...")

        # Fetch fertilizers from API
        # Fetch data from Swagger API
        print(f"[API] Fetching data from Swagger API...")
        try:
            requirements_data = await swagger_client.get_crop_phase_requirements(phase_id)
            water_data = await swagger_client.get_water_chemistry(water_id, catalog_id)
            api_fertilizers_data = await swagger_client.get_fertilizers(catalog_id)
            
            print(f"[API] ✅ Successfully fetched all API data")
        except Exception as e:
            print(f"[API] ❌ Failed to fetch API data: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Swagger API error: {str(e)}")
        
        # Process fertilizers with constraint information
        print(f"\n[PROCESS] Processing {len(api_fertilizers_data)} fertilizers with constraints...")
        
        api_fertilizers = []
        original_fertilizer_data = {}
        constraint_mapping = {}  # Map fertilizer names to constraints
        
        for fert_data in api_fertilizers_data:
            try:
                fertilizer = swagger_client.map_swagger_fertilizer_to_model(fert_data)
                api_fertilizers.append(fertilizer)
                original_fertilizer_data[fertilizer.name] = fert_data
                
                # Check if this fertilizer has constraints
                fertilizer_constraint = None
                for constraint_name, constraint_data in constraints.items():
                    # Match fertilizer names (case insensitive, partial matching)
                    if (constraint_name.lower() in fertilizer.name.lower() or 
                        fertilizer.name.lower() in constraint_name.lower()):
                        fertilizer_constraint = constraint_data
                        constraint_mapping[fertilizer.name] = constraint_data
                        print(f"  [CONSTRAINT] ✅ {fertilizer.name}: {constraint_data}")
                        break
                
                if fertilizer_constraint is None and fertilizer.name in constraints:
                    # Exact name match
                    constraint_mapping[fertilizer.name] = constraints[fertilizer.name]
                    print(f"  [CONSTRAINT] ✅ {fertilizer.name}: {constraints[fertilizer.name]}")
                    
            except Exception as e:
                print(f"  [FAILED] Error processing {fert_data.get('name', 'Unknown')}: {e}")
        
        print(f"[CONSTRAINTS] Applied constraints to {len(constraint_mapping)} fertilizers")
        
        # Map API data to calculation format
        target_concentrations = swagger_client.map_requirements_to_targets(requirements_data)
        water_analysis = swagger_client.map_water_to_analysis(water_data)
        
        # Use defaults if API data unavailable
        if not target_concentrations:
            target_concentrations = {
                'N': 150, 'P': 50, 'K': 200, 'Ca': 180, 'Mg': 50, 'S': 80,
                'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05
            }
        
        if not water_analysis:
            water_analysis = {
                'Ca': 20, 'K': 5, 'N': 2, 'P': 1, 'Mg': 8, 'S': 15,
                'Fe': 0.1, 'Mn': 0.05, 'Zn': 0.02, 'Cu': 0.01, 'B': 0.05, 'Mo': 0.005
            }
        
        # Apply safety caps if requested
        safe_targets = target_concentrations.copy()
        if apply_safety_caps:
            caps_result = apply_nutrient_caps_to_targets(
                target_concentrations, strict_mode=strict_caps
            )
            safe_targets = caps_result['adjusted_targets']
            print(f"[SAFETY] Applied safety caps to {len(caps_result['adjustments'])} nutrients")
        
        # Run constrained optimization
        print(f"\n[OPTIMIZATION] Running constrained linear programming...")
        
        if linear_programming:
            # Use the enhanced linear programming optimizer with constraints
            lp_result = optimize_with_constraints(
                fertilizers=api_fertilizers,
                target_concentrations=safe_targets,
                water_analysis=water_analysis,
                volume_liters=volume_liters,
                constraints=constraint_mapping,
                constraint_priority=constraint_priority,
                ignore_target_deviations=ignore_target_deviations
            )
            
            if lp_result.success:
                dosages = lp_result.dosages
                optimization_method = "Linear Programming (Constrained)"
                solver_info = {
                    "solver": lp_result.solver_used,
                    "solve_time": lp_result.solver_time_seconds,
                    "constraints_applied": len(constraint_mapping),
                    "constraints_violated": lp_result.constraints_violated,
                    "constraint_priority": constraint_priority
                }
                
                fertilizer_dosages = {}
                for fert_name, dosage_g_l in lp_result.dosages_g_per_L.items():
                    fertilizer_dosages[fert_name] = FertilizerDosage(
                        dosage_g_per_L=dosage_g_l,
                        dosage_ml_per_L=dosage_g_l  # Assuming density = 1.0
                    )
                
                calculation_results = {
                    'fertilizer_dosages': fertilizer_dosages,
                    'achieved_concentrations': lp_result.achieved_concentrations,
                    'deviations_percent': lp_result.deviations_percent,
                    'optimization_method': 'linear_programming',
                    'optimization_status': lp_result.optimization_status,
                    'objective_value': lp_result.objective_value,
                    'ionic_balance_error': lp_result.ionic_balance_error,
                    'solver_time_seconds': lp_result.solver_time_seconds,
                    'active_fertilizers': lp_result.active_fertilizers,
                    'total_dosage_g_per_L': lp_result.total_dosage,
                    'calculation_status': {
                        'success': lp_result.optimization_status == "Optimal",
                        'warnings': [] if lp_result.optimization_status == "Optimal" else [f"Optimization status: {lp_result.optimization_status}"],
                        'iterations': 1,
                        'convergence_error': np.mean([abs(d) for d in lp_result.deviations_percent.values()])
                    }
                }
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Constrained optimization failed: {lp_result.error_message}"
                )
        else:
            # Fallback to deterministic with constraint post-processing
            calculator = CompleteFertilizerCalculator()
            result = calculator.calculate_advanced_solution(
                api_fertilizers, safe_targets, water_analysis, volume_liters
            )
            dosages = result['dosages']
            
            # Apply constraints post-optimization
            dosages = apply_constraints_to_dosages(dosages, constraint_mapping, constraint_priority)
            optimization_method = "Deterministic (Constraint Post-Processing)"
            solver_info = {
                "method": "deterministic_constrained",
                "constraints_applied": len(constraint_mapping),
                "constraint_priority": constraint_priority
            }
        
        # Verify solution with constraint analysis
        print(f"\n[VERIFY] Verifying constrained solution...")
        achieved_concentrations = {}
        for element in safe_targets.keys():
            achieved_concentrations[element] = water_analysis.get(element, 0)
        
        # Calculate contributions from fertilizers
        for fert in api_fertilizers:
            dosage_g_l = dosages.get(fert.name, 0)
            if dosage_g_l > 0:
                dosage_mg_l = dosage_g_l * 1000
                
                for element, content_percent in fert.composition.cations.items():
                    if content_percent > 0:
                        contribution = nutrient_calc.calculate_element_contribution(
                            dosage_mg_l, content_percent, fert.chemistry.purity
                        )
                        achieved_concentrations[element] = achieved_concentrations.get(element, 0) + contribution
                
                for element, content_percent in fert.composition.anions.items():
                    if content_percent > 0:
                        contribution = nutrient_calc.calculate_element_contribution(
                            dosage_mg_l, content_percent, fert.chemistry.purity
                        )
                        achieved_concentrations[element] = achieved_concentrations.get(element, 0) + contribution
        
        # Create detailed verification results
        verification_result = verifier.create_detailed_verification(
            dosages, achieved_concentrations, safe_targets, water_analysis, volume_liters
        )
        
        # Add constraint analysis
        constraint_analysis = analyze_constraint_compliance(
            dosages, constraint_mapping, achieved_concentrations, safe_targets
        )
        
        verification_result['constraint_analysis'] = constraint_analysis
        verification_result['optimization_info'] = solver_info
        
        # Cost analysis
        cost_analysis = cost_analyzer.calculate_cost_analysis(
            dosages, original_fertilizer_data, volume_liters
        )
        
        # Generate constrained PDF report
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"constrained_fertilizer_report_{user_id}_{timestamp}.pdf"
        pdf_path = os.path.join("reports", pdf_filename)
        
        # calculate micronutrients_added
        micronutrients_list = [
            'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo'
        ]
        micronutrients_added = sum(1 for fert in api_fertilizers if any(
            elem in fert.composition.cations or elem in fert.composition.anions for elem in micronutrients_list
        ))
        
        calculation_data = {
            "integration_metadata": {
                "data_source": "Swagger API with Linear Programming",
                "user_id": user_id,
                "catalog_id": catalog_id,
                "phase_id": phase_id,
                "water_id": water_id,
                "fertilizers_analyzed": len(api_fertilizers_data),
                "fertilizers_processed": len(api_fertilizers),
                "micronutrients_added": micronutrients_added,
                "optimization_method": "linear_programming" if linear_programming else "deterministic",
                "linear_programming_enabled": linear_programming,
                "calculation_timestamp": datetime.now().isoformat(),
                "auto_micronutrient_supplementation": True,
                "safety_caps_applied": apply_safety_caps,
                "strict_caps_mode": strict_caps,
                "solver_time_seconds": getattr(lp_result, 'solver_time_seconds', 0.0) if linear_programming else 0.0,
                "optimization_status": getattr(lp_result, 'optimization_status', 'Success') if linear_programming else 'Success'
            },
            "calculation_results": calculation_results,
            "fertilizer_database": {},  # Add fertilizer database
            "water_analysis": water_analysis,  # FIXED: Add water analysis
            "target_concentrations": target_concentrations  # FIXED: Add target concentrations
        }
                    
        report_success = pdf_generator.generate_comprehensive_constrained_report(
            target_concentrations=safe_targets,
            achieved_concentrations=achieved_concentrations,
            dosages=dosages,
            water_analysis=water_analysis,
            volume_liters=volume_liters,
            cost_analysis=cost_analysis,
            constraint_analysis=constraint_analysis,
            solver_info=solver_info,
            fertilizer_data=original_fertilizer_data,
            verification_result=verification_result,
            filename=pdf_path,
            calculation_data=calculation_data,
        )
        
        # Prepare response
        response = {
            "status": "success",
            "message": "Constrained fertilizer calculation completed successfully",
            "calculation_info": {
                "user_id": user_id,
                "catalog_id": catalog_id,
                "phase_id": phase_id,
                "water_id": water_id,
                "volume_liters": volume_liters,
                "timestamp": timestamp,
                "optimization_method": optimization_method
            },
            "constraints": {
                "fertilizer_constraints": constraint_mapping,
                "constraint_priority": constraint_priority,
                "ignore_target_deviations": ignore_target_deviations,
                "constraints_applied": len(constraint_mapping)
            },
            "targets": safe_targets,
            "achieved": achieved_concentrations,
            "dosages": dosages,
            "water_analysis": water_analysis,
            "verification": verification_result,
            "constraint_analysis": constraint_analysis,
            "cost_analysis": cost_analysis,
            "optimization_summary": {
                "method": optimization_method,
                "solver_info": solver_info,
                "total_fertilizers_used": len([d for d in dosages.values() if d > 0.001]),
                "total_dosage_g_l": sum(dosages.values()),
                "average_deviation_percent": verification_result.get('average_deviation_percent', 0),
                "constraints_violated": constraint_analysis.get('violations', [])
            },
            "reports": {
                "pdf_generated": report_success,
                "pdf_filename": pdf_filename if report_success else None,
                "pdf_path": pdf_path if report_success else None
            }
        }
        
        # Calculate success metrics
        excellent_nutrients = sum(1 for result in verification_result['nutrient_analysis'] 
                                if result.get('status') == 'Excellent')
        good_nutrients = sum(1 for result in verification_result['nutrient_analysis'] 
                           if result.get('status') == 'Good')
        total_nutrients = len(verification_result['nutrient_analysis'])
        success_rate = (excellent_nutrients + good_nutrients) / total_nutrients * 100 if total_nutrients > 0 else 0
        
        # Print summary
        print(f"\n{'='*80}")
        print(f"[SUCCESS] CONSTRAINED FERTILIZER CALCULATION COMPLETED")
        print(f"{'='*80}")
        print(f"[CONSTRAINTS] Applied: {len(constraint_mapping)} fertilizer constraints")
        print(f"[CONSTRAINTS] Priority: {constraint_priority}")
        print(f"[CONSTRAINTS] Violations: {len(constraint_analysis.get('violations', []))}")
        print(f"[TARGET] Average Deviation: {verification_result.get('average_deviation_percent', 0):.2f}%")
        print(f"[COST] Total Cost: ₡{cost_analysis['total_cost_concentrated']:.3f}")
        print(f"[SUCCESS] Success Rate: {success_rate:.1f}% (Excellent + Good nutrients)")
        print(f"[REPORT] PDF: {pdf_filename if report_success else 'Failed'}")
        
        # Warning if constraints caused poor targeting
        if verification_result.get('average_deviation_percent', 0) > 10:
            print(f"[WARNING] Large deviations due to constraints - consider adjusting constraint_priority")
        
        print(f"{'='*80}")
        
        return response
        
    except Exception as e:
        print(f"\n[FAILED] Constrained calculation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Constrained calculation error: {str(e)}"
        )

from scipy.optimize import linprog, minimize, Bounds, LinearConstraint
def optimize_with_constraints(fertilizers, target_concentrations, water_analysis, 
                            volume_liters, constraints, constraint_priority, 
                            ignore_target_deviations):
    """
    Enhanced linear programming optimization with fertilizer constraints
    """
    try:
        import pulp as lp
        PULP_AVAILABLE = True
    except ImportError:
        PULP_AVAILABLE = False
    
    if not PULP_AVAILABLE:
        raise Exception("PuLP library required for constrained optimization")
    
    print(f"[LP-CONST] Setting up constrained optimization...")
    print(f"[LP-CONST] Constraints: {len(constraints)} fertilizers")
    print(f"[LP-CONST] Priority: {constraint_priority}")
    
    # Constraint weight mapping
    constraint_weights = {
        'low': 1.0,
        'medium': 100.0,
        'high': 10000.0,
        'absolute': 1000000.0
    }
    
    constraint_weight = constraint_weights.get(constraint_priority, 10000.0)
    
    # Calculate fertilizer targets (subtracting water contribution)
    fertilizer_targets = {}
    for nutrient, target in target_concentrations.items():
        water_contribution = water_analysis.get(nutrient, 0.0)
        fertilizer_target = max(0, target - water_contribution)
        fertilizer_targets[nutrient] = fertilizer_target
    
    # Create optimization problem
    prob = lp.LpProblem("Constrained_Fertilizer_Optimization", lp.LpMinimize)
    
    # Decision variables
    dosage_vars = {}
    for fert in fertilizers:
        var_name = f"dosage_{fert.name.replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')}"
        
        # Get constraints for this fertilizer
        fert_constraints = constraints.get(fert.name, {})
        min_dosage = fert_constraints.get('min', 0.0)
        max_dosage = fert_constraints.get('max', 5.0)  # Default max 5 g/L
        
        dosage_vars[fert.name] = lp.LpVariable(
            var_name, 
            lowBound=min_dosage, 
            upBound=max_dosage
        )
        
        if fert_constraints:
            print(f"  [CONSTRAINT] {fert.name}: min={min_dosage}, max={max_dosage} g/L")
    
    # Deviation variables
    deviation_vars_pos = {}
    deviation_vars_neg = {}
    for nutrient in fertilizer_targets.keys():
        var_name = nutrient.replace(' ', '_')
        deviation_vars_pos[nutrient] = lp.LpVariable(f"dev_pos_{var_name}", lowBound=0)
        deviation_vars_neg[nutrient] = lp.LpVariable(f"dev_neg_{var_name}", lowBound=0)
    
    # Constraint violation penalty variables
    constraint_violation_vars = {}
    for fert_name in constraints.keys():
        if fert_name in dosage_vars:
            constraint_violation_vars[fert_name] = lp.LpVariable(f"viol_{fert_name.replace(' ', '_')}", lowBound=0)
    
    # Objective function
    objective = 0
    
    # Target deviation penalties (lower weight if ignoring deviations)
    deviation_weight = 1000.0 if not ignore_target_deviations else 1.0
    
    for nutrient in fertilizer_targets.keys():
        target_value = fertilizer_targets[nutrient]
        if target_value > 0:
            weight = deviation_weight / target_value
            objective += weight * (deviation_vars_pos[nutrient] + deviation_vars_neg[nutrient])
    
    # Constraint violation penalties
    for fert_name, violation_var in constraint_violation_vars.items():
        objective += constraint_weight * violation_var
    
    # Dosage minimization (low priority)
    for var in dosage_vars.values():
        objective += 1.0 * var
    
    prob += objective
    
    # Nutrient balance constraints
    for nutrient in fertilizer_targets.keys():
        fertilizer_target = fertilizer_targets[nutrient]
        
        fertilizer_contribution = 0
        for fert in fertilizers:
            if fert.name in dosage_vars:
                dosage_var = dosage_vars[fert.name]
                
                cation_content = fert.composition.cations.get(nutrient, 0.0)
                anion_content = fert.composition.anions.get(nutrient, 0.0)
                total_content = cation_content + anion_content
                
                if total_content > 0:
                    contribution_factor = total_content * fert.chemistry.purity / 100.0 * 1000.0 / 100.0
                    fertilizer_contribution += dosage_var * contribution_factor
        
        # Balance equation with deviations
        prob += (fertilizer_contribution == fertilizer_target + 
                deviation_vars_pos[nutrient] - deviation_vars_neg[nutrient])
    
    # Total dosage constraint
    prob += lp.lpSum(dosage_vars.values()) <= 15.0
    
    # Solve the problem
    prob.solve(lp.PULP_CBC_CMD(msg=0))
    
    if prob.status == lp.LpStatusOptimal:
        # Extract solution
        solution_dosages = {}
        constraints_violated = []
        
        for fert_name, var in dosage_vars.items():
            dosage = var.varValue if var.varValue is not None else 0.0
            solution_dosages[fert_name] = max(0.0, dosage)
            
            # Check constraint violations
            if fert_name in constraints:
                constraint = constraints[fert_name]
                min_limit = constraint.get('min', 0.0)
                max_limit = constraint.get('max', float('inf'))
                
                if dosage < min_limit - 1e-6:
                    constraints_violated.append({
                        'fertilizer': fert_name,
                        'type': 'minimum',
                        'required': min_limit,
                        'actual': dosage,
                        'violation': min_limit - dosage
                    })
                elif dosage > max_limit + 1e-6:
                    constraints_violated.append({
                        'fertilizer': fert_name,
                        'type': 'maximum',
                        'required': max_limit,
                        'actual': dosage,
                        'violation': dosage - max_limit
                    })
        
        nutrient_list = list(fertilizer_targets.keys())  # FIXED: Use fertilizer targets
        n_nutrients = len(nutrient_list)
        n_fertilizers = len(fertilizers)
        
        # Constraints
        max_total_dosage = 15.0  # Maximum total dosage in g/L
        max_individual_dosage = 5.0  # Maximum individual dosage in g/L
        bounds = Bounds(0, max_individual_dosage)  # Individual dosage bounds
        
        # Total dosage constraint
        total_dosage_constraint = LinearConstraint(
            np.ones(n_fertilizers), 0, max_total_dosage
        )
        
        if n_fertilizers == 0 or n_nutrients == 0:
            print("HYPERFAILED")
            exit(1)
        A_matrix = np.zeros((n_nutrients, n_fertilizers))

        objective_weights = {
            'deviation_minimization': 1000.0,  # Highest priority: minimize deviations
            'cost_minimization': 1.0,          # Lower priority: minimize cost
            'dosage_minimization': 10.0,       # Medium priority: minimize total dosage
            'ionic_balance': 500.0             # High priority: maintain ionic balance
        }
        
        # Objective function: minimize sum of squared deviations
        def objective(x):
            dosages = x
            # Calculate fertilizer contributions only (no water added here)
            achieved_fertilizer = A_matrix @ dosages
            fertilizer_targets_array = np.array([fertilizer_targets[nutrient] for nutrient in nutrient_list])
            
            # Calculate weighted deviations against fertilizer targets
            deviations = np.abs(achieved_fertilizer - fertilizer_targets_array) / np.maximum(fertilizer_targets_array, 1e-6)
            
            # Primary objective: minimize deviations
            deviation_penalty = np.sum(deviations ** 2) * objective_weights['deviation_minimization']
            
            # Secondary objective: minimize total dosage
            dosage_penalty = np.sum(dosages) * objective_weights['dosage_minimization']
            
            return deviation_penalty + dosage_penalty
        
        x0 = np.full(n_fertilizers, 0.1)
        result = minimize(
            objective, x0,
            method='trust-constr',
            bounds=bounds,
            constraints=[total_dosage_constraint],
            options={'maxiter': 1000, 'disp': False}
        )
             
        # Extract dosages
        dosages = {}
        for i, fert in enumerate(fertilizers):
            dosage_value = max(0.0, result.x[i])
            dosages[fert.name] = dosage_value
                
        cleaned_dosages = {}
        for name, dosage in dosages.items():
            cleaned_dosages[name] = dosage if dosage >= 0.001 else 0.0
            
        # Calculate achieved concentrations (this adds water + fertilizer contributions)
        def _calculate_achieved_concentrations(
                                         dosages: Dict[str, float],
                                         water: Dict[str, float],
                                         fertilizers: List) -> Dict[str, float]:
            """Calculate achieved nutrient concentrations from dosages"""
            achieved = water.copy()
            
            fert_map = {f.name: f for f in fertilizers}
            
            for fert_name, dosage_g_l in dosages.items():
                if dosage_g_l > 0 and fert_name in fert_map:
                    fertilizer = fert_map[fert_name]
                    dosage_mg_l = dosage_g_l * 1000
                    
                    # Add contributions from cations
                    for element, content_percent in fertilizer.composition.cations.items():
                        if content_percent > 0:
                            contribution = nutrient_calc.calculate_element_contribution(
                                dosage_mg_l, content_percent, fertilizer.chemistry.purity
                            )
                            achieved[element] = achieved.get(element, 0) + contribution
                    
                    # Add contributions from anions
                    for element, content_percent in fertilizer.composition.anions.items():
                        if content_percent > 0:
                            contribution = nutrient_calc.calculate_element_contribution(
                                dosage_mg_l, content_percent, fertilizer.chemistry.purity
                            )
                            achieved[element] = achieved.get(element, 0) + contribution
            
            return achieved
    
        achieved_concentrations = _calculate_achieved_concentrations(
            dosages, water_analysis, fertilizers
        )
        
        # Calculate deviations against EXPECTED FINAL CONCENTRATIONS
        deviations_percent = {}
        for nutrient in target_concentrations.keys():
            fertilizer_target = target_concentrations[nutrient]
            water_contribution = water_analysis.get(nutrient, 0.0)
            expected_final = water_contribution + fertilizer_target
            achieved = achieved_concentrations.get(nutrient, 0.0)
            
            if expected_final > 0:
                deviation = ((achieved - expected_final) / expected_final) * 100.0
            else:
                deviation = 0.0
            deviations_percent[nutrient] = deviation
        
        
        active_fertilizers = len([d for d in cleaned_dosages.values() if d > 0])
            
        return LinearProgrammingResultConstrained(
            success=True,
            dosages=solution_dosages,
            total_dosage=sum(solution_dosages.values()),
            solver_used="PuLP (Constrained)",
            solver_time_seconds=0.1,  # Approximate
            constraints_violated=constraints_violated,
            dosages_g_per_L=cleaned_dosages,
            achieved_concentrations=achieved_concentrations,
            deviations_percent=deviations_percent,
            objective_value=lp.value(prob.objective),
            ionic_balance_error=0.0,  # Placeholder, calculate if needed
            active_fertilizers=active_fertilizers,
            optimization_status="Optimal",
            error_message=None
        )
    else:
        return LinearProgrammingResultConstrained(
            success=False,
            dosages={},
            total_dosage=0.0,
            solver_used="PuLP (Constrained)",
            solver_time_seconds=0.1,
            constraints_violated=[],
            dosages_g_per_L=[],
            error_message=f"Optimization failed with status: {lp.LpStatus[prob.status]}",
            achieved_concentrations={},
            deviations_percent={},
            optimization_status="Failed",
            objective_value=None,
            ionic_balance_error=None,
            active_fertilizers=[],
        )


def apply_constraints_to_dosages(dosages, constraints, priority):
    """
    Apply constraints to existing dosages (for non-LP methods)
    """
    print(f"[CONSTRAINTS] Applying post-optimization constraints...")
    
    constrained_dosages = dosages.copy()
    violations = []
    
    for fert_name, constraint in constraints.items():
        if fert_name in constrained_dosages:
            current_dosage = constrained_dosages[fert_name]
            min_limit = constraint.get('min', 0.0)
            max_limit = constraint.get('max', float('inf'))
            
            # Apply minimum constraint
            if current_dosage < min_limit:
                constrained_dosages[fert_name] = min_limit
                violations.append({
                    'fertilizer': fert_name,
                    'type': 'minimum_adjustment',
                    'original': current_dosage,
                    'adjusted': min_limit
                })
                print(f"  [MIN] {fert_name}: {current_dosage:.3f} → {min_limit:.3f} g/L")
            
            # Apply maximum constraint
            elif current_dosage > max_limit:
                constrained_dosages[fert_name] = max_limit
                violations.append({
                    'fertilizer': fert_name,
                    'type': 'maximum_adjustment',
                    'original': current_dosage,
                    'adjusted': max_limit
                })
                print(f"  [MAX] {fert_name}: {current_dosage:.3f} → {max_limit:.3f} g/L")
    
    return constrained_dosages


def analyze_constraint_compliance(dosages, constraints, achieved, targets):
    """
    Analyze how well the solution complies with constraints and targets
    """
    analysis = {
        'total_constraints': len(constraints),
        'constraints_met': 0,
        'violations': [],
        'constraint_details': [],
        'target_impact': {}
    }
    
    for fert_name, constraint in constraints.items():
        dosage = dosages.get(fert_name, 0.0)
        min_limit = constraint.get('min', 0.0)
        max_limit = constraint.get('max', float('inf'))
        
        met = min_limit <= dosage <= max_limit
        if met:
            analysis['constraints_met'] += 1
        
        detail = {
            'fertilizer': fert_name,
            'dosage': dosage,
            'min_required': min_limit,
            'max_allowed': max_limit,
            'compliance': 'met' if met else 'violated',
            'violation_amount': 0.0
        }
        
        if dosage < min_limit:
            detail['violation_amount'] = min_limit - dosage
            detail['violation_type'] = 'below_minimum'
            analysis['violations'].append(detail)
        elif dosage > max_limit:
            detail['violation_amount'] = dosage - max_limit
            detail['violation_type'] = 'above_maximum'
            analysis['violations'].append(detail)
        
        analysis['constraint_details'].append(detail)
    
    # Calculate target impact
    total_deviation = 0
    nutrient_count = 0
    
    for nutrient, target in targets.items():
        achieved_value = achieved.get(nutrient, 0)
        if target > 0:
            deviation = abs(achieved_value - target) / target * 100
            total_deviation += deviation
            nutrient_count += 1
    
    analysis['target_impact'] = {
        'average_deviation_percent': total_deviation / nutrient_count if nutrient_count > 0 else 0,
        'total_nutrients_analyzed': nutrient_count
    }
    
    return analysis

@app.get("/")
async def root():
    """API health check and information"""
    return {
        "message": "Fertilizer Calculator API",
        "version": "1.0.0",
        "environment": API_ENVIRONMENT,
        "swagger_api": SWAGGER_API_URL,
        "endpoints": {
            "docs": "/docs",
            "swagger_calculation": "/swagger-integrated-calculation",
            "health": "/health"
        }
    }
    
def adjust_targets_for_water_chemistry(target_concentrations: Dict[str, float],
                                       water_analysis: Dict[str, float]) -> tuple[Dict[str, float], Dict[str, float]]:
    """
    CORRECTED: Target concentrations are ADDITIVE to water chemistry.
    The API provides fertilizer contribution targets, not final concentration targets.
    FIXED: Ensure no negative fertilizer targets by respecting water chemistry minimums.

    Args:
        target_concentrations: Fertilizer contribution targets (mg/L to add above water)
        water_analysis: Water chemistry analysis (mg/L baseline)

    Returns:
        Tuple of (fertilizer_targets, expected_final_concentrations)
    """
    fertilizer_targets = {}
    expected_final_concentrations = {}

    print(f"\n[WATER] INTERPRETING TARGETS AS ADDITIVE TO WATER CHEMISTRY:")
    print(f"{'Nutrient':<8} | {'Original':<10} | {'Water':<8} | {'Adjusted':<10} | {'Final':<8} | {'Status'}")
    print(f"{'':^8} | {'Target':<10} | {'Baseline':<8} | {'Fertilizer':<10} | {'Expected':<8} | {''}")
    print(f"{'-'*75}")

    for nutrient, original_target in target_concentrations.items():
        water_content = water_analysis.get(nutrient, 0.0)

        # CRITICAL FIX: Ensure fertilizer targets are never negative
        # If target is less than water content, fertilizer should provide 0
        # The final concentration will be at least the water baseline
        fertilizer_target = max(0.0, original_target - water_content)

        # Calculate expected final concentration
        expected_final = water_content + fertilizer_target
        expected_final_concentrations[nutrient] = expected_final
        fertilizer_targets[nutrient] = fertilizer_target

        # Determine status and any adjustments made
        if original_target < water_content:
            status = f"ADJUSTED (was {original_target:.1f})"
            print(f"{nutrient:<8} | {original_target:<10.3f} | {water_content:<8.3f} | {fertilizer_target:<10.3f} | {expected_final:<8.3f} | {status}")
        elif fertilizer_target == 0:
            status = "Water Only"
            print(f"{nutrient:<8} | {original_target:<10.3f} | {water_content:<8.3f} | {fertilizer_target:<10.3f} | {expected_final:<8.3f} | {status}")
        elif water_content == 0:
            status = "Fertilizers Only"
            print(f"{nutrient:<8} | {original_target:<10.3f} | {water_content:<8.3f} | {fertilizer_target:<10.3f} | {expected_final:<8.3f} | {status}")
        else:
            status = "Water + Fertilizers"
            print(f"{nutrient:<8} | {original_target:<10.3f} | {water_content:<8.3f} | {fertilizer_target:<10.3f} | {expected_final:<8.3f} | {status}")

    print(f"{'-'*75}")
    print(f"[INFO] Fertilizer targets are additive to water baseline")
    print(f"[INFO] Final concentration = Water baseline + Fertilizer contribution")
    print(f"[FIXED] No negative fertilizer targets - minimum is 0 mg/L")

    return fertilizer_targets, expected_final_concentrations


if __name__ == "__main__":
    uvicorn.run(
        "main_api:app",
        host="0.0.0.0",
        port=PORT,
        reload=API_ENVIRONMENT == "development"
    )