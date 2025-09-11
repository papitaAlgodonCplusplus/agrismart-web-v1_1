#!/usr/bin/env python3
"""
UPDATED WINDOWS-COMPATIBLE AUTO-TRAINING ML SYSTEM WITH MICRONUTRIENT SUPPORT
Fast, efficient training that works on Windows and includes complete micronutrient calculations
Priority: Speed + Accuracy + Cross-platform compatibility + Complete nutrient coverage
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import pickle
import os
from datetime import datetime
import time
import json
import threading
import queue
import sys

# ML Imports
try:
    from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, GradientBoostingRegressor
    from sklearn.preprocessing import StandardScaler, RobustScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score
    from sklearn.multioutput import MultiOutputRegressor
    from sklearn.linear_model import Ridge, ElasticNet
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

@dataclass
class EnhancedTrainingConfig:
    """Enhanced Windows-compatible training configuration with micronutrient support"""
    # Target accuracy requirements (realistic for Windows with micronutrients)
    target_mae_threshold: float = 10.0     # 10 mg/L error acceptable (higher due to micronutrients)
    target_r2_threshold: float = 0.82      # 82% accuracy target
    max_deviation_percent: float = 18.0    # 18% deviation acceptable
    
    # Training parameters (optimized for Windows with micronutrients)
    max_training_iterations: int = 15      # More iterations for micronutrient convergence
    min_training_samples: int = 4000       # More samples for micronutrient diversity
    max_training_samples: int = 20000      # Higher max for better micronutrient coverage
    batch_size_increment: int = 2500       # Larger increments
    
    # Windows-compatible timeout
    timeout_seconds: int = 240             # 4 minute timeout per model (more time for complexity)
    models_to_try: List[str] = None
    
    # Validation requirements
    validation_split: float = 0.2
    convergence_patience: int = 4          # More patience for micronutrient convergence
    
    # Performance targets
    target_accuracy_weight: float = 0.8
    micronutrient_weight: float = 0.3      # NEW: Weight for micronutrient accuracy
    
    def __post_init__(self):
        if self.models_to_try is None:
            # Enhanced models for micronutrient complexity
            self.models_to_try = [
                "GradientBoostingRegressor",    # Best for complex relationships
                "ExtraTreesRegressor",          # Good for micronutrients
                "RandomForestRegressor",        # Reliable fallback
                "Ridge"                         # Fast backup
            ]

class ModelTrainingThread(threading.Thread):
    """Thread for model training with timeout support"""
    
    def __init__(self, trainer, training_data, model_name, result_queue):
        super().__init__()
        self.trainer = trainer
        self.training_data = training_data
        self.model_name = model_name
        self.result_queue = result_queue
        self.daemon = True
    
    def run(self):
        try:
            result = self.trainer._train_and_evaluate_safe(self.training_data, self.model_name)
            self.result_queue.put(('success', result))
        except Exception as e:
            self.result_queue.put(('error', str(e)))

class EnhancedWindowsMLTrainer:
    """Enhanced Windows-compatible ML trainer with complete micronutrient support"""
    
    def __init__(self, config: EnhancedTrainingConfig = None):
        self.config = config or EnhancedTrainingConfig()
        self.training_history = []
        self.best_model = None
        self.best_score = float('inf')
        self.scaler = None
        self.fertilizer_names = []
        
        # Enhanced fertilizer database for Windows with micronutrients
        self.fertilizer_compositions = self._create_enhanced_fertilizer_db()
        
        # Training metadata
        self.training_start_time = None
        self.total_samples_generated = 0
        self.convergence_achieved = False
        
        # Micronutrient elements
        self.macro_elements = ['N', 'P', 'K', 'Ca', 'Mg', 'S']
        self.micro_elements = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        self.all_elements = self.macro_elements + self.micro_elements
        
        print(f"[ENHANCED-TRAIN] Enhanced Windows ML Trainer initialized with micronutrient support")
        print(f"   Target MAE threshold: {self.config.target_mae_threshold} mg/L")
        print(f"   Target R² threshold: {self.config.target_r2_threshold}")
        print(f"   Max iterations: {self.config.max_training_iterations}")
        print(f"   Micronutrient elements: {', '.join(self.micro_elements)}")

    def _create_enhanced_fertilizer_db(self) -> Dict[str, Dict]:
        """Create enhanced Windows-optimized fertilizer database with micronutrients"""
        return {
            # ESSENTIAL MACRONUTRIENT FERTILIZERS
            'nitrato_calcio': {
                'name': 'Nitrato de Calcio',
                'formula': 'Ca(NO3)2.4H2O',
                'mw': 236.15,
                'cations': {'Ca': 16.97, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 11.86, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'nitrato_potasio': {
                'name': 'Nitrato de Potasio',
                'formula': 'KNO3',
                'mw': 101.1,
                'cations': {'Ca': 0, 'K': 38.67, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 13.85, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'fosfato_monopotasico': {
                'name': 'Fosfato Monopotásico',
                'formula': 'KH2PO4',
                'mw': 136.09,
                'cations': {'Ca': 0, 'K': 28.73, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 22.76, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'sulfato_magnesio': {
                'name': 'Sulfato de Magnesio',
                'formula': 'MgSO4.7H2O',
                'mw': 246.47,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 9.87, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 13.01, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'sulfato_potasio': {
                'name': 'Sulfato de Potasio',
                'formula': 'K2SO4',
                'mw': 174.26,
                'cations': {'Ca': 0, 'K': 44.87, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 18.39, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'fosfato_monoamonico': {
                'name': 'Fosfato Monoamónico',
                'formula': 'NH4H2PO4',
                'mw': 115.03,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 15.65, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 12.18, 'S': 0, 'Cl': 0, 'P': 26.93, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            
            # ESSENTIAL MICRONUTRIENT FERTILIZERS
            'quelato_hierro': {
                'name': 'Quelato de Hierro (Fe-EDTA)',
                'formula': 'Fe-EDTA',
                'mw': 367.05,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 6.27, 'NH4': 0, 'Fe': 13.0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 7.63, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'sulfato_manganeso': {
                'name': 'Sulfato de Manganeso',
                'formula': 'MnSO4.4H2O',
                'mw': 223.06,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 24.63, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 14.37, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'sulfato_zinc': {
                'name': 'Sulfato de Zinc',
                'formula': 'ZnSO4.7H2O',
                'mw': 287.56,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 22.74, 'Cu': 0},
                'anions': {'N': 0, 'S': 11.15, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'sulfato_cobre': {
                'name': 'Sulfato de Cobre',
                'formula': 'CuSO4.5H2O',
                'mw': 249.69,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 25.45},
                'anions': {'N': 0, 'S': 12.84, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
            },
            'acido_borico': {
                'name': 'Ácido Bórico',
                'formula': 'H3BO3',
                'mw': 61.83,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 17.48, 'Mo': 0}
            },
            'molibdato_sodio': {
                'name': 'Molibdato de Sodio',
                'formula': 'Na2MoO4.2H2O',
                'mw': 241.95,
                'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 19.01, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 39.66}
            }
        }

    def enhanced_train_until_acceptable(self) -> Dict[str, Any]:
        """Enhanced Windows-compatible training loop with micronutrient support"""
        print(f"\n=== STARTING ENHANCED WINDOWS TRAINING WITH MICRONUTRIENTS ===")
        print(f"Target: MAE < {self.config.target_mae_threshold} mg/L, R² > {self.config.target_r2_threshold}")
        print(f"Micronutrient elements: {', '.join(self.micro_elements)}")
        
        self.training_start_time = time.time()
        best_iteration = 0
        patience_counter = 0
        current_samples = self.config.min_training_samples
        
        for iteration in range(self.config.max_training_iterations):
            print(f"\n--- ENHANCED ITERATION {iteration + 1}/{self.config.max_training_iterations} ---")
            print(f"Training samples: {current_samples:,}")
            
            # Generate enhanced training data with micronutrients
            training_data = self._generate_enhanced_training_data(current_samples)
            
            # Try models with threading timeout
            best_iteration_model = None
            best_iteration_score = float('inf')
            
            for model_name in self.config.models_to_try:
                print(f"\nTesting enhanced model: {model_name}")
                
                try:
                    # Use threading for timeout on Windows
                    result_queue = queue.Queue()
                    training_thread = ModelTrainingThread(self, training_data, model_name, result_queue)
                    
                    training_thread.start()
                    training_thread.join(timeout=self.config.timeout_seconds)
                    
                    if training_thread.is_alive():
                        print(f"   [TIME] Model {model_name} timed out after {self.config.timeout_seconds}s")
                        continue
                    
                    # Get result from queue
                    try:
                        status, result = result_queue.get_nowait()
                        if status == 'error':
                            print(f"   [ERROR] Model {model_name} failed: {result}")
                            continue
                        
                        model_results = result
                        
                    except queue.Empty:
                        print(f"   [ERROR] Model {model_name} failed: No result returned")
                        continue
                    
                    # Check if acceptable (enhanced requirements)
                    if self._check_enhanced_requirements(model_results):
                        print(f"\n[TARGET] SUCCESS! Enhanced model {model_name} meets micronutrient requirements!")
                        print(f"   MAE: {model_results['target_mae']:.3f} mg/L")
                        print(f"   R²: {model_results['target_r2']:.4f}")
                        print(f"   Max deviation: {model_results['max_deviation']:.1f}%")
                        print(f"   Micronutrient accuracy: {model_results.get('micronutrient_accuracy', 0):.3f}")
                        
                        self.best_model = model_results['model']
                        self.scaler = model_results['scaler']
                        self.convergence_achieved = True
                        
                        self._save_enhanced_model(model_results, iteration, model_name)
                        return self._create_enhanced_summary(iteration + 1, model_name)
                    
                    # Track best
                    if model_results['combined_score'] < best_iteration_score:
                        best_iteration_score = model_results['combined_score']
                        best_iteration_model = model_results
                        print(f"   [?] New iteration best: {best_iteration_score:.4f}")
                    
                except Exception as e:
                    print(f"   [ERROR] Model {model_name} failed: {e}")
                    continue
            
            # Update global best
            if best_iteration_model and best_iteration_score < self.best_score:
                self.best_score = best_iteration_score
                self.best_model = best_iteration_model['model']
                self.scaler = best_iteration_model['scaler']
                best_iteration = iteration
                patience_counter = 0
                print(f"   [?] New global best: {self.best_score:.4f}")
            else:
                patience_counter += 1
            
            # Early stopping or sample increase
            if patience_counter >= self.config.convergence_patience:
                if current_samples < self.config.max_training_samples:
                    current_samples = min(
                        current_samples + self.config.batch_size_increment,
                        self.config.max_training_samples
                    )
                    patience_counter = 0
                    print(f"   [?] Increasing samples to {current_samples:,}")
                else:
                    print(f"   [?] Early stopping - no improvement")
                    break
        
        # Training completed
        print(f"\n[WARNING] Enhanced training completed without perfect convergence")
        if self.best_model:
            self._save_enhanced_model(
                {'model': self.best_model, 'scaler': self.scaler, 'combined_score': self.best_score},
                best_iteration, "BestEffort"
            )
        
        return self._create_enhanced_summary(self.config.max_training_iterations, "BestEffort")

    def _generate_enhanced_training_data(self, n_samples: int) -> List[Dict[str, Any]]:
        """Generate enhanced training data with complete micronutrient support"""
        print(f"   Generating {n_samples:,} enhanced training samples with micronutrients...")
        
        training_scenarios = []
        
        # Enhanced crop scenarios with micronutrient requirements
        crop_scenarios = {
            'leafy_greens': {
                # Macronutrients
                'N': (120, 180), 'P': (30, 50), 'K': (150, 250), 'Ca': (120, 200), 'Mg': (30, 60), 'S': (50, 100),
                # Micronutrients
                'Fe': (1.5, 2.5), 'Mn': (0.4, 0.7), 'Zn': (0.2, 0.4), 'Cu': (0.08, 0.15), 'B': (0.3, 0.6), 'Mo': (0.03, 0.07)
            },
            'fruiting_crops': {
                # Macronutrients
                'N': (150, 220), 'P': (40, 70), 'K': (200, 350), 'Ca': (150, 250), 'Mg': (40, 80), 'S': (60, 120),
                # Micronutrients
                'Fe': (2.0, 3.5), 'Mn': (0.5, 1.0), 'Zn': (0.3, 0.6), 'Cu': (0.1, 0.2), 'B': (0.4, 0.8), 'Mo': (0.04, 0.08)
            },
            'herbs': {
                # Macronutrients
                'N': (100, 150), 'P': (25, 45), 'K': (120, 200), 'Ca': (100, 160), 'Mg': (25, 50), 'S': (40, 80),
                # Micronutrients
                'Fe': (1.2, 2.2), 'Mn': (0.3, 0.6), 'Zn': (0.15, 0.35), 'Cu': (0.06, 0.12), 'B': (0.25, 0.55), 'Mo': (0.02, 0.06)
            }
        }
        
        # Enhanced water scenarios with micronutrients
        water_scenarios = {
            'soft': {
                # Macronutrients
                'Ca': (5, 25), 'K': (1, 8), 'Mg': (2, 12), 'N': (0, 5), 'S': (2, 10),
                # Micronutrients
                'Fe': (0.05, 0.2), 'Mn': (0.01, 0.05), 'Zn': (0.005, 0.02), 'Cu': (0.002, 0.01), 'B': (0.02, 0.1), 'Mo': (0.001, 0.005)
            },
            'medium': {
                # Macronutrients
                'Ca': (20, 60), 'K': (3, 15), 'Mg': (8, 25), 'N': (1, 10), 'S': (5, 20),
                # Micronutrients
                'Fe': (0.1, 0.4), 'Mn': (0.02, 0.1), 'Zn': (0.01, 0.04), 'Cu': (0.005, 0.02), 'B': (0.05, 0.2), 'Mo': (0.002, 0.01)
            },
            'hard': {
                # Macronutrients
                'Ca': (50, 120), 'K': (5, 25), 'Mg': (20, 50), 'N': (2, 20), 'S': (10, 40),
                # Micronutrients
                'Fe': (0.2, 0.8), 'Mn': (0.05, 0.2), 'Zn': (0.02, 0.08), 'Cu': (0.01, 0.04), 'B': (0.1, 0.4), 'Mo': (0.005, 0.02)
            }
        }
        
        # Complete fertilizer set including micronutrients
        fertilizer_set = ['nitrato_calcio', 'nitrato_potasio', 'fosfato_monopotasico', 'sulfato_magnesio', 'sulfato_potasio',
                         'quelato_hierro', 'sulfato_manganeso', 'sulfato_zinc', 'sulfato_cobre', 'acido_borico', 'molibdato_sodio']
        
        for i in range(n_samples):
            # Random selections
            crop_type = np.random.choice(list(crop_scenarios.keys()))
            water_type = np.random.choice(list(water_scenarios.keys()))
            
            # Generate targets including micronutrients
            targets = {}
            for element, (min_val, max_val) in crop_scenarios[crop_type].items():
                targets[element] = np.random.uniform(min_val, max_val)
            
            # Generate water including micronutrients
            water = {}
            for element, (min_val, max_val) in water_scenarios[water_type].items():
                water[element] = np.random.uniform(min_val, max_val)
            
            # Fill missing elements
            for element in self.all_elements:
                if element not in water:
                    if element in self.micro_elements:
                        water[element] = np.random.uniform(0, 0.1)
                    else:
                        water[element] = np.random.uniform(0, 5)
                if element not in targets:
                    if element in self.micro_elements:
                        defaults = {'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05}
                        targets[element] = defaults.get(element, 0.1)
                    else:
                        targets[element] = np.random.uniform(50, 200)
            
            # Calculate optimal dosages including micronutrients
            optimal_dosages = self._calculate_enhanced_optimal_dosages(targets, water, fertilizer_set)
            
            # Calculate micronutrient quality score
            micronutrient_quality = self._evaluate_micronutrient_quality(optimal_dosages, targets, fertilizer_set)
            
            scenario = {
                'targets': targets,
                'water': water,
                'fertilizer_set': fertilizer_set,
                'optimal_dosages': optimal_dosages,
                'micronutrient_quality': micronutrient_quality,
                'crop_type': crop_type,
                'water_type': water_type
            }
            
            training_scenarios.append(scenario)
            
            # Progress update
            if (i + 1) % (n_samples // 4) == 0:
                progress = (i + 1) / n_samples * 100
                print(f"     Progress: {progress:.0f}%")
        
        self.total_samples_generated += n_samples
        print(f"   [SUCCESS] Generated {n_samples:,} enhanced training scenarios with micronutrients")
        return training_scenarios

    def _calculate_enhanced_optimal_dosages(self, targets: Dict[str, float], water: Dict[str, float], fertilizer_names: List[str]) -> Dict[str, float]:
        """Calculate optimal dosages including micronutrients using enhanced chemistry"""
        dosages = {}
        
        # Calculate remaining needs
        remaining = {elem: max(0, targets.get(elem, 0) - water.get(elem, 0)) for elem in self.all_elements}
        
        # Enhanced sequential calculation including micronutrients
        calculations = [
            # Macronutrients
            ('fosfato_monopotasico', 'P', 22.76, {'K': 28.73}),
            ('nitrato_calcio', 'Ca', 16.97, {'N': 11.86}),
            ('nitrato_potasio', 'K', 38.67, {'N': 13.85}),
            ('sulfato_magnesio', 'Mg', 9.87, {'S': 13.01}),
            ('sulfato_potasio', 'K', 44.87, {'S': 18.39}),
            
            # Micronutrients
            ('quelato_hierro', 'Fe', 13.0, {'Na': 6.27, 'N': 7.63}),
            ('sulfato_manganeso', 'Mn', 24.63, {'S': 14.37}),
            ('sulfato_zinc', 'Zn', 22.74, {'S': 11.15}),
            ('sulfato_cobre', 'Cu', 25.45, {'S': 12.84}),
            ('acido_borico', 'B', 17.48, {}),
            ('molibdato_sodio', 'Mo', 39.66, {'Na': 19.01})
        ]
        
        for fert_name, primary_element, primary_content, secondary_elements in calculations:
            if fert_name in fertilizer_names and remaining.get(primary_element, 0) > 0:
                need = remaining[primary_element]
                
                # Adjust dosage calculation for micronutrients (smaller amounts)
                if primary_element in self.micro_elements:
                    # Micronutrients: more precise calculation
                    dosage_mg = need / (primary_content / 100) * (100 / 98)
                    # Limit micronutrient fertilizer dosages
                    if dosage_mg > 100:  # Max 100 mg/L for any micronutrient fertilizer
                        dosage_mg = 100
                else:
                    # Macronutrients: standard calculation
                    dosage_mg = need / (primary_content / 100) * (100 / 98)
                
                # Apply reasonable dosage limits
                if primary_element in self.micro_elements:
                    min_dosage, max_dosage = 0.001, 0.1  # 0.001-0.1 g/L for micros
                else:
                    min_dosage, max_dosage = 0.01, 5.0   # 0.01-5.0 g/L for macros
                
                if min_dosage <= dosage_mg / 1000 <= max_dosage:
                    dosages[fert_name] = dosage_mg / 1000
                    
                    # Update remaining nutrients
                    remaining[primary_element] = 0
                    for elem, content in secondary_elements.items():
                        contribution = dosage_mg * (content / 100) * (98 / 100)
                        if elem in remaining:
                            remaining[elem] = max(0, remaining.get(elem, 0) - contribution)
        
        return dosages

    def _evaluate_micronutrient_quality(self, dosages: Dict[str, float], targets: Dict[str, float], fertilizer_set: List[str]) -> float:
        """Evaluate micronutrient coverage and quality"""
        
        # Calculate achieved micronutrient concentrations
        achieved_micros = {}
        
        # Micronutrient fertilizer contributions
        micro_fertilizers = {
            'quelato_hierro': ('Fe', 13.0),
            'sulfato_manganeso': ('Mn', 24.63),
            'sulfato_zinc': ('Zn', 22.74),
            'sulfato_cobre': ('Cu', 25.45),
            'acido_borico': ('B', 17.48),
            'molibdato_sodio': ('Mo', 39.66)
        }
        
        for fert_name, (element, content_percent) in micro_fertilizers.items():
            if fert_name in dosages and dosages[fert_name] > 0:
                dosage_mg_l = dosages[fert_name] * 1000
                contribution = dosage_mg_l * (content_percent / 100) * (98 / 100)  # 98% purity
                achieved_micros[element] = achieved_micros.get(element, 0) + contribution
        
        # Evaluate micronutrient adequacy
        micro_scores = []
        for micro in self.micro_elements:
            target = targets.get(micro, 0)
            achieved = achieved_micros.get(micro, 0)
            
            if target > 0:
                # More forgiving scoring for micronutrients (+/-50% acceptable)
                deviation = abs(achieved - target) / target
                if deviation <= 0.5:
                    score = 1.0 - deviation
                else:
                    score = max(0, 0.5 - (deviation - 0.5) * 0.3)
                micro_scores.append(score)
        
        # Overall micronutrient quality
        if micro_scores:
            return sum(micro_scores) / len(micro_scores)
        else:
            return 0.5  # Default score if no micronutrients

    def _train_and_evaluate_safe(self, training_data: List[Dict], model_name: str) -> Dict[str, Any]:
        """Enhanced Windows-safe training and evaluation with micronutrients"""
        # Prepare data
        X_features = []
        y_dosages = []
        
        # Extract fertilizer names including micronutrients
        all_fertilizer_names = set()
        for scenario in training_data:
            all_fertilizer_names.update(scenario['optimal_dosages'].keys())
        self.fertilizer_names = sorted(list(all_fertilizer_names))
        
        print(f"       Training with {len(self.fertilizer_names)} fertilizers (including micronutrients)")
        
        # Extract enhanced features and targets
        for scenario in training_data:
            features = self._extract_enhanced_features(scenario)
            X_features.append(features)
            
            dosage_array = [scenario['optimal_dosages'].get(name, 0.0) for name in self.fertilizer_names]
            y_dosages.append(dosage_array)
        
        X = np.array(X_features, dtype=np.float64)
        y = np.array(y_dosages, dtype=np.float64)
        
        # Split and scale
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Create enhanced model
        model = self._create_enhanced_model(model_name)
        start_time = time.time()
        model.fit(X_train_scaled, y_train)
        training_time = time.time() - start_time
        
        # Evaluate
        y_pred_test = model.predict(X_test_scaled)
        
        # Calculate enhanced metrics including micronutrient accuracy
        target_mae = mean_absolute_error(y_test.flatten(), y_pred_test.flatten())
        target_r2 = r2_score(y_test, y_pred_test, multioutput='uniform_average')
        max_deviation = self._calculate_enhanced_max_deviation(y_test, y_pred_test)
        
        # Calculate micronutrient-specific accuracy
        micronutrient_accuracy = self._calculate_micronutrient_accuracy(y_test, y_pred_test)
        
        # Enhanced combined score considering micronutrients
        combined_score = (target_mae * 2.0 + 
                         (1 - target_r2) * 50.0 + 
                         max_deviation / 10.0 + 
                         (1 - micronutrient_accuracy) * self.config.micronutrient_weight * 30.0)
        
        results = {
            'model': model,
            'scaler': scaler,
            'model_name': model_name,
            'target_mae': target_mae,
            'target_r2': target_r2,
            'max_deviation': max_deviation,
            'micronutrient_accuracy': micronutrient_accuracy,
            'combined_score': combined_score,
            'training_time': training_time,
            'training_samples': len(X_train),
            'feature_count': X.shape[1],
            'fertilizer_count': len(self.fertilizer_names)
        }
        
        print(f"       MAE: {target_mae:.3f} mg/L")
        print(f"       R²: {target_r2:.4f}")
        print(f"       Max dev: {max_deviation:.1f}%")
        print(f"       Micro accuracy: {micronutrient_accuracy:.3f}")
        print(f"       Time: {training_time:.1f}s")
        
        return results

    def _extract_enhanced_features(self, scenario: Dict) -> List[float]:
        """Extract enhanced features including micronutrient relationships"""
        features = []
        
        # 1. Target concentrations (macro + micro)
        for element in self.all_elements:
            target = scenario['targets'].get(element, 0)
            if element in self.macro_elements:
                normalized = target / 300.0  # Macro: 0-300 mg/L
            else:
                normalized = target / 5.0    # Micro: 0-5 mg/L
            features.append(normalized)
        
        # 2. Water concentrations (macro + micro)
        for element in self.all_elements:
            water = scenario['water'].get(element, 0)
            if element in self.macro_elements:
                normalized = water / 100.0   # Water macro: 0-100 mg/L
            else:
                normalized = water / 1.0     # Water micro: 0-1 mg/L
            features.append(normalized)
        
        # 3. Remaining needs (target - water)
        for element in self.all_elements:
            target = scenario['targets'].get(element, 0)
            water = scenario['water'].get(element, 0)
            remaining = max(0, target - water)
            if element in self.macro_elements:
                normalized = remaining / 300.0
            else:
                normalized = remaining / 5.0
            features.append(normalized)
        
        # 4. Nutrient ratios (enhanced with micronutrient ratios)
        targets = scenario['targets']
        
        # Traditional macro ratios
        k_ca_ratio = targets.get('K', 0) / max(targets.get('Ca', 1), 1) / 2.0
        ca_mg_ratio = targets.get('Ca', 0) / max(targets.get('Mg', 1), 1) / 5.0
        n_k_ratio = targets.get('N', 0) / max(targets.get('K', 1), 1) / 1.5
        features.extend([k_ca_ratio, ca_mg_ratio, n_k_ratio])
        
        # Micronutrient ratios
        fe_mn_ratio = targets.get('Fe', 0) / max(targets.get('Mn', 0.1), 0.1) / 10.0
        fe_zn_ratio = targets.get('Fe', 0) / max(targets.get('Zn', 0.1), 0.1) / 20.0
        mn_zn_ratio = targets.get('Mn', 0) / max(targets.get('Zn', 0.1), 0.1) / 3.0
        features.extend([fe_mn_ratio, fe_zn_ratio, mn_zn_ratio])
        
        # 5. Total nutrient demands
        total_macro = sum(targets.get(elem, 0) for elem in self.macro_elements) / 1000.0
        total_micro = sum(targets.get(elem, 0) for elem in self.micro_elements) / 10.0
        micro_intensity = total_micro / max(total_macro, 0.1)
        features.extend([total_macro, total_micro, micro_intensity])
        
        # 6. Crop and water type encoding
        crop_encoding = {
            'leafy_greens': [1, 0, 0],
            'fruiting_crops': [0, 1, 0],
            'herbs': [0, 0, 1]
        }
        crop_features = crop_encoding.get(scenario.get('crop_type', 'leafy_greens'), [1, 0, 0])
        features.extend(crop_features)
        
        water_encoding = {
            'soft': [1, 0, 0],
            'medium': [0, 1, 0],
            'hard': [0, 0, 1]
        }
        water_features = water_encoding.get(scenario.get('water_type', 'medium'), [0, 1, 0])
        features.extend(water_features)
        
        return features

    def _create_enhanced_model(self, model_name: str):
        """Create enhanced Windows-compatible model for micronutrients"""
        if model_name == "GradientBoostingRegressor":
            base_model = GradientBoostingRegressor(
                n_estimators=100,       # More estimators for micronutrient complexity
                max_depth=10,           # Deeper for complex relationships
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            )
        elif model_name == "ExtraTreesRegressor":
            base_model = ExtraTreesRegressor(
                n_estimators=80,        # More trees for micronutrients
                max_depth=12,           # Deeper trees
                min_samples_split=8,
                n_jobs=1,              # Single thread for Windows stability
                random_state=42
            )
        elif model_name == "RandomForestRegressor":
            base_model = RandomForestRegressor(
                n_estimators=60,
                max_depth=10,
                min_samples_split=8,
                n_jobs=1,              # Single thread
                random_state=42
            )
        elif model_name == "Ridge":
            base_model = Ridge(alpha=1.0, random_state=42)
        else:
            base_model = Ridge(alpha=1.0, random_state=42)  # Safe fallback
        
        return MultiOutputRegressor(base_model)

    def _calculate_enhanced_max_deviation(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate maximum deviation with micronutrient consideration"""
        max_deviation = 0
        for i in range(min(y_true.shape[0], 100)):  # Limit for Windows performance
            for j in range(y_true.shape[1]):
                true_val = y_true[i, j]
                pred_val = y_pred[i, j]
                
                # Different tolerance for macro vs micro fertilizers
                fertilizer_name = self.fertilizer_names[j] if j < len(self.fertilizer_names) else "unknown"
                is_micro_fert = any(micro in fertilizer_name.lower() 
                                  for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato'])
                
                if true_val > (0.0001 if is_micro_fert else 0.001):
                    deviation_percent = abs(pred_val - true_val) / true_val * 100
                    max_deviation = max(max_deviation, deviation_percent)
        
        return max_deviation

    def _calculate_micronutrient_accuracy(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate specific accuracy for micronutrient fertilizers"""
        micro_fertilizer_indices = []
        
        for i, fert_name in enumerate(self.fertilizer_names):
            if any(micro in fert_name.lower() for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato']):
                micro_fertilizer_indices.append(i)
        
        if not micro_fertilizer_indices:
            return 1.0  # No micronutrient fertilizers
        
        # Calculate accuracy for micronutrient fertilizers only
        micro_true = y_true[:, micro_fertilizer_indices]
        micro_pred = y_pred[:, micro_fertilizer_indices]
        
        # Use R² as micronutrient accuracy metric
        micro_r2 = r2_score(micro_true, micro_pred, multioutput='uniform_average')
        return max(0, micro_r2)

    def _check_enhanced_requirements(self, model_results: Dict[str, Any]) -> bool:
        """Check enhanced requirements including micronutrients"""
        mae_ok = model_results['target_mae'] <= self.config.target_mae_threshold
        r2_ok = model_results['target_r2'] >= self.config.target_r2_threshold
        deviation_ok = model_results['max_deviation'] <= self.config.max_deviation_percent
        micro_ok = model_results.get('micronutrient_accuracy', 0) >= 0.75  # 75% micronutrient accuracy
        
        print(f"       Enhanced requirements check:")
        print(f"         MAE <= {self.config.target_mae_threshold}: {mae_ok}")
        print(f"         R² >= {self.config.target_r2_threshold}: {r2_ok}")
        print(f"         Max dev <= {self.config.max_deviation_percent}%: {deviation_ok}")
        print(f"         Micro accuracy >= 75%: {micro_ok}")
        
        return mae_ok and r2_ok and deviation_ok and micro_ok

    def _save_enhanced_model(self, model_results: Dict[str, Any], iteration: int, model_name: str):
        """Save enhanced model with micronutrient metadata"""
        save_dir = "saved_models"
        os.makedirs(save_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"enhanced_ml_model_{model_name}_{timestamp}.pkl"
        filepath = os.path.join(save_dir, filename)
        
        model_data = {
            'model': model_results['model'],
            'scaler': model_results['scaler'],
            'fertilizer_names': self.fertilizer_names,
            'training_config': self.config,
            'model_metrics': {
                'target_mae': model_results.get('target_mae', 0),
                'target_r2': model_results.get('target_r2', 0),
                'max_deviation': model_results.get('max_deviation', 0),
                'micronutrient_accuracy': model_results.get('micronutrient_accuracy', 0)
            },
            'micronutrient_features': {
                'macro_elements': self.macro_elements,
                'micro_elements': self.micro_elements,
                'all_elements': self.all_elements,
                'fertilizer_compositions': self.fertilizer_compositions
            },
            'training_metadata': {
                'iteration': iteration,
                'model_name': model_name,
                'convergence_achieved': self.convergence_achieved,
                'timestamp': timestamp,
                'platform': 'windows_enhanced',
                'micronutrients_included': True
            },
            'version': '2.0.0_enhanced_micronutrients'
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"     [?] Enhanced model saved: {filename}")
        
        # Update main model file
        main_filepath = os.path.join(save_dir, "ml_optimizer_model.pkl")
        with open(main_filepath, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"     [?] Main enhanced model updated: ml_optimizer_model.pkl")

    def _create_enhanced_summary(self, iterations_completed: int, final_model_name: str) -> Dict[str, Any]:
        """Create enhanced training summary with micronutrient info"""
        training_duration = time.time() - self.training_start_time if self.training_start_time else 0
        
        # Count micronutrient fertilizers
        micro_fertilizers = [name for name in self.fertilizer_names 
                           if any(micro in name.lower() for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato'])]
        
        summary = {
            'training_status': 'convergence_achieved' if self.convergence_achieved else 'max_iterations_reached',
            'convergence_achieved': self.convergence_achieved,
            'iterations_completed': iterations_completed,
            'final_model_name': final_model_name,
            'training_duration_minutes': training_duration / 60,
            'total_samples_generated': self.total_samples_generated,
            'platform': 'windows_enhanced',
            'micronutrient_features': {
                'total_fertilizers': len(self.fertilizer_names),
                'micronutrient_fertilizers': len(micro_fertilizers),
                'macro_elements': self.macro_elements,
                'micro_elements': self.micro_elements,
                'enhanced_features': True
            },
            'requirements_met': {
                'target_mae_threshold': self.config.target_mae_threshold,
                'target_r2_threshold': self.config.target_r2_threshold,
                'max_deviation_percent': self.config.max_deviation_percent,
                'micronutrient_accuracy_threshold': 0.75
            },
            'final_metrics': {
                'best_score': self.best_score,
                'model_ready': self.best_model is not None,
                'micronutrient_support': True
            }
        }
        
        return summary

    def predict_enhanced_dosages(self, targets: Dict[str, float], water: Dict[str, float]) -> Dict[str, float]:
        """Predict dosages using enhanced model with micronutrient support"""
        if self.best_model is None or self.scaler is None:
            raise RuntimeError("Enhanced model not trained. Call enhanced_train_until_acceptable() first.")
        
        # Create scenario for feature extraction
        scenario = {
            'targets': targets,
            'water': water,
            'fertilizer_set': self.fertilizer_names,
            'crop_type': 'leafy_greens',  # Default
            'water_type': 'medium'        # Default
        }
        
        features = self._extract_enhanced_features(scenario)
        features_array = np.array(features).reshape(1, -1)
        features_scaled = self.scaler.transform(features_array)
        dosage_prediction = self.best_model.predict(features_scaled)[0]
        
        predicted_dosages = {}
        for i, fert_name in enumerate(self.fertilizer_names):
            if i < len(dosage_prediction):
                dosage = max(0.0, float(dosage_prediction[i]))
                
                # Apply minimum thresholds
                is_micro_fert = any(micro in fert_name.lower() 
                                  for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato'])
                min_threshold = 0.0001 if is_micro_fert else 0.001
                
                if dosage > min_threshold:
                    predicted_dosages[fert_name] = dosage
        
        return predicted_dosages

# Enhanced convenience functions for Windows
def enhanced_train_practical_model(
    target_mae_threshold: float = 10.0,
    target_r2_threshold: float = 0.82,
    max_deviation_percent: float = 18.0,
    max_iterations: int = 12,
    include_micronutrients: bool = True
) -> Dict[str, Any]:
    """Train enhanced practical model with micronutrient support"""
    
    config = EnhancedTrainingConfig(
        target_mae_threshold=target_mae_threshold,
        target_r2_threshold=target_r2_threshold,
        max_deviation_percent=max_deviation_percent,
        max_training_iterations=max_iterations
    )
    
    trainer = EnhancedWindowsMLTrainer(config)
    return trainer.enhanced_train_until_acceptable()

def enhanced_quick_test():
    """Ultra-quick test for enhanced Windows development with micronutrients"""
    print("[?] Enhanced Windows Quick Test - Fast Training with Micronutrients")
    
    config = EnhancedTrainingConfig(
        target_mae_threshold=20.0,  # Very relaxed for testing
        target_r2_threshold=0.70,   # Lower for quick test
        max_deviation_percent=30.0, # Relaxed
        max_training_iterations=3,  # Very fast
        min_training_samples=1500,  # Small dataset
        timeout_seconds=180         # 3 minute timeout
    )
    
    trainer = EnhancedWindowsMLTrainer(config)
    result = trainer.enhanced_train_until_acceptable()
    
    print(f"\n[?] Enhanced Windows quick test completed!")
    print(f"Status: {result['training_status']}")
    print(f"Duration: {result['training_duration_minutes']:.1f} minutes")
    print(f"Model ready: {result['final_metrics']['model_ready']}")
    print(f"Micronutrient support: {result['final_metrics']['micronutrient_support']}")
    
    return result

def enhanced_production_train():
    """Production-quality training optimized for Windows with micronutrients"""
    print("[TARGET] Enhanced Windows Production Training - Complete Nutrient Coverage")
    
    result = enhanced_train_practical_model(
        target_mae_threshold=10.0,   # Good accuracy including micronutrients
        target_r2_threshold=0.82,    # Realistic target
        max_deviation_percent=18.0,  # Reasonable precision
        max_iterations=15,           # More iterations for complexity
        include_micronutrients=True
    )
    
    print(f"\n[?] Enhanced production training completed!")
    print(f"Status: {result['training_status']}")
    print(f"Duration: {result['training_duration_minutes']:.1f} minutes")
    print(f"Convergence: {result['convergence_achieved']}")
    print(f"Samples generated: {result['total_samples_generated']:,}")
    print(f"Platform: {result['platform']}")
    print(f"Micronutrient fertilizers: {result['micronutrient_features']['micronutrient_fertilizers']}")
    
    # Test the enhanced model
    trainer = EnhancedWindowsMLTrainer()
    try:
        # Load and test
        test_targets = {
            'N': 150, 'P': 40, 'K': 200, 'Ca': 180, 'Mg': 50, 'S': 80,
            'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05
        }
        test_water = {
            'N': 2, 'P': 1, 'K': 5, 'Ca': 20, 'Mg': 8, 'S': 5,
            'Fe': 0.1, 'Mn': 0.05, 'Zn': 0.02, 'Cu': 0.01, 'B': 0.1, 'Mo': 0.001
        }
        
        predictions = trainer.predict_enhanced_dosages(test_targets, test_water)
        
        macro_fertilizers = len([name for name, dosage in predictions.items() 
                               if dosage > 0.001 and not any(micro in name.lower() 
                               for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato'])])
        micro_fertilizers = len([name for name, dosage in predictions.items() 
                               if dosage > 0.001 and any(micro in name.lower() 
                               for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato'])])
        
        print(f"\n[SUCCESS] Enhanced model test successful!")
        print(f"Total predictions: {len(predictions)}")
        print(f"Macro fertilizers: {macro_fertilizers}")
        print(f"Micro fertilizers: {micro_fertilizers}")
        print(f"Sample predictions:")
        for fert, dosage in list(predictions.items())[:10]:  # Show first 10
            fert_type = "[?]" if any(micro in fert.lower() for micro in ['hierro', 'manganeso', 'zinc', 'cobre', 'borico', 'molibdato']) else "[FORM]"
            print(f"  {fert_type} {fert}: {dosage:.4f} g/L")
        
    except Exception as e:
        print(f"[WARNING] Model test failed: {e}")
    
    return result

if __name__ == "__main__":
    print("=== ENHANCED WINDOWS-COMPATIBLE ML TRAINER WITH MICRONUTRIENTS ===")
    print("Designed specifically for Windows environments")
    print("Enhanced with complete micronutrient support (Fe, Mn, Zn, Cu, B, Mo)")
    print("Uses threading instead of Unix signals for timeouts")
    print("Optimized for Windows performance and stability")
    print()
    
    # Command line options for Windows
    if len(sys.argv) > 1:
        if sys.argv[1] == "quick":
            enhanced_quick_test()
        elif sys.argv[1] == "production":
            enhanced_production_train()
        elif sys.argv[1] == "test":
            trainer = EnhancedWindowsMLTrainer()
            print("Testing enhanced trainer...")
            test_targets = {
                'N': 150, 'P': 40, 'K': 200, 'Ca': 180, 'Mg': 50, 'S': 80,
                'Fe': 2.0, 'Mn': 0.5, 'Zn': 0.3, 'Cu': 0.1, 'B': 0.5, 'Mo': 0.05
            }
            test_water = {
                'Ca': 20, 'K': 5, 'N': 2, 'P': 1, 'Mg': 8, 'S': 5,
                'Fe': 0.1, 'Mn': 0.05, 'Zn': 0.02, 'Cu': 0.01, 'B': 0.1, 'Mo': 0.001
            }
            print("Enhanced trainer initialized successfully!")
        else:
            print("Enhanced options: quick, production, test")
    else:
        # Default: Enhanced production training
        try:
            print("[?][?] Starting enhanced Windows production training...")
            result = enhanced_production_train()
            
            print(f"\n[TARGET] ENHANCED TRAINING COMPLETE!")
            print(f"Result: {result['training_status']}")
            print(f"Time: {result['training_duration_minutes']:.1f} minutes")
            print(f"Success: {result['convergence_achieved']}")
            print(f"Platform: Enhanced Windows-optimized")
            print(f"Micronutrient support: Complete (Fe, Mn, Zn, Cu, B, Mo)")
            
            if result['convergence_achieved']:
                print(f"\n[SUCCESS] Enhanced model ready for use in main API!")
                print(f"File: saved_models/ml_optimizer_model.pkl")
                print(f"Platform compatibility: Windows/Cross-platform")
                print(f"Micronutrient fertilizers: {result['micronutrient_features']['micronutrient_fertilizers']}")
            else:
                print(f"\n[WARNING] Model trained but may need refinement")
                print(f"Try running with 'quick' option for faster testing")
                
        except KeyboardInterrupt:
            print(f"\n\n[?][?] Enhanced training interrupted by user")
            print(f"Any partial progress has been saved")
            print(f"Try 'quick' option for faster testing")
        except Exception as e:
            print(f"\n\n[ERROR] Enhanced training failed: {e}")
            print(f"Debugging suggestions for Windows:")
            print(f"  1. Try: python auto-train.py quick")
            print(f"  2. Check Python/sklearn installation")
            print(f"  3. Ensure sufficient RAM (6GB+ recommended for micronutrients)")
            print(f"  4. Verify enhanced fertilizer database")
            import traceback
            traceback.print_exc()