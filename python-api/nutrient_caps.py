# nutrient_caps.py
"""
Nutrient Target Caps Module
Implements realistic caps for macro and micronutrient targets before calculations
"""

from typing import Dict, Tuple, Any
import logging

class NutrientCaps:
    """
    Manages realistic caps and ranges for nutrient targets based on hydroponic best practices
    """
    
    def __init__(self):
        # Define realistic ranges for hydroponic systems (mg/L)
        # Based on industry standards and research data
        self.nutrient_ranges = {
            # MACRONUTRIENTS
            'N': {
                'min': 50,
                'max': 300,  # Cap at 300 instead of 750
                'optimal_range': (150, 250),
                'safe_default': 150,
                'notes': 'Above 300 mg/L causes EC spike and potential burn'
            },
            'P': {
                'min': 15,
                'max': 70,   # Cap at 70 instead of 194
                'optimal_range': (30, 50),
                'safe_default': 40,
                'notes': 'Above 70 mg/L blocks Zn/Fe uptake, causes lockouts'
            },
            'K': {
                'min': 100,
                'max': 300,  # Cap at 300 instead of 391
                'optimal_range': (200, 280),
                'safe_default': 200,
                'notes': 'Above 300 mg/L is aggressive, only for heavy fruiting'
            },
            'Ca': {
                'min': 80,
                'max': 220,  # 180.4 is good, allowing some headroom
                'optimal_range': (120, 200),
                'safe_default': 150,
                'notes': 'Well within range'
            },
            'Mg': {
                'min': 15,
                'max': 80,   # 24.3 is good
                'optimal_range': (25, 60),
                'safe_default': 40,
                'notes': 'Critical for chlorophyll production'
            },
            'S': {
                'min': 20,
                'max': 150,  # Cap at 150 instead of 240
                'optimal_range': (50, 100),
                'safe_default': 80,
                'notes': 'Above 150 mg/L is excessive sulfur'
            },
            
            # SECONDARY MACRONUTRIENTS
            'HCO3': {
                'min': 0,
                'max': 60,   # Cap at 60 instead of allowing 77+
                'optimal_range': (10, 40),
                'safe_default': 30,
                'notes': 'Above 60 mg/L affects pH stability'
            },
            'Cl': {
                'min': 0,
                'max': 75,
                'optimal_range': (0, 30),
                'safe_default': 0,
                'notes': 'Generally not added intentionally'
            },
            
            # MICRONUTRIENTS
            'Fe': {
                'min': 0.5,
                'max': 4.0,  # 2.23 is good
                'optimal_range': (1.5, 3.0),
                'safe_default': 2.0,
                'notes': 'Above 4 mg/L causes toxicity'
            },
            'Mn': {
                'min': 0.1,
                'max': 1.5,  # 0.27 is good
                'optimal_range': (0.3, 0.8),
                'safe_default': 0.5,
                'notes': 'Above 1.5 mg/L causes toxicity'
            },
            'Zn': {
                'min': 0.05,
                'max': 0.8,  # 0.33 is good
                'optimal_range': (0.2, 0.5),
                'safe_default': 0.3,
                'notes': 'Above 0.8 mg/L causes toxicity'
            },
            'Cu': {
                'min': 0.02,
                'max': 0.2,  # 0.06 is good, allowing up to 0.1
                'optimal_range': (0.05, 0.15),
                'safe_default': 0.08,
                'notes': 'Very toxic above 0.2 mg/L'
            },
            'B': {
                'min': 0.1,
                'max': 1.0,  # 0.32 is good
                'optimal_range': (0.2, 0.8),
                'safe_default': 0.5,
                'notes': 'Narrow range, toxic above 1.0 mg/L'
            },
            'Mo': {
                'min': 0.005,
                'max': 0.15,  # Cap at 0.15, 0.1 was borderline
                'optimal_range': (0.02, 0.08),
                'safe_default': 0.05,
                'notes': 'Toxic above 0.15 mg/L'
            }
        }
        
        # Critical nutrient ratios to maintain
        self.critical_ratios = {
            'K_Ca': {'min': 0.6, 'max': 1.8, 'optimal': 1.2},
            'Ca_Mg': {'min': 2.5, 'max': 8.0, 'optimal': 4.0},
            'N_K': {'min': 0.5, 'max': 1.3, 'optimal': 0.75}
        }

    def apply_nutrient_caps(self, target_concentrations: Dict[str, float], 
                           strict_mode: bool = True) -> Dict[str, Any]:
        """
        Apply realistic caps to nutrient targets before calculations
        
        Args:
            target_concentrations: Original target concentrations
            strict_mode: If True, apply caps strictly; if False, warn but allow
        
        Returns:
            Dictionary with capped concentrations and adjustment details
        """
        print(f"\n[TEST] APPLYING NUTRIENT CAPS (Strict Mode: {strict_mode})")
        
        capped_concentrations = target_concentrations.copy()
        adjustments_made = []
        warnings = []
        
        for nutrient, original_value in target_concentrations.items():
            if nutrient in self.nutrient_ranges:
                ranges = self.nutrient_ranges[nutrient]
                min_val = ranges['min']
                max_val = ranges['max']
                safe_default = ranges['safe_default']
                optimal_range = ranges['optimal_range']
                notes = ranges['notes']
                
                adjustment_needed = False
                new_value = original_value
                
                # Check if outside safe limits
                if original_value > max_val:
                    if strict_mode:
                        new_value = max_val
                        adjustment_needed = True
                        adjustments_made.append({
                            'nutrient': nutrient,
                            'original': original_value,
                            'capped': new_value,
                            'reason': f'Exceeded maximum safe limit ({max_val} mg/L)',
                            'notes': notes
                        })
                    else:
                        warnings.append({
                            'nutrient': nutrient,
                            'value': original_value,
                            'max_safe': max_val,
                            'severity': 'HIGH',
                            'notes': notes
                        })
                
                elif original_value < min_val:
                    if strict_mode:
                        new_value = safe_default
                        adjustment_needed = True
                        adjustments_made.append({
                            'nutrient': nutrient,
                            'original': original_value,
                            'capped': new_value,
                            'reason': f'Below minimum effective level ({min_val} mg/L)',
                            'notes': f'Set to safe default ({safe_default} mg/L)'
                        })
                    else:
                        warnings.append({
                            'nutrient': nutrient,
                            'value': original_value,
                            'min_safe': min_val,
                            'severity': 'MEDIUM',
                            'notes': f'Consider minimum {min_val} mg/L'
                        })
                
                # Check if outside optimal range (informational)
                elif not (optimal_range[0] <= original_value <= optimal_range[1]):
                    warnings.append({
                        'nutrient': nutrient,
                        'value': original_value,
                        'optimal_range': optimal_range,
                        'severity': 'LOW',
                        'notes': f'Outside optimal range but within safe limits'
                    })
                
                # Update the concentration if adjusted
                if adjustment_needed:
                    capped_concentrations[nutrient] = new_value
                    print(f"  [TOOL] {nutrient}: {original_value:.1f} -> {new_value:.1f} mg/L ({ranges['notes']})")
                else:
                    print(f"  [SUCCESS] {nutrient}: {original_value:.1f} mg/L (within limits)")
            
            else:
                # Unknown nutrient - log warning
                warnings.append({
                    'nutrient': nutrient,
                    'value': original_value,
                    'severity': 'INFO',
                    'notes': 'Unknown nutrient - no caps applied'
                })
                print(f"  [?] {nutrient}: {original_value:.1f} mg/L (unknown nutrient)")
        
        # Check critical ratios after capping
        ratio_warnings = self._validate_nutrient_ratios(capped_concentrations)
        
        # Compile results
        result = {
            'capped_concentrations': capped_concentrations,
            'adjustments_made': adjustments_made,
            'warnings': warnings + ratio_warnings,
            'total_adjustments': len(adjustments_made),
            'strict_mode': strict_mode,
            'adjusted_targets': capped_concentrations,
            'adjustments': adjustments_made,
            'summary': self._generate_adjustment_summary(adjustments_made, warnings)
        }
        
        # Print summary
        if adjustments_made:
            print(f"\n[FORM] CAPS APPLIED: {len(adjustments_made)} nutrients adjusted")
            print(f"   Strictest caps: {', '.join([a['nutrient'] for a in adjustments_made])}")
        else:
            print(f"\n[SUCCESS] ALL TARGETS WITHIN SAFE LIMITS")
        
        if warnings:
            high_warnings = [w for w in warnings if w['severity'] == 'HIGH']
            if high_warnings:
                print(f"[WARNING]  HIGH PRIORITY WARNINGS: {len(high_warnings)} nutrients")
        
        return result

    def _validate_nutrient_ratios(self, concentrations: Dict[str, float]) -> list:
        """Validate critical nutrient ratios"""
        ratio_warnings = []
        
        # K:Ca ratio
        if 'K' in concentrations and 'Ca' in concentrations:
            k_ca_ratio = concentrations['K'] / concentrations['Ca']
            expected = self.critical_ratios['K_Ca']
            if not (expected['min'] <= k_ca_ratio <= expected['max']):
                ratio_warnings.append({
                    'nutrient': 'K:Ca Ratio',
                    'value': k_ca_ratio,
                    'expected_range': f"{expected['min']}-{expected['max']}",
                    'severity': 'MEDIUM',
                    'notes': f'Current: {k_ca_ratio:.2f}, Optimal: {expected["optimal"]}'
                })
        
        # Ca:Mg ratio
        if 'Ca' in concentrations and 'Mg' in concentrations:
            ca_mg_ratio = concentrations['Ca'] / concentrations['Mg']
            expected = self.critical_ratios['Ca_Mg']
            if not (expected['min'] <= ca_mg_ratio <= expected['max']):
                ratio_warnings.append({
                    'nutrient': 'Ca:Mg Ratio',
                    'value': ca_mg_ratio,
                    'expected_range': f"{expected['min']}-{expected['max']}",
                    'severity': 'MEDIUM',
                    'notes': f'Current: {ca_mg_ratio:.2f}, Optimal: {expected["optimal"]}'
                })
        
        # N:K ratio
        if 'N' in concentrations and 'K' in concentrations:
            n_k_ratio = concentrations['N'] / concentrations['K']
            expected = self.critical_ratios['N_K']
            if not (expected['min'] <= n_k_ratio <= expected['max']):
                ratio_warnings.append({
                    'nutrient': 'N:K Ratio',
                    'value': n_k_ratio,
                    'expected_range': f"{expected['min']}-{expected['max']}",
                    'severity': 'MEDIUM',
                    'notes': f'Current: {n_k_ratio:.2f}, Optimal: {expected["optimal"]}'
                })
        
        return ratio_warnings

    def _generate_adjustment_summary(self, adjustments: list, warnings: list) -> Dict[str, Any]:
        """Generate a summary of all adjustments and warnings"""
        
        # Categorize adjustments
        macro_adjustments = [a for a in adjustments if a['nutrient'] in ['N', 'P', 'K', 'Ca', 'Mg', 'S']]
        micro_adjustments = [a for a in adjustments if a['nutrient'] in ['Fe', 'Mn', 'Zn', 'Cu', 'B', 'Mo']]
        
        # Categorize warnings by severity
        high_warnings = [w for w in warnings if w['severity'] == 'HIGH']
        medium_warnings = [w for w in warnings if w['severity'] == 'MEDIUM']
        low_warnings = [w for w in warnings if w['severity'] == 'LOW']
        
        return {
            'total_nutrients_processed': len(adjustments) + len([w for w in warnings if w['severity'] != 'INFO']),
            'macronutrient_adjustments': len(macro_adjustments),
            'micronutrient_adjustments': len(micro_adjustments),
            'high_priority_warnings': len(high_warnings),
            'medium_priority_warnings': len(medium_warnings),
            'low_priority_warnings': len(low_warnings),
            'most_problematic_nutrients': [a['nutrient'] for a in adjustments[:3]],
            'safety_score': self._calculate_safety_score(adjustments, warnings)
        }

    def _calculate_safety_score(self, adjustments: list, warnings: list) -> float:
        """Calculate a safety score from 0-100 based on adjustments needed"""
        base_score = 100.0
        
        # Deduct points for adjustments
        for adj in adjustments:
            if adj['original'] > adj['capped']:  # Dangerous high levels
                base_score -= 15
            else:  # Low levels (less serious)
                base_score -= 5
        
        # Deduct points for warnings
        for warning in warnings:
            if warning['severity'] == 'HIGH':
                base_score -= 10
            elif warning['severity'] == 'MEDIUM':
                base_score -= 5
            elif warning['severity'] == 'LOW':
                base_score -= 2
        
        return max(0.0, base_score)

# Integration function for the main API
def apply_nutrient_caps_to_targets(target_concentrations: Dict[str, float], 
                                  strict_mode: bool = True) -> Dict[str, Any]:
    """
    Convenient function to apply nutrient caps to target concentrations
    
    Usage in main_api.py:
    
    # Before calculations
    cap_result = apply_nutrient_caps_to_targets(target_concentrations, strict_mode=True)
    safe_targets = cap_result['capped_concentrations']
    
    # Use safe_targets for calculations instead of original targets
    """
    caps_manager = NutrientCaps()
    return caps_manager.apply_nutrient_caps(target_concentrations, strict_mode)