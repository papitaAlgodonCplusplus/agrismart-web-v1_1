from pydantic import BaseModel
from typing import Dict, List, Optional, Any
# ==============================================================================
# LINEAR PROGRAMMING MODELS - ADD TO models.py
# ==============================================================================

from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import numpy as np
from dataclasses import dataclass

class LinearProgrammingConfig(BaseModel):
    """Configuration for linear programming optimization"""
    solver_preference: str = "pulp"  # Options: "pulp", "scipy"
    max_individual_dosage: float = 5.0  # g/L
    max_total_dosage: float = 15.0  # g/L
    min_dosage_threshold: float = 0.001  # g/L
    deviation_weight: float = 1000.0  # Priority weight for minimizing deviations
    dosage_weight: float = 10.0  # Priority weight for minimizing dosages
    ionic_balance_weight: float = 500.0  # Priority weight for ionic balance
    max_solver_time: int = 60  # seconds
    tolerance: float = 1e-6
    apply_safety_caps: bool = True
    strict_caps: bool = True

class LinearProgrammingResult(BaseModel):
    """Results from linear programming optimization"""
    dosages_g_per_L: Dict[str, float]
    achieved_concentrations: Dict[str, float]
    deviations_percent: Dict[str, float]
    optimization_status: str
    objective_value: float
    ionic_balance_error: float
    solver_time_seconds: float
    active_fertilizers: int
    total_dosage: float
    

class NutrientDeviationAnalysis(BaseModel):
    """Detailed analysis of nutrient deviations"""
    nutrient: str
    target_mg_l: float
    achieved_mg_l: float
    deviation_percent: float
    status: str  # "Excellent", "Good", "Low", "High", "Deviation Low", "Deviation High"
    nutrient_type: str  # "Macro", "Micro"
    water_contribution: float
    fertilizer_contribution: float

class FertilizerUsageAnalysis(BaseModel):
    """Analysis of fertilizer usage efficiency"""
    fertilizer_name: str
    dosage_g_per_L: float
    dosage_ml_per_L: float
    utilization_percent: float
    primary_nutrients_supplied: List[str]
    cost_efficiency_score: Optional[float] = None

class LinearProgrammingReport(BaseModel):
    """Comprehensive linear programming optimization report"""
    optimization_summary: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    fertilizer_usage: Dict[str, Any]
    nutrient_analysis: List[NutrientDeviationAnalysis]
    fertilizer_analysis: List[FertilizerUsageAnalysis]
    recommendations: List[str]
    comparison_with_deterministic: Optional[Dict[str, Any]] = None

class OptimizationComparison(BaseModel):
    """Comparison between different optimization methods"""
    methods_compared: List[str]
    performance_metrics: Dict[str, Dict[str, float]]
    winner: str
    improvement_percent: float
    recommendation: str

class SafetyCapsResult(BaseModel):
    """Results from applying nutrient safety caps"""
    capped_concentrations: Dict[str, float]
    adjustments_made: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]
    total_adjustments: int
    strict_mode: bool
    safety_score: float
    summary: Dict[str, Any]

# ==============================================================================
# ENHANCED REQUEST MODEL FOR LINEAR PROGRAMMING
# ==============================================================================

class CalculationSettings(BaseModel):
    """Settings for calculation"""
    volume_liters: float = 1000.0  # Default volume in liters
    precision: int = 2  # Decimal precision for results
    units: str = "mg/L"  # Units for nutrient concentrations
    crop_phase: str = "General"  # Crop growth phase (e.g., "Vegetative", "Flowering")

class FertilizerComposition(BaseModel):
    cations: Dict[str, float]
    anions: Dict[str, float]


class FertilizerChemistry(BaseModel):
    formula: str
    purity: float
    solubility: float
    is_ph_adjuster: bool

class Fertilizer(BaseModel):
    name: str
    percentage: float
    molecular_weight: float
    salt_weight: float
    density: Optional[float] = 1.0
    chemistry: FertilizerChemistry
    composition: FertilizerComposition

class LinearProgrammingRequest(BaseModel):
    """Enhanced request model for linear programming optimization"""
    fertilizers: List[Fertilizer]
    target_concentrations: Dict[str, float]
    water_analysis: Dict[str, float]
    calculation_settings: CalculationSettings
    lp_config: LinearProgrammingConfig = LinearProgrammingConfig()
    compare_methods: bool = False  # Whether to compare with deterministic method
    generate_detailed_report: bool = True


class FertilizerDosage(BaseModel):
    dosage_ml_per_L: float
    dosage_g_per_L: float


class CalculationStatus(BaseModel):
    success: bool
    warnings: List[str]
    iterations: int
    convergence_error: float
        
# =============================================================================
# CORE FERTILIZER MODELS
# =============================================================================

class FertilizerComposition(BaseModel):
    cations: Dict[str, float]
    anions: Dict[str, float]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return self.dict()

class FertilizerChemistry(BaseModel):
    formula: str
    purity: float  
    solubility: float
    is_ph_adjuster: bool
     
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return self.dict()

