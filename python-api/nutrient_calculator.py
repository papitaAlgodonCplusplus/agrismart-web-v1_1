#!/usr/bin/env python3
"""
ENHANCED FERTILIZER CALCULATOR WITH MICRONUTRIENT SUPPORT
Complete solution including micronutrients in calculations, ML training, and PDF generation
"""

from typing import Dict, List, Any, Optional
import numpy as np
from datetime import datetime

class EnhancedFertilizerCalculator:
    """Enhanced calculator with complete micronutrient support"""
    
    def __init__(self):
        # Import the enhanced database
        from fertilizer_database import EnhancedFertilizerDatabase
        self.fertilizer_db = EnhancedFertilizerDatabase()
        
        # Import other components
        from verification_analyzer import SolutionVerifier, CostAnalyzer
        
        # Initialize nutrient calculator methods directly (no separate instance needed)
        self.nutrient_calc = self
        self.verifier = SolutionVerifier()
        self.cost_analyzer = CostAnalyzer()
        
        print("Enhanced Fertilizer Calculator initialized with micronutrient support")

    def analyze_micronutrient_coverage(self, 
                                 fertilizers: List,
                                 target_concentrations: Dict[str, float],
                                 water_analysis: Dict[str, float]) -> Dict[str, Any]:
        """
        Analyze micronutrient coverage and identify gaps
        """
        print(f"[MICRO] Analyzing micronutrient coverage...")
        
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        
        coverage_analysis = {
            'micronutrients_needed': {},
            'micronutrients_covered': {},
            'total_coverage_score': 0.0,
            'missing_micronutrients': [],
            'adequate_micronutrients': []
        }
        
        for micro in micronutrients:
            target = target_concentrations.get(micro, 0)
            water_content = water_analysis.get(micro, 0)
            remaining_need = max(0, target - water_content)
            
            if remaining_need > 0.001:  # Need significant amount
                # Check available sources
                available_sources = []
                total_potential = 0
                
                for fert in fertilizers:
                    cation_content = fert.composition.cations.get(micro, 0)
                    anion_content = fert.composition.anions.get(micro, 0)
                    total_content = cation_content + anion_content
                    
                    if total_content > 0.1:  # Meaningful content
                        available_sources.append({
                            'fertilizer': fert.name,
                            'content_percent': total_content,
                            'max_contribution': 2.0 * total_content * fert.chemistry.purity / 100.0 * 1000.0 / 100.0
                        })
                        total_potential += available_sources[-1]['max_contribution']
                
                if total_potential >= remaining_need * 0.8:  # Can cover at least 80%
                    coverage_analysis['micronutrients_covered'][micro] = {
                        'remaining_need': remaining_need,
                        'potential_supply': total_potential,
                        'coverage_ratio': total_potential / remaining_need,
                        'sources': available_sources
                    }
                    coverage_analysis['adequate_micronutrients'].append(micro)
                else:
                    coverage_analysis['micronutrients_needed'][micro] = {
                        'remaining_need': remaining_need,
                        'potential_supply': total_potential,
                        'gap': remaining_need - total_potential,
                        'sources': available_sources
                    }
                    coverage_analysis['missing_micronutrients'].append(micro)
        
        # Calculate overall coverage score
        total_micros = len(micronutrients)
        covered_micros = len(coverage_analysis['adequate_micronutrients'])
        coverage_analysis['total_coverage_score'] = (covered_micros / total_micros) * 100
        
        print(f"[MICRO] Coverage analysis complete:")
        print(f"  Adequate: {len(coverage_analysis['adequate_micronutrients'])}/{total_micros}")
        print(f"  Missing: {len(coverage_analysis['missing_micronutrients'])}/{total_micros}")
        print(f"  Score: {coverage_analysis['total_coverage_score']:.1f}%")
        
        return coverage_analysis
    
    def _update_remaining_nutrients(self, remaining_nutrients: Dict[str, float], 
                                  fertilizer, dosage_mg_l: float):
        """Update remaining nutrients after adding a fertilizer"""
        
        all_elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'N', 'S', 'Cl', 'P', 'HCO3', 
                       'Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        
        for element in all_elements:
            cation_content = fertilizer.composition.cations.get(element, 0)
            anion_content = fertilizer.composition.anions.get(element, 0)
            total_content = cation_content + anion_content
            
            if total_content > 0:
                contribution = self.nutrient_calc.calculate_element_contribution(
                    dosage_mg_l, total_content, fertilizer.percentage
                )
                if element in remaining_nutrients:
                    remaining_nutrients[element] = max(0, remaining_nutrients[element] - contribution)
 
    def calculate_element_contribution(self, fertilizer_amount: float, element_weight_percent: float,
                                       purity: float) -> float:
        """Calculate element contribution from fertilizer amount"""
        if fertilizer_amount <= 0 or element_weight_percent <= 0:
            return 0.0

        contribution = fertilizer_amount * element_weight_percent * (purity / 100.0) / 100.0
        return contribution

    
    def convert_mg_to_mmol(self, mg_l: float, element: str) -> float:
        """Convert mg/L to mmol/L using atomic weights"""
        atomic_weights = {
            'Ca': 40.08, 'K': 39.10, 'Mg': 24.31, 'Na': 22.99, 'NH4': 18.04,
            'N': 14.01, 'S': 32.06, 'Cl': 35.45, 'P': 30.97, 'HCO3': 61.02,
            'Fe': 55.85, 'Mn': 54.94, 'Zn': 65.38, 'Cu': 63.55, 'B': 10.81, 'Mo': 95.95
        }
        
        if element in atomic_weights and atomic_weights[element] > 0:
            mmol_l = mg_l / atomic_weights[element]
            return mmol_l
        else:
            print(f"[WARNING] Unknown element {element} for mmol conversion")
            return 0.0

    def convert_mmol_to_meq(self, mmol_l: float, element: str) -> float:
        """Convert mmol/L to meq/L using charge states"""
        charges = {
            'Ca': 2, 'K': 1, 'Mg': 2, 'Na': 1, 'NH4': 1,
            'N': 1, 'S': 2, 'Cl': 1, 'P': 1, 'HCO3': 1,
            'Fe': 2, 'Mn': 2, 'Zn': 2, 'Cu': 2, 'B': 3, 'Mo': 6
        }
        
        if element in charges:
            meq_l = mmol_l * charges[element]
            return meq_l
        else:
            print(f"[WARNING] Unknown element {element} for meq conversion")
            return 0.0
        
    def convert_mg_to_meq_direct(self, mg_l: float, element: str) -> float:
        """
        Direct conversion from mg/L to meq/L for ionic balance calculations
        Used by linear programming optimizer for precise ionic balance
        """
        
        # Molecular weights and valences for conversion
        element_properties = {
            'Ca': {'mw': 40.08, 'valence': 2},
            'K': {'mw': 39.10, 'valence': 1}, 
            'Mg': {'mw': 24.31, 'valence': 2},
            'Na': {'mw': 22.99, 'valence': 1},
            'NH4': {'mw': 18.04, 'valence': 1},
            'Fe': {'mw': 55.85, 'valence': 2},
            'Mn': {'mw': 54.94, 'valence': 2},
            'Zn': {'mw': 65.38, 'valence': 2},
            'Cu': {'mw': 63.55, 'valence': 2},
            'NO3': {'mw': 62.00, 'valence': 1},
            'H2PO4': {'mw': 96.99, 'valence': 1},
            'SO4': {'mw': 96.06, 'valence': 2},
            'Cl': {'mw': 35.45, 'valence': 1},
            'HCO3': {'mw': 61.02, 'valence': 1}
        }
        
        if element not in element_properties:
            return 0.0
        
        props = element_properties[element]
        mmol_l = mg_l / props['mw']
        meq_l = mmol_l * props['valence']
        
        return meq_l

    def analyze_micronutrient_coverage(self, fertilizers: List, targets: Dict[str, float], 
                                      water: Dict[str, float]) -> Dict[str, Any]:
        """
        Analyze micronutrient coverage and identify gaps that need supplementation
        """
        print(f"\nANALYZING MICRONUTRIENT COVERAGE")
        
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        coverage_analysis = {
            'micronutrients_needed': {},
            'available_sources': {},
            'missing_micronutrients': [],
            'coverage_percentage': 0,
            'recommendations': []
        }
        
        # Calculate micronutrient needs
        for micro in micronutrients:
            target = targets.get(micro, 0)
            water_content = water.get(micro, 0)
            remaining_need = max(0, target - water_content)
            
            if remaining_need > 0.01:
                coverage_analysis['micronutrients_needed'][micro] = {
                    'target': target,
                    'water_content': water_content,
                    'remaining_need': remaining_need,
                    'available_sources': []
                }
        
        # Check available sources in fertilizer list
        for fertilizer in fertilizers:
            for micro in micronutrients:
                if micro in coverage_analysis['micronutrients_needed']:
                    cation_content = fertilizer.composition.cations.get(micro, 0)
                    anion_content = fertilizer.composition.anions.get(micro, 0)
                    total_content = cation_content + anion_content
                    
                    if total_content > 0.1:  # Significant content
                        coverage_analysis['micronutrients_needed'][micro]['available_sources'].append({
                            'fertilizer_name': fertilizer.name,
                            'content_percent': total_content,
                            'is_required_supplement': '[Fertilizante Requerido]' in fertilizer.name
                        })
        
        # Identify missing micronutrients
        for micro, need_info in coverage_analysis['micronutrients_needed'].items():
            if not need_info['available_sources']:
                coverage_analysis['missing_micronutrients'].append(micro)
        
        # Calculate coverage percentage
        total_needed = len(coverage_analysis['micronutrients_needed'])
        covered = total_needed - len(coverage_analysis['missing_micronutrients'])
        coverage_analysis['coverage_percentage'] = (covered / total_needed * 100) if total_needed > 0 else 100
        
        # Generate recommendations
        if coverage_analysis['missing_micronutrients']:
            coverage_analysis['recommendations'].append(
                f"Add fertilizers for missing micronutrients: {', '.join(coverage_analysis['missing_micronutrients'])}"
            )
        
        if coverage_analysis['coverage_percentage'] < 100:
            coverage_analysis['recommendations'].append(
                "Consider using micronutrient fertilizer mix for complete coverage"
            )
        
        print(f"   Micronutrients needed: {len(coverage_analysis['micronutrients_needed'])}")
        print(f"   Coverage: {coverage_analysis['coverage_percentage']:.1f}%")
        print(f"   Missing: {coverage_analysis['missing_micronutrients']}")
        
        return coverage_analysis

    
    def calculate_micronutrient_dosages(self, 
                                    micronutrient_needs: Dict[str, float],
                                    fertilizers: List) -> Dict[str, float]:
        """
        Calculate specific dosages for micronutrient requirements
        """
        print(f"[MICRO] Calculating micronutrient dosages...")
        
        micronutrient_dosages = {}
        
        # Priority order for micronutrient fulfillment
        priority_order = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        
        for micro in priority_order:
            need = micronutrient_needs.get(micro, 0)
            if need <= 0.001:
                continue
            
            print(f"[MICRO] Processing {micro}: need {need:.3f} mg/L")
            
            # Find best fertilizer for this micronutrient
            best_fertilizer = None
            best_efficiency = 0
            
            for fert in fertilizers:
                cation_content = fert.composition.cations.get(micro, 0)
                anion_content = fert.composition.anions.get(micro, 0)
                total_content = cation_content + anion_content
                
                if total_content > 0.1:  # Has meaningful micronutrient content
                    # Calculate efficiency (content per gram)
                    efficiency = total_content
                    
                    if efficiency > best_efficiency:
                        best_efficiency = efficiency
                        best_fertilizer = fert
            
            if best_fertilizer:
                # Calculate required dosage
                cation_content = best_fertilizer.composition.cations.get(micro, 0)
                anion_content = best_fertilizer.composition.anions.get(micro, 0)
                total_content = cation_content + anion_content
                
                # Calculate dosage needed (mg/L fertilizer)
                required_dosage_mg_l = (need * 100 * 100) / (total_content * best_fertilizer.chemistry.purity)
                required_dosage_g_l = required_dosage_mg_l / 1000
                
                # Apply reasonable limits
                max_dosage = min(required_dosage_g_l, 1.5)  # Max 1.5 g/L for micronutrients
                
                micronutrient_dosages[best_fertilizer.name] = max_dosage
                
                print(f"  Solution: {max_dosage:.3f} g/L of {best_fertilizer.name}")
            else:
                print(f"  Warning: No suitable fertilizer found for {micro}")
        
        return micronutrient_dosages

    def validate_micronutrient_solution(self,
                                    final_concentrations: Dict[str, float],
                                    target_concentrations: Dict[str, float]) -> Dict[str, Any]:
        """
        Validate micronutrient solution against targets and optimal ranges
        """
        print(f"[MICRO] Validating micronutrient solution...")
        
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        
        # Define optimal ranges for micronutrients (mg/L)
        optimal_ranges = {
            'Fe': {'min': 1.0, 'max': 5.0, 'optimal': 2.0},
            'Mn': {'min': 0.1, 'max': 2.0, 'optimal': 0.5},
            'Zn': {'min': 0.05, 'max': 1.0, 'optimal': 0.3},
            'Cu': {'min': 0.02, 'max': 0.2, 'optimal': 0.05},
            'B': {'min': 0.1, 'max': 1.0, 'optimal': 0.3},
            'Mo': {'min': 0.01, 'max': 0.1, 'optimal': 0.05}
        }
        
        validation_results = {
            'micronutrient_status': {},
            'total_micronutrients_supplied': 0,
            'deficient_micronutrients': [],
            'adequate_micronutrients': [],
            'excessive_micronutrients': []
        }
        
        for micro in micronutrients:
            concentration = final_concentrations.get(micro, 0)
            target = target_concentrations.get(micro, 0)
            ranges = optimal_ranges[micro]
            
            # Determine status
            if concentration < ranges['min']:
                status = 'Deficient'
                validation_results['deficient_micronutrients'].append(micro)
            elif concentration > ranges['max']:
                status = 'Excessive'
                validation_results['excessive_micronutrients'].append(micro)
            else:
                status = 'Adequate'
                validation_results['adequate_micronutrients'].append(micro)
            
            # Calculate deviation from target
            if target > 0:
                deviation_percent = ((concentration - target) / target) * 100
            else:
                deviation_percent = 0
            
            validation_results['micronutrient_status'][micro] = {
                'concentration': round(concentration, 4),
                'target': round(target, 4),
                'deviation_percent': round(deviation_percent, 2),
                'target_range': f"{ranges['min']}-{ranges['max']}",
                'optimal': ranges['optimal'],
                'status': status,
                'adequacy_percent': round(min(concentration / ranges['optimal'], 2.0) * 100, 1)
            }
            
            if concentration > 0.001:
                validation_results['total_micronutrients_supplied'] += 1
        
        print(f"[MICRO] Validation complete:")
        print(f"  Adequate: {len(validation_results['adequate_micronutrients'])}")
        print(f"  Deficient: {len(validation_results['deficient_micronutrients'])}")
        print(f"  Excessive: {len(validation_results['excessive_micronutrients'])}")
        
        return validation_results

    def validate_micronutrient_solution(self, final_concentrations: Dict[str, float], 
                                       targets: Dict[str, float]) -> Dict[str, Any]:
        """
        Validate final micronutrient concentrations against targets and safety limits
        """
        print(f"\n[SUCCESS] VALIDATING MICRONUTRIENT SOLUTION")
        
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        validation_results = {
            'micronutrient_status': {},
            'safety_warnings': [],
            'adequacy_warnings': [],
            'overall_status': 'adequate',
            'compliance_score': 0
        }
        
        # Safety limits (mg/L) - levels above which toxicity may occur
        safety_limits = {
            'Fe': 5.0,   # Iron toxicity above 5 mg/L
            'Mn': 2.0,   # Manganese toxicity above 2 mg/L
            'Zn': 1.0,   # Zinc toxicity above 1 mg/L
            'Cu': 0.5,   # Copper very toxic above 0.5 mg/L
            'B': 1.5,    # Boron narrow range, toxic above 1.5 mg/L
            'Mo': 0.2    # Molybdenum toxic above 0.2 mg/L
        }
        
        # Adequacy ranges (mg/L) - minimum levels for plant health
        adequacy_minimums = {
            'Fe': 1.0,   # Iron deficiency below 1.0 mg/L
            'Mn': 0.2,   # Manganese deficiency below 0.2 mg/L
            'Zn': 0.05,  # Zinc deficiency below 0.05 mg/L
            'Cu': 0.02,  # Copper deficiency below 0.02 mg/L
            'B': 0.1,    # Boron deficiency below 0.1 mg/L
            'Mo': 0.005  # Molybdenum deficiency below 0.005 mg/L
        }
        
        compliant_micronutrients = 0
        
        for micro in micronutrients:
            target = targets.get(micro, 0)
            final = final_concentrations.get(micro, 0)
            safety_limit = safety_limits[micro]
            adequacy_min = adequacy_minimums[micro]
            
            # Determine status
            if final > safety_limit:
                status = 'toxic'
                validation_results['safety_warnings'].append(
                    f"{micro}: {final:.3f} mg/L exceeds safety limit ({safety_limit} mg/L)"
                )
                validation_results['overall_status'] = 'unsafe'
            elif final < adequacy_min:
                status = 'deficient'
                validation_results['adequacy_warnings'].append(
                    f"{micro}: {final:.3f} mg/L below adequacy minimum ({adequacy_min} mg/L)"
                )
            elif target > 0 and abs(final - target) / target <= 0.20:  # Within 20% of target
                status = 'adequate'
                compliant_micronutrients += 1
            elif target > 0 and abs(final - target) / target <= 0.50:  # Within 50% of target
                status = 'acceptable'
                compliant_micronutrients += 0.5
            else:
                status = 'off_target'
            
            validation_results['micronutrient_status'][micro] = {
                'target': target,
                'final': final,
                'status': status,
                'safety_limit': safety_limit,
                'adequacy_minimum': adequacy_min,
                'deviation_percent': ((final - target) / target * 100) if target > 0 else 0
            }
            
            print(f"   {micro}: {final:.3f} mg/L (target: {target:.3f}) - {status.upper()}")
        
        # Calculate compliance score
        total_micronutrients = len([m for m in micronutrients if targets.get(m, 0) > 0])
        validation_results['compliance_score'] = (compliant_micronutrients / total_micronutrients * 100) if total_micronutrients > 0 else 100
        
        print(f"   Overall status: {validation_results['overall_status'].upper()}")
        print(f"   Compliance score: {validation_results['compliance_score']:.1f}%")
        
        if validation_results['safety_warnings']:
            print(f"   [WARNING]  Safety warnings: {len(validation_results['safety_warnings'])}")
        
        if validation_results['adequacy_warnings']:
            print(f"   [WARNING]  Adequacy warnings: {len(validation_results['adequacy_warnings'])}")
        
        return validation_results
        
    def calculate_optimized_dosages(self, 
                                fertilizers: List,
                                target_concentrations: Dict[str, float],
                                water_analysis: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate optimized fertilizer dosages using strategic nutrient prioritization
        """
        print(f"[CALC] Calculating optimized dosages for {len(fertilizers)} fertilizers...")
        
        # Calculate remaining nutrients after water contribution
        remaining_nutrients = {}
        for element, target in target_concentrations.items():
            water_content = water_analysis.get(element, 0)
            remaining = max(0, target - water_content)
            remaining_nutrients[element] = remaining
            
            if remaining > 0:
                print(f"  [TARGET] {element}: Target={target:.3f}, Water={water_content:.3f}, Need={remaining:.3f} mg/L")

        results = {}
        
        # Step 2: Macronutrients first (existing logic)
        print(f"\n[CALC] STEP 1: MACRONUTRIENTS")
        
        # Phosphorus sources
        if remaining_nutrients.get('P', 0) > 0:
            p_fertilizers = [f for f in fertilizers if f.composition.anions.get('P', 0) > 5]
            if p_fertilizers:
                # Prefer monopotassium phosphate
                mkp_ferts = [f for f in p_fertilizers if 'monopotasic' in f.name.lower() or 'monopotásico' in f.name.lower()]
                best_p_fert = mkp_ferts[0] if mkp_ferts else p_fertilizers[0]
                
                p_needed = remaining_nutrients['P']
                dosage = self._calculate_dosage_for_element(best_p_fert, 'P', p_needed)
                
                if dosage > 0:
                    results[best_p_fert.name] = dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_p_fert, dosage)
                    print(f"    [SUCCESS] {best_p_fert.name}: {dosage/1000:.3f} g/L")
        
        # Calcium sources
        if remaining_nutrients.get('Ca', 0) > 0:
            ca_fertilizers = [f for f in fertilizers if f.composition.cations.get('Ca', 0) > 10]
            if ca_fertilizers:
                best_ca_fert = max(ca_fertilizers, key=lambda f: f.composition.cations.get('Ca', 0))
                ca_needed = remaining_nutrients['Ca']
                dosage = self._calculate_dosage_for_element(best_ca_fert, 'Ca', ca_needed)
                
                if dosage > 0:
                    results[best_ca_fert.name] = results.get(best_ca_fert.name, 0) + dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_ca_fert, dosage)
                    print(f"    [SUCCESS] {best_ca_fert.name}: {dosage/1000:.3f} g/L")
        
        # Potassium sources
        if remaining_nutrients.get('K', 0) > 0:
            k_fertilizers = [f for f in fertilizers if f.composition.cations.get('K', 0) > 20]
            if k_fertilizers:
                # Prefer KNO3 for balanced N-K supply
                kno3_ferts = [f for f in k_fertilizers if 'nitrato de potasio' in f.name.lower()]
                best_k_fert = kno3_ferts[0] if kno3_ferts else k_fertilizers[0]
                
                k_needed = remaining_nutrients['K']
                dosage = self._calculate_dosage_for_element(best_k_fert, 'K', k_needed)
                
                if dosage > 0:
                    results[best_k_fert.name] = results.get(best_k_fert.name, 0) + dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_k_fert, dosage)
                    print(f"    [SUCCESS] {best_k_fert.name}: {dosage/1000:.3f} g/L")
        
        # Magnesium sources
        if remaining_nutrients.get('Mg', 0) > 0:
            mg_fertilizers = [f for f in fertilizers if f.composition.cations.get('Mg', 0) > 5]
            if mg_fertilizers:
                best_mg_fert = max(mg_fertilizers, key=lambda f: f.composition.cations.get('Mg', 0))
                mg_needed = remaining_nutrients['Mg']
                dosage = self._calculate_dosage_for_element(best_mg_fert, 'Mg', mg_needed)
                
                if dosage > 0:
                    results[best_mg_fert.name] = results.get(best_mg_fert.name, 0) + dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_mg_fert, dosage)
                    print(f"    [SUCCESS] {best_mg_fert.name}: {dosage/1000:.3f} g/L")
        
        # Nitrogen sources (if still needed)
        if remaining_nutrients.get('N', 0) > 0:
            n_fertilizers = [f for f in fertilizers if (f.composition.cations.get('N', 0) + f.composition.anions.get('N', 0)) > 10]
            if n_fertilizers:
                # Prefer nitrate sources
                nitrate_ferts = [f for f in n_fertilizers if 'nitrato' in f.name.lower()]
                best_n_fert = nitrate_ferts[0] if nitrate_ferts else n_fertilizers[0]
                
                n_needed = remaining_nutrients['N']
                dosage = self._calculate_dosage_for_element(best_n_fert, 'N', n_needed)
                
                if dosage > 0:
                    results[best_n_fert.name] = results.get(best_n_fert.name, 0) + dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_n_fert, dosage)
                    print(f"    [SUCCESS] {best_n_fert.name}: {dosage/1000:.3f} g/L")
        
        # Sulfur sources (if still needed)
        if remaining_nutrients.get('S', 0) > 0:
            s_fertilizers = [f for f in fertilizers if f.composition.anions.get('S', 0) > 5]
            if s_fertilizers:
                best_s_fert = max(s_fertilizers, key=lambda f: f.composition.anions.get('S', 0))
                s_needed = remaining_nutrients['S']
                dosage = self._calculate_dosage_for_element(best_s_fert, 'S', s_needed)
                
                if dosage > 0:
                    results[best_s_fert.name] = results.get(best_s_fert.name, 0) + dosage / 1000.0
                    self._update_remaining_nutrients(remaining_nutrients, best_s_fert, dosage)
                    print(f"    [SUCCESS] {best_s_fert.name}: {dosage/1000:.3f} g/L")
        
        # Step 3: Micronutrients
        print(f"\n[CALC] STEP 2: MICRONUTRIENTS")
        micronutrients = ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']
        
        for micro in micronutrients:
            if remaining_nutrients.get(micro, 0) > 0:
                micro_fertilizers = [f for f in fertilizers if 
                                (f.composition.cations.get(micro, 0) + f.composition.anions.get(micro, 0)) > 0.1]
                
                if micro_fertilizers:
                    best_micro_fert = max(micro_fertilizers, key=lambda f: 
                                        f.composition.cations.get(micro, 0) + f.composition.anions.get(micro, 0))
                    
                    micro_needed = remaining_nutrients[micro]
                    dosage = self._calculate_dosage_for_element(best_micro_fert, micro, micro_needed)
                    
                    if dosage > 0:
                        # Limit micronutrient fertilizer dosages
                        dosage_g_l = min(dosage / 1000.0, 1.0)  # Max 1 g/L for micronutrients
                        results[best_micro_fert.name] = results.get(best_micro_fert.name, 0) + dosage_g_l
                        print(f"    [SUCCESS] {best_micro_fert.name}: {dosage_g_l:.3f} g/L")
        
        # Fill with zeros for unused fertilizers
        for fert in fertilizers:
            if fert.name not in results:
                results[fert.name] = 0.0
        
        active_fertilizers = len([d for d in results.values() if d > 0])
        total_dosage = sum(results.values())
        
        print(f"\n[CALC] Optimization complete:")
        print(f"  Active fertilizers: {active_fertilizers}")
        print(f"  Total dosage: {total_dosage:.3f} g/L")
        
        return results

    def _calculate_dosage_for_element(self, fertilizer, element: str, needed_mg_l: float) -> float:
        """
        Calculate fertilizer dosage needed to supply a specific amount of an element
        """
        cation_content = fertilizer.composition.cations.get(element, 0)
        anion_content = fertilizer.composition.anions.get(element, 0)
        total_content = cation_content + anion_content
        
        if total_content <= 0:
            return 0.0
        
        # Calculate fertilizer amount needed (mg/L)
        # needed_mg_l = fertilizer_mg_l * (content% / 100) * (purity% / 100)
        # fertilizer_mg_l = needed_mg_l / (content% / 100) / (purity% / 100)
        fertilizer_mg_l = needed_mg_l * 100 * 100 / (total_content * fertilizer.chemistry.purity)
        
        return max(0, fertilizer_mg_l)

    def _update_remaining_nutrients(self, remaining_nutrients: Dict[str, float], 
                                fertilizer, dosage_mg_l: float):
        """
        Update remaining nutrient needs after adding a fertilizer
        """
        # Update for cations
        for element, content_percent in fertilizer.composition.cations.items():
            if content_percent > 0:
                contribution = self.calculate_element_contribution(
                    dosage_mg_l, content_percent, fertilizer.chemistry.purity
                )
                if element in remaining_nutrients:
                    remaining_nutrients[element] = max(0, remaining_nutrients[element] - contribution)
        
        # Update for anions
        for element, content_percent in fertilizer.composition.anions.items():
            if content_percent > 0:
                contribution = self.calculate_element_contribution(
                    dosage_mg_l, content_percent, fertilizer.chemistry.purity
                )
                if element in remaining_nutrients:
                    remaining_nutrients[element] = max(0, remaining_nutrients[element] - contribution)