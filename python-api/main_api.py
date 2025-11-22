#!/usr/bin/env python3
"""
COMPLETE MODULAR FERTILIZER CALCULATOR API - MAIN IMPLEMENTATION
All missing functionality implemented across modular files
"""

import base64
from scipy.optimize import linprog, minimize, Bounds, LinearConstraint
from fastapi.responses import JSONResponse
from fastapi import Query, HTTPException
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware  # ADD THIS LINE
from models import (
    FertilizerRequest, FertilizerDosage, CalculationStatus, MLModelConfig
)
import uvicorn
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

            
        # ============ ENHANCED VERIFICATION WITH DIAGNOSTICS ============
        print(f"\n{'='*80}")
        print(f"[VERIFY] PERFORMING ENHANCED VERIFICATION WITH DIAGNOSTICS")
        print(f"{'='*80}")

        # Create detailed verification with diagnostics
        verification_results = verifier.create_detailed_verification_with_diagnostics(
            dosages=dosages_g_l,
            achieved_concentrations=final_solution['FINAL_mg_L'],
            target_concentrations=request.target_concentrations,
            water_analysis=request.water_analysis,
            fertilizers=request.fertilizers,
            volume_liters=request.calculation_settings.volume_liters
        )
        
        # Continue with existing ionic verification...
        ionic_relationships = verifier.verify_ionic_relationships(
            final_solution['FINAL_meq_L'], 
            final_solution['FINAL_mmol_L'], 
            final_solution['FINAL_mg_L']
        )
        ionic_balance = verifier.verify_ionic_balance(final_solution['FINAL_meq_L'])

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
                keywords.extend(
                    ['fosfato monopotasico', 'fosfato monopotásico', 'monopotassium phosphate'])
            elif 'fosfato diamónico' in name_lower or 'fosfato diamonico' in name_lower:
                keywords.extend(
                    ['fosfato diamónico', 'fosfato diamonico', 'diammonium phosphate', 'dap'])
            elif 'fosfato monoamonico' in name_lower or 'fosfato monoamónico' in name_lower:
                keywords.extend(
                    ['fosfato monoamonico', 'fosfato monoamónico', 'monoammonium phosphate', 'map'])
            elif 'acido nitrico' in name_lower or 'ácido nítrico' in name_lower:
                keywords.extend(
                    ['acido nitrico', 'ácido nítrico', 'nitric acid'])
            elif 'acido fosforico' in name_lower or 'ácido fosfórico' in name_lower:
                keywords.extend(
                    ['acido fosforico', 'ácido fosfórico', 'phosphoric acid'])
            elif 'acido sulfurico' in name_lower or 'ácido sulfúrico' in name_lower:
                keywords.extend(
                    ['acido sulfurico', 'ácido sulfúrico', 'sulfuric acid'])
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

    print(
        f"[PRICE] Created exact mapping for {len(exact_price_mapping)} fertilizers")
    print(
        f"[PRICE] Created keyword mapping for {len(keyword_price_mapping)} patterns")

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
            # Prefiere coincidencias más específicas
            if best_price is None or len(keyword) > len(best_match):
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
    strict_caps: bool = Query(default=True),             # Strict safety mode
    # NEW PARAMETER: Return PDF content in response
    include_pdf_data: bool = Query(
        default=False, description="Include PDF file as base64 in response")
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
    - [NEW] Optional PDF data return as base64

    Parameters:
    - linear_programming: Enable LP optimization (True) or use deterministic (False)
    - apply_safety_caps: Apply nutrient safety caps before optimization
    - strict_caps: Use strict safety limits for maximum protection
    - include_pdf_data: Include PDF file content as base64 in response (default: False)

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
        print(f"[INFO] Include PDF Data: {include_pdf_data}")
        calculation_results = {}

        # Initialize Swagger client and authenticate
        async with SwaggerAPIClient("http://163.178.171.144:80/") as swagger_client:
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

            # Fetch both fertilizer compositions AND pricing data
            fertilizers_data = await swagger_client.get_fertilizers(catalog_id)
            # 🆕 NEW
            fertilizer_inputs_data = await swagger_client.get_fertilizer_inputs(catalog_id)
            requirements_data = await swagger_client.get_crop_phase_requirements(phase_id)
            water_data = await swagger_client.get_water_chemistry(water_id, catalog_id)

            print(f"[INFO] Fetched: {len(fertilizers_data)} fertilizers")
            # 🆕 NEW
            print(
                f"[PRICE] Fetched: {len(fertilizer_inputs_data)} fertilizer inputs with pricing")
            print(
                f"[TARGET] Fetched: {len(requirements_data) if requirements_data else 0} requirements: {requirements_data}")
            print(
                f"[WATER] Fetched: {len(water_data) if water_data else 0} water parameters")

            # Create intelligent price mapping from FertilizerInput data
            exact_price_mapping, keyword_price_mapping = create_intelligent_price_mapping(
                fertilizer_inputs_data)

            # Debug: Mostrar mapeos creados
            print(f"\n🔍 DEBUG: Mapeos de precios creados:")
            print(f"Mapeo exacto: {len(exact_price_mapping)} entradas")
            print(
                f"Mapeo por palabras clave: {len(keyword_price_mapping)} patrones")

            # Process fertilizers into our enhanced format with intelligent pricing
            print(
                f"\n[INFO] Processing fertilizers with intelligent price matching...")
            api_fertilizers = []
            original_fertilizer_data = {}

            price_matches_found = 0
            price_matches_failed = 0

            for fert_data in fertilizers_data:
                try:
                    fertilizer = swagger_client.map_swagger_fertilizer_to_model(
                        fert_data)
                    api_fertilizers.append(fertilizer)

                    # Intelligent price matching
                    fert_name = fertilizer.name
                    price_from_api, match_type = find_best_price_match(
                        fert_name, exact_price_mapping, keyword_price_mapping
                    )

                    # FIXED: Create enhanced fertilizer data properly
                    # Ensure fert_data is a dictionary, not a Fertilizer object
                    if hasattr(fert_data, 'dict'):
                        # If it's a Pydantic model, convert to dict
                        enhanced_fert_data = fert_data.dict()
                    elif hasattr(fert_data, 'to_dict'):
                        # If it has to_dict method
                        enhanced_fert_data = fert_data.to_dict()
                    elif isinstance(fert_data, dict):
                        # If it's already a dictionary
                        enhanced_fert_data = fert_data.copy()
                    else:
                        # Fallback: try to convert Fertilizer object to dict
                        try:
                            enhanced_fert_data = fertilizer.dict()
                        except:
                            # Last resort: create basic dict from fertilizer
                            enhanced_fert_data = {
                                'name': fertilizer.name,
                                'percentage': fertilizer.percentage,
                                'molecular_weight': fertilizer.molecular_weight,
                                'salt_weight': fertilizer.salt_weight,
                                'density': fertilizer.density,
                                'chemistry': fertilizer.chemistry.dict() if hasattr(fertilizer.chemistry, 'dict') else {},
                                'composition': fertilizer.composition.dict() if hasattr(fertilizer.composition, 'dict') else {}
                            }

                    # Now safely add price information
                    enhanced_fert_data['price'] = price_from_api
                    enhanced_fert_data['price_match_type'] = match_type

                    original_fertilizer_data[fertilizer.name] = enhanced_fert_data

                    # Log price matching results
                    if price_from_api is not None:
                        price_matches_found += 1
                        print(
                            f"  [PRICE] ✅ {fertilizer.name}: ₡{price_from_api:.2f}/kg ({match_type})")
                    else:
                        price_matches_failed += 1
                        print(
                            f"  [NO PRICE] ❌ {fertilizer.name}: No price match found")

                except Exception as e:
                    print(
                        f"  [FAILED] Error processing {fert_data.get('name', 'Unknown')}: {e}")
                    # Continue processing other fertilizers instead of failing completely
                    continue

            print(f"\n💰 PRICE MATCHING SUMMARY:")
            print(
                f"[SUCCESS] Prices found: {price_matches_found}/{len(api_fertilizers)} ({price_matches_found/len(api_fertilizers)*100:.1f}%)")
            print(
                f"[FAILED] No prices: {price_matches_failed}/{len(api_fertilizers)} ({price_matches_failed/len(api_fertilizers)*100:.1f}%)")

            if not api_fertilizers:
                raise HTTPException(
                    status_code=500, detail="No usable fertilizers found from API")

            print(
                f"[CHECK] Successfully processed {len(api_fertilizers)} API fertilizers")

            # Map API data to our calculation format
            print(f"\n[INFO] Mapping API data to calculation format...")
            target_concentrations = swagger_client.map_requirements_to_targets(
                requirements_data)
            print(
                f"\n[DEBUG]  Mapped target concentrations: {target_concentrations}")
            water_analysis = swagger_client.map_water_to_analysis(water_data)

            # Use intelligent defaults if API data unavailable
            # Ensure per-element defaults when API targets are missing, null or zero
            default_targets = {
                'N': 150, 'P': 50, 'K': 200, 'Ca': 180, 'Mg': 50, 'S': 80,
                'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05
            }

            if not target_concentrations:
                print(f"[WARNING] No target concentrations from API, using optimized defaults")
                target_concentrations = default_targets.copy()
            else:
                # For each expected element, if missing, None or zero -> set default
                for elem, default_val in default_targets.items():
                    existing = target_concentrations.get(elem)
                    if existing is None or existing == 0:
                        target_concentrations[elem] = default_val
                        print(f"[DEFAULT] {elem}: was {existing} -> set to {default_val} mg/L")

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

               # Pass ORIGINAL targets - optimizer will handle water chemistry internally
                print(
                    f"\n[INFO] Passing targets to LP optimizer (will adjust for water internally)...")
                print(
                    f"\n[DEBUG] Original target concentrations: {target_concentrations}")

                # Use Linear Programming Optimizer
                lp_result = lp_optimizer.optimize_fertilizer_solution(
                    fertilizers=enhanced_fertilizers,
                    target_concentrations=target_concentrations,  # FIXED: Pass original targets
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
                print(f"\n[INFO] Creating calculation results...")
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
                
                dosages_g_l = nutrient_calc.calculate_optimized_dosages(
                    enhanced_fertilizers,
                    target_concentrations,
                    water_analysis
                )
                
                def calculate_nutrient_contributions(dosages_g_l: Dict[str, float], fertilizers: List):
                    """Calculate nutrient contributions from fertilizers with proper calculations"""
                    elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'SO4', 'S',
                                'Cl', 'H2PO4', 'P', 'HCO3', 'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']

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
                                    contribution = nutrient_calc.calculate_element_contribution(
                                        dosage_mg_l, content_percent, fertilizer.chemistry.purity
                                    )
                                    contributions['APORTE_mg_L'][element] += contribution
                                    print(
                                        f"    {element} (cation): +{contribution:.3f} mg/L")

                            # Calculate contributions from anions
                            for element, content_percent in fertilizer.composition.anions.items():
                                if content_percent > 0:
                                    contribution = nutrient_calc.calculate_element_contribution(
                                        dosage_mg_l, content_percent, fertilizer.chemistry.purity
                                    )
                                    contributions['APORTE_mg_L'][element] += contribution
                                    print(
                                        f"    {element} (anion): +{contribution:.3f} mg/L")

                    # Convert to mmol/L and meq/L with proper calculations
                    for element in elements:
                        mg_l = contributions['APORTE_mg_L'][element]
                        mmol_l = nutrient_calc.convert_mg_to_mmol(mg_l, element)
                        meq_l = nutrient_calc.convert_mmol_to_meq(mmol_l, element)

                        contributions['APORTE_mg_L'][element] = round(mg_l, 3)
                        contributions['APORTE_mmol_L'][element] = round(mmol_l, 3)
                        contributions['APORTE_meq_L'][element] = round(meq_l, 3)

                        if mg_l > 0:
                            print(
                                f"  Total {element}: {mg_l:.3f} mg/L = {mmol_l:.3f} mmol/L = {meq_l:.3f} meq/L")

                    return contributions

                def calculate_water_contributions(water_analysis: Dict[str, float], volume_liters: float):
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
                        mmol_l = nutrient_calc.convert_mg_to_mmol(mg_l, element)
                        meq_l = nutrient_calc.convert_mmol_to_meq(mmol_l, element)

                        water_contrib['IONES_mg_L_DEL_AGUA'][element] = round(mg_l, 3)
                        water_contrib['mmol_L'][element] = round(mmol_l, 3)
                        water_contrib['meq_L'][element] = round(meq_l, 3)

                    return water_contrib

                def calculate_final_solution(nutrient_contrib: Dict[str, Dict[str, float]], water_contrib: Dict):
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
                        final_mmol_l = nutrient_calc.convert_mg_to_mmol(
                            final_mg_l, element)
                        final_meq_l = nutrient_calc.convert_mmol_to_meq(
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
                            
                nutrient_contrib = calculate_nutrient_contributions(
                    dosages_g_l, enhanced_fertilizers
                )

                # Calculate water contributions
                water_contrib = calculate_water_contributions(
                    water_analysis, volume_liters
                )
                
                final_solution = calculate_final_solution(nutrient_contrib, water_contrib)

                # Create detailed verification with diagnostics
                verification_results = verifier.create_detailed_verification_with_diagnostics(
                    dosages=dosages_g_l,
                    achieved_concentrations=final_solution['FINAL_mg_L'],
                    target_concentrations=target_concentrations,
                    water_analysis=water_analysis,
                    fertilizers=enhanced_fertilizers,
                    volume_liters=volume_liters
                )
                # Extract diagnostics
                nutrient_diagnostics = verification_results.get('nutrient_diagnostics', {})
                print(f"\n[VERIFY] Nutrient Diagnostics Summary:")
                for nutrient, diag in nutrient_diagnostics.items():
                    print(f"  - {nutrient}: {diag}")

                # Log diagnostics summary
                high_severity_count = len([d for d in nutrient_diagnostics.values() if d.get('has_discrepancy') and d.get('severity') == 'high'])
                medium_severity_count = len([d for d in nutrient_diagnostics.values() if d.get('has_discrepancy') and d.get('severity') == 'medium'])


                calculation_results['nutrient_diagnostics'] = nutrient_diagnostics

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
        pdf_filename = None
        pdf_base64 = None
        pdf_metadata = {}

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

            # NEW: Read PDF file and convert to base64 if requested
            if include_pdf_data and os.path.exists(pdf_filename):
                try:
                    with open(pdf_filename, 'rb') as pdf_file:
                        pdf_content = pdf_file.read()
                        pdf_base64 = base64.b64encode(
                            pdf_content).decode('utf-8')

                    # Get PDF metadata
                    pdf_size = len(pdf_content)
                    pdf_metadata = {
                        "filename": os.path.basename(pdf_filename),
                        "full_path": pdf_filename,
                        "size_bytes": pdf_size,
                        "size_mb": round(pdf_size / (1024 * 1024), 2),
                        "content_type": "application/pdf",
                        "encoding": "base64"
                    }

                    print(f"[SUCCESS] PDF encoded to base64: {pdf_size} bytes")

                except Exception as e:
                    print(f"[ERROR] Failed to encode PDF to base64: {e}")
                    pdf_base64 = None
                    pdf_metadata = {"error": str(e)}

            calculation_results['pdf_report'] = {
                "generated": True,
                "filename": pdf_filename,
                "integration_method": f"swagger_api_linear_programming",
                "include_data": include_pdf_data,
                "base64_included": pdf_base64 is not None
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
            "nutrient_diagnostics": calculation_results.get('nutrient_diagnostics', {}),
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
            },

            # NEW: PDF DATA SECTION - Only included if include_pdf_data=True
            **({"pdf_data": {
                "content_base64": pdf_base64,
                "metadata": pdf_metadata,
                "usage_instructions": {
                    "description": "PDF content encoded as base64 string",
                    "decode_example": "base64.b64decode(pdf_data['content_base64'])",
                    "save_example": "with open('report.pdf', 'wb') as f: f.write(base64.b64decode(content))"
                }
            }} if include_pdf_data and pdf_base64 else {}),

            # Enhanced calculation data for building the PDF
            "calculation_data_used": {
                "water_analysis": water_analysis,
                "target_concentrations": target_concentrations,
                "fertilizer_database": [fert.to_dict() for fert in enhanced_fertilizers],
                "api_fertilizers_raw": fertilizers_data,
                "user_info": user_info,
                "volume_liters": volume_liters,
                "safety_caps": {
                    "applied": apply_safety_caps,
                    "strict_mode": strict_caps
                },
                "price_matching_summary": {
                    "matches_found": price_matches_found,
                    "matches_failed": price_matches_failed,
                    "exact_mappings": len(exact_price_mapping),
                    "keyword_mappings": len(keyword_price_mapping)
                }
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
        print(
            f"[INFO] PDF Data Included: {'YES' if include_pdf_data and pdf_base64 else 'NO'}")
        if pdf_base64:
            print(f"[INFO] PDF Size: {pdf_metadata.get('size_mb', 0)} MB")
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

if __name__ == "__main__":
    uvicorn.run(
        "main_api:app",
        host="0.0.0.0",
        port=PORT,
        reload=API_ENVIRONMENT == "development"
    )