class Fertilizer(BaseModel):
    name: str
    percentage: float
    molecular_weight: float
    salt_weight: float
    density: Optional[float] = 1.0
    chemistry: FertilizerChemistry
    composition: FertilizerComposition
    
    # ADD THIS METHOD TO FIX THE ERROR:
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation for compatibility"""
        return self.dict()

class CalculationSettings(BaseModel):
    volume_liters: float = 1000
    precision: int = 2
    units: str = "mg/L"
    crop_phase: str = "General"

class FertilizerRequest(BaseModel):
    fertilizers: List[Fertilizer]
    target_concentrations: Dict[str, float]
    water_analysis: Dict[str, float]
    calculation_settings: CalculationSettings

# =============================================================================
# RESPONSE MODELS
# =============================================================================

class FertilizerDosage(BaseModel):
    dosage_ml_per_L: float
    dosage_g_per_L: float

class CalculationStatus(BaseModel):
    success: bool
    warnings: List[str]
    iterations: int
    convergence_error: float

# =============================================================================
# MACHINE LEARNING MODELS
# =============================================================================

class MLModelConfig(BaseModel):
    """Configuration for ML model training and optimization"""
    model_type: str = "RandomForest"  # Options: "RandomForest", "XGBoost"
    max_iterations: int = 100
    tolerance: float = 1e-6
    feature_scaling: bool = True
    n_estimators: int = 100
    max_depth: Optional[int] = None
    learning_rate: float = 0.1
    random_state: int = 42


@dataclass
class LinearProgrammingResultConstrained:
    """Result from linear programming optimization with constraint support"""
    success: bool
    dosages: Dict[str, float]
    total_dosage: float
    solver_used: str
    solver_time_seconds: float
    constraints_violated: List[Dict[str, Any]]
    dosages_g_per_L: Dict[str, float]
    achieved_concentrations: Dict[str, float]
    deviations_percent: Dict[str, float]
    objective_value: float
    ionic_balance_error: float
    active_fertilizers: int
    optimization_status: str
    error_message: Optional[str] = None

class FertilizerConstraint:
    """Class to handle fertilizer constraints"""
    
    def __init__(self, fertilizer_name: str, min_dosage: float = 0.0, max_dosage: float = None):
        self.fertilizer_name = fertilizer_name
        self.min_dosage = min_dosage
        self.max_dosage = max_dosage if max_dosage is not None else float('inf')
        
    def is_valid_dosage(self, dosage: float) -> bool:
        """Check if dosage is within constraints"""
        return self.min_dosage <= dosage <= self.max_dosage
    
    def get_adjusted_dosage(self, proposed_dosage: float) -> float:
        """Adjust dosage to fit within constraints"""
        return max(self.min_dosage, min(proposed_dosage, self.max_dosage))
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'fertilizer_name': self.fertilizer_name,
            'min_dosage': self.min_dosage,
            'max_dosage': self.max_dosage if self.max_dosage != float('inf') else None
        }

class ConstraintManager:
    """Manager for handling multiple fertilizer constraints"""
    
    def __init__(self):
        self.constraints: Dict[str, FertilizerConstraint] = {}
    
    def add_constraint(self, fertilizer_name: str, min_dosage: float = 0.0, 
                      max_dosage: float = None) -> None:
        """Add a constraint for a fertilizer"""
        self.constraints[fertilizer_name] = FertilizerConstraint(
            fertilizer_name, min_dosage, max_dosage
        )
    
    def add_constraints_from_dict(self, constraints_dict: Dict[str, Dict[str, float]]) -> None:
        """Add constraints from a dictionary format"""
        for fert_name, constraint_data in constraints_dict.items():
            min_val = constraint_data.min_val = constraint_data.get('min', 0.0)
            max_val = constraint_data.get('max', None)
            self.add_constraint(fert_name, min_val, max_val)
    
    def get_constraint(self, fertilizer_name: str) -> Optional[FertilizerConstraint]:
        """Get constraint for a specific fertilizer"""
        return self.constraints.get(fertilizer_name)
    
    def has_constraint(self, fertilizer_name: str) -> bool:
        """Check if fertilizer has constraints"""
        return fertilizer_name in self.constraints
    
    def apply_constraints_to_dosages(self, dosages: Dict[str, float]) -> Dict[str, float]:
        """Apply all constraints to a set of dosages"""
        constrained_dosages = dosages.copy()
        
        for fert_name, constraint in self.constraints.items():
            if fert_name in constrained_dosages:
                original = constrained_dosages[fert_name]
                adjusted = constraint.get_adjusted_dosage(original)
                constrained_dosages[fert_name] = adjusted
                
                if abs(original - adjusted) > 1e-6:
                    print(f"[CONSTRAINT] {fert_name}: {original:.3f} → {adjusted:.3f} g/L")
        
        return constrained_dosages
    
    def validate_dosages(self, dosages: Dict[str, float]) -> List[Dict[str, Any]]:
        """Validate dosages against constraints and return violations"""
        violations = []
        
        for fert_name, constraint in self.constraints.items():
            dosage = dosages.get(fert_name, 0.0)
            
            if not constraint.is_valid_dosage(dosage):
                violation = {
                    'fertilizer': fert_name,
                    'dosage': dosage,
                    'min_required': constraint.min_dosage,
                    'max_allowed': constraint.max_dosage,
                    'violation_type': 'below_minimum' if dosage < constraint.min_dosage else 'above_maximum',
                    'violation_amount': abs(dosage - constraint.get_adjusted_dosage(dosage))
                }
                violations.append(violation)
        
        return violations
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of all constraints"""
        return {
            'total_constraints': len(self.constraints),
            'constraint_details': [constraint.to_dict() for constraint in self.constraints.values()]
        }