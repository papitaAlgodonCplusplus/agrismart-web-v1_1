#!/usr/bin/env python3
"""
COMPLETE VERIFICATION ANALYZER MODULE
Solution verification and cost analysis with professional algorithms
"""

from typing import Dict, List, Any, Optional
import math
import datetime

class SolutionVerifier:
    """Professional solution verification module"""

    def __init__(self):
        # Optimum nutrient ranges for hydroponic solutions (mg/L)
        self.nutrient_ranges = {
            # Macronutrients
            'N': {'min': 100, 'max': 200, 'optimal': 150, 'tolerance': 0.10},
            'P': {'min': 30, 'max': 60, 'optimal': 40, 'tolerance': 0.15},
            'K': {'min': 150, 'max': 350, 'optimal': 200, 'tolerance': 0.10},
            'Ca': {'min': 120, 'max': 220, 'optimal': 180, 'tolerance': 0.10},
            'Mg': {'min': 30, 'max': 80, 'optimal': 50, 'tolerance': 0.15},
            'S': {'min': 50, 'max': 120, 'optimal': 80, 'tolerance': 0.20},
            
            # Micronutrients
            'Fe': {'min': 1.0, 'max': 4.0, 'optimal': 2.0, 'tolerance': 0.25},
            'Mn': {'min': 0.3, 'max': 1.5, 'optimal': 0.5, 'tolerance': 0.30},
            'Zn': {'min': 0.1, 'max': 0.8, 'optimal': 0.3, 'tolerance': 0.30},
            'Cu': {'min': 0.05, 'max': 0.3, 'optimal': 0.1, 'tolerance': 0.40},
            'B': {'min': 0.2, 'max': 1.0, 'optimal': 0.5, 'tolerance': 0.30},
            'Mo': {'min': 0.01, 'max': 0.1, 'optimal': 0.05, 'tolerance': 0.50},
            
            # Other elements
            'Na': {'min': 0, 'max': 50, 'optimal': 0, 'tolerance': 1.0},
            'Cl': {'min': 0, 'max': 75, 'optimal': 0, 'tolerance': 1.0},
            'HCO3': {'min': 0, 'max': 100, 'optimal': 50, 'tolerance': 0.50}
        }
        
        # Critical ratios for ionic relationships
        self.ionic_ratios = {
            'K_Ca': {'min': 0.8, 'max': 1.5, 'optimal': 1.2},
            'Ca_Mg': {'min': 3.0, 'max': 8.0, 'optimal': 4.0},
            'K_Mg': {'min': 2.0, 'max': 6.0, 'optimal': 3.0},
            'N_K': {'min': 0.6, 'max': 1.2, 'optimal': 0.75}
        }

    def verify_concentrations(self, target_concentrations: Dict[str, float], 
                            final_concentrations: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Comprehensive verification of nutrient concentrations against targets
        """
        print(f"\nVERIFYING NUTRIENT CONCENTRATIONS")
        print(f"Target parameters: {len(target_concentrations)}")
        print(f"Final parameters: {len(final_concentrations)}")
        
        results = []

        for nutrient, target in target_concentrations.items():
            if nutrient in final_concentrations:
                final = final_concentrations[nutrient]
                deviation = final - target
                percentage_deviation = (abs(deviation) / target * 100) if target > 0 else 0

                # Get nutrient-specific ranges
                if nutrient in self.nutrient_ranges:
                    ranges = self.nutrient_ranges[nutrient]
                    tolerance = ranges['tolerance']
                    min_acceptable = target * (1 - tolerance)
                    max_acceptable = target * (1 + tolerance)
                    optimal = ranges['optimal']
                else:
                    # Default ranges for unknown nutrients
                    tolerance = 0.15
                    min_acceptable = target * (1 - tolerance)
                    max_acceptable = target * (1 + tolerance)
                    optimal = target

                # Determine status and color
                status, color, recommendation = self._evaluate_nutrient_status(
                    final, target, min_acceptable, max_acceptable, optimal, nutrient
                )

                result = {
                    'parameter': nutrient,
                    'target_value': round(target, 2),
                    'actual_value': round(final, 2),
                    'unit': 'mg/L',
                    'deviation': round(deviation, 2),
                    'percentage_deviation': round(percentage_deviation, 1),
                    'status': status,
                    'color': color,
                    'recommendation': recommendation,
                    'min_acceptable': round(min_acceptable, 2),
                    'max_acceptable': round(max_acceptable, 2),
                    'optimal_range': f"{ranges['min']}-{ranges['max']}" if nutrient in self.nutrient_ranges else f"{target*0.8:.0f}-{target*1.2:.0f}"
                }

                results.append(result)
                
                # Log significant deviations
                if percentage_deviation > 20:
                    print(f"  [WARNING]  {nutrient}: {percentage_deviation:.1f}% deviation ({status})")
                elif percentage_deviation > 10:
                    print(f"  [FORM] {nutrient}: {percentage_deviation:.1f}% deviation")

        print(f"[SUCCESS] Verification completed for {len(results)} nutrients")
        return results

    def _evaluate_nutrient_status(self, final: float, target: float, 
                                min_acceptable: float, max_acceptable: float, 
                                optimal: float, nutrient: str) -> tuple:
        """
        Evaluate nutrient status with professional criteria
        """
        # Excellent range (within 5% of optimal)
        if abs(final - optimal) / optimal <= 0.05:
            return "Excellent", "DarkGreen", f"{nutrient} concentration is excellent and within optimal range"
        
        # Good range (within acceptable limits)
        elif min_acceptable <= final <= max_acceptable:
            return "Good", "Green", f"{nutrient} concentration is within acceptable range"
        
        # Moderate deviation
        elif target * 0.7 <= final <= target * 1.3:
            if final > max_acceptable:
                return "High", "Orange", f"{nutrient} slightly elevated. Monitor for potential toxicity"
            else:
                return "Low", "Orange", f"{nutrient} slightly low. Consider increasing fertilizer"
        
        # Critical deviation
        else:
            if final > target * 1.3:
                severity = "Deviation High" if final > target * 1.5 else "High"
                color = "Red" if severity == "Deviation High" else "Orange"
                return severity, color, f"{nutrient} dangerously high. Reduce fertilizer immediately and dilute solution"
            else:
                severity = "Deviation Low" if final < target * 0.5 else "Low"
                color = "Red" if severity == "Deviation Low" else "Yellow"
                return severity, color, f"{nutrient} critically low. Increase fertilizer significantly"

    def verify_ionic_relationships(self, final_meq: Dict[str, float], 
                                 final_mmol: Dict[str, float], 
                                 final_mg: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Verify critical ionic relationships and ratios
        """
        print(f"\n[?][?]  VERIFYING IONIC RELATIONSHIPS")
        
        results = []

        # K:Ca ratio (meq/L basis)
        k_meq = final_meq.get('K', 0)
        ca_meq = final_meq.get('Ca', 0)
        
        if ca_meq > 0:
            k_ca_ratio = k_meq / ca_meq
            ratio_info = self.ionic_ratios['K_Ca']
            
            status, color, recommendation = self._evaluate_ratio_status(
                k_ca_ratio, ratio_info, "K:Ca", "meq/L ratio"
            )
            
            results.append({
                'relationship_name': 'K:Ca Ratio (meq/L)',
                'actual_ratio': round(k_ca_ratio, 2),
                'target_min': ratio_info['min'],
                'target_max': ratio_info['max'],
                'optimal': ratio_info['optimal'],
                'unit': 'meq/L ratio',
                'status': status,
                'color': color,
                'recommendation': recommendation
            })

        # Ca:Mg ratio (meq/L basis)
        mg_meq = final_meq.get('Mg', 0)
        
        if mg_meq > 0:
            ca_mg_ratio = ca_meq / mg_meq
            ratio_info = self.ionic_ratios['Ca_Mg']
            
            status, color, recommendation = self._evaluate_ratio_status(
                ca_mg_ratio, ratio_info, "Ca:Mg", "meq/L ratio"
            )
            
            results.append({
                'relationship_name': 'Ca:Mg Ratio (meq/L)',
                'actual_ratio': round(ca_mg_ratio, 2),
                'target_min': ratio_info['min'],
                'target_max': ratio_info['max'],
                'optimal': ratio_info['optimal'],
                'unit': 'meq/L ratio',
                'status': status,
                'color': color,
                'recommendation': recommendation
            })

        # K:Mg ratio (meq/L basis)
        if mg_meq > 0:
            k_mg_ratio = k_meq / mg_meq
            ratio_info = self.ionic_ratios['K_Mg']
            
            status, color, recommendation = self._evaluate_ratio_status(
                k_mg_ratio, ratio_info, "K:Mg", "meq/L ratio"
            )
            
            results.append({
                'relationship_name': 'K:Mg Ratio (meq/L)',
                'actual_ratio': round(k_mg_ratio, 2),
                'target_min': ratio_info['min'],
                'target_max': ratio_info['max'],
                'optimal': ratio_info['optimal'],
                'unit': 'meq/L ratio',
                'status': status,
                'color': color,
                'recommendation': recommendation
            })

        # N:K ratio (mg/L basis)
        n_mg = final_mg.get('N', 0)
        k_mg = final_mg.get('K', 0)
        
        if k_mg > 0:
            n_k_ratio = n_mg / k_mg
            ratio_info = self.ionic_ratios['N_K']
            
            status, color, recommendation = self._evaluate_ratio_status(
                n_k_ratio, ratio_info, "N:K", "mg/L ratio"
            )
            
            results.append({
                'relationship_name': 'N:K Ratio (mg/L)',
                'actual_ratio': round(n_k_ratio, 2),
                'target_min': ratio_info['min'],
                'target_max': ratio_info['max'],
                'optimal': ratio_info['optimal'],
                'unit': 'mg/L ratio',
                'status': status,
                'color': color,
                'recommendation': recommendation
            })

        print(f"[SUCCESS] Ionic relationship verification completed: {len(results)} ratios analyzed")
        return results

    def _evaluate_ratio_status(self, actual_ratio: float, ratio_info: Dict[str, float], 
                             ratio_name: str, unit: str) -> tuple:
        """
        Evaluate ionic ratio status
        """
        min_val = ratio_info['min']
        max_val = ratio_info['max']
        optimal = ratio_info['optimal']
        
        # Excellent (within 10% of optimal)
        if abs(actual_ratio - optimal) / optimal <= 0.10:
            return "Excellent", "DarkGreen", f"{ratio_name} ratio is optimal"
        
        # Good (within acceptable range)
        elif min_val <= actual_ratio <= max_val:
            return "Good", "Green", f"{ratio_name} ratio is within acceptable range"
        
        # Moderate imbalance
        elif min_val * 0.8 <= actual_ratio <= max_val * 1.2:
            return "Caution", "Orange", f"{ratio_name} ratio is outside optimal range but manageable"
        
        # Severe imbalance
        else:
            return "Imbalanced", "Red", f"{ratio_name} ratio is severely imbalanced and requires correction"

    def verify_ionic_balance(self, final_meq: Dict[str, float]) -> Dict[str, Any]:
        """
        Professional ionic balance verification with detailed analysis
        """
        print(f"\n[?][?]  VERIFYING IONIC BALANCE")
        
        # Define cations and anions
        cation_elements = ['Ca', 'K', 'Mg', 'Na', 'NH4', 'Fe', 'Mn', 'Zn', 'Cu']
        anion_elements = ['N', 'S', 'Cl', 'P', 'HCO3', 'B', 'Mo']
        
        # Calculate sums
        cation_sum = sum(final_meq.get(cation, 0) for cation in cation_elements)
        anion_sum = sum(final_meq.get(anion, 0) for anion in anion_elements)
        
        # Calculate balance metrics
        difference = abs(cation_sum - anion_sum)
        total_ions = cation_sum + anion_sum
        
        if total_ions > 0:
            difference_percentage = (difference / (total_ions / 2)) * 100
        else:
            difference_percentage = 0
        
        # Professional balance evaluation
        balance_status = self._evaluate_balance_status(difference_percentage)
        
        # Calculate acceptable tolerance
        tolerance = min(cation_sum, anion_sum) * 0.1  # 10% tolerance
        
        result = {
            'cation_sum': round(cation_sum, 3),
            'anion_sum': round(anion_sum, 3),
            'difference': round(difference, 3),
            'difference_percentage': round(difference_percentage, 2),
            'is_balanced': 1 if difference_percentage <= 10.0 else 0,
            'tolerance': round(tolerance, 3),
            'balance_status': balance_status['status'],
            'balance_color': balance_status['color'],
            'balance_recommendation': balance_status['recommendation'],
            'cation_distribution': self._calculate_ion_distribution(final_meq, cation_elements),
            'anion_distribution': self._calculate_ion_distribution(final_meq, anion_elements)
        }
        
        print(f"Cation sum: {cation_sum:.2f} meq/L")
        print(f"Anion sum: {anion_sum:.2f} meq/L")
        print(f"Balance error: {difference_percentage:.1f}% ({balance_status['status']})")
        
        return result

    def _evaluate_balance_status(self, difference_percentage: float) -> Dict[str, str]:
        """
        Evaluate ionic balance status with professional criteria
        """
        if difference_percentage <= 5.0:
            return {
                'status': 'Excellent',
                'color': 'DarkGreen',
                'recommendation': 'Ionic balance is excellent. No adjustment needed.'
            }
        elif difference_percentage <= 10.0:
            return {
                'status': 'Good',
                'color': 'Green',
                'recommendation': 'Ionic balance is acceptable. Minor adjustments may improve stability.'
            }
        elif difference_percentage <= 15.0:
            return {
                'status': 'Caution',
                'color': 'Orange',
                'recommendation': 'Ionic balance is outside optimal range. Review fertilizer ratios.'
            }
        elif difference_percentage <= 25.0:
            return {
                'status': 'Poor',
                'color': 'Red',
                'recommendation': 'Ionic balance is poor. Significant fertilizer adjustment required.'
            }
        else:
            return {
                'status': 'Critical',
                'color': 'DarkRed',
                'recommendation': 'Ionic balance is critically imbalanced. Complete formulation review needed.'
            }

    def _calculate_ion_distribution(self, final_meq: Dict[str, float], ion_list: List[str]) -> Dict[str, float]:
        """
        Calculate percentage distribution of ions
        """
        total = sum(final_meq.get(ion, 0) for ion in ion_list)
        
        if total > 0:
            return {ion: round((final_meq.get(ion, 0) / total) * 100, 1) for ion in ion_list}
        else:
            return {ion: 0.0 for ion in ion_list}
     
    def create_detailed_verification(self, 
                                dosages: Dict[str, float],
                                achieved_concentrations: Dict[str, float],
                                target_concentrations: Dict[str, float],
                                water_analysis: Dict[str, float],
                                volume_liters: float) -> Dict[str, Any]:
        """
        Create a comprehensive detailed verification of the fertilizer solution
        
        Args:
            dosages: Fertilizer dosages in g/L
            achieved_concentrations: Final nutrient concentrations achieved
            target_concentrations: Desired nutrient concentrations
            water_analysis: Initial water nutrient content
            volume_liters: Total solution volume
        
        Returns:
            Detailed verification results dictionary
        """
        print(f"\n[VERIFY] Creating detailed verification analysis...")
        
        # 1. Basic nutrient concentration verification
        nutrient_analysis = self.verify_concentrations(target_concentrations, achieved_concentrations)
        
        # 2. Calculate deviations and statistics
        total_deviation = 0
        nutrient_count = 0
        excellent_count = 0
        good_count = 0
        poor_count = 0
        
        deviation_details = {}
        
        for nutrient in target_concentrations.keys():
            target = target_concentrations[nutrient]
            achieved = achieved_concentrations.get(nutrient, 0)
            
            if target > 0:
                deviation_percent = abs((achieved - target) / target * 100)
                total_deviation += deviation_percent
                nutrient_count += 1
                
                deviation_details[nutrient] = {
                    'target': target,
                    'achieved': achieved,
                    'deviation_percent': deviation_percent,
                    'absolute_difference': achieved - target
                }
                
                # Count status categories
                if deviation_percent <= 5:
                    excellent_count += 1
                elif deviation_percent <= 15:
                    good_count += 1
                else:
                    poor_count += 1
        
        average_deviation = total_deviation / nutrient_count if nutrient_count > 0 else 0
        
        # 3. Dosage analysis
        active_fertilizers = [name for name, dosage in dosages.items() if dosage > 0.001]
        total_dosage = sum(dosages.values())
        max_individual_dosage = max(dosages.values()) if dosages else 0
        
        dosage_analysis = {
            'total_dosage_g_l': total_dosage,
            'max_individual_dosage_g_l': max_individual_dosage,
            'active_fertilizers_count': len(active_fertilizers),
            'active_fertilizers': active_fertilizers,
            'dosage_distribution': {name: dosage for name, dosage in dosages.items() if dosage > 0.001}
        }
        
        # 4. Safety assessment
        safety_warnings = []
        
        if total_dosage > 15.0:
            safety_warnings.append({
                'type': 'high_total_dosage',
                'message': f'Total dosage ({total_dosage:.2f} g/L) exceeds recommended maximum (15 g/L)',
                'severity': 'high'
            })
        
        if max_individual_dosage > 5.0:
            safety_warnings.append({
                'type': 'high_individual_dosage',
                'message': f'Individual fertilizer dosage ({max_individual_dosage:.2f} g/L) exceeds recommended maximum (5 g/L)',
                'severity': 'high'
            })
        
        # Check for dangerous nutrient levels
        for nutrient, achieved in achieved_concentrations.items():
            if nutrient in self.nutrient_ranges:
                ranges = self.nutrient_ranges[nutrient]
                if achieved > ranges['max'] * 1.5:  # 50% above maximum
                    safety_warnings.append({
                        'type': 'dangerous_nutrient_level',
                        'message': f'{nutrient} level ({achieved:.2f} mg/L) is dangerously high (max safe: {ranges["max"]} mg/L)',
                        'severity': 'critical',
                        'nutrient': nutrient
                    })
        
        # 5. Calculate ionic balance (simplified)
        try:
            # Convert to meq/L for ionic balance
            final_meq = self._convert_to_meq_l(achieved_concentrations)
            ionic_balance = self.verify_ionic_balance(final_meq)
        except:
            ionic_balance = {'balance_error_percent': 0, 'status': 'unknown', 'cation_sum': 0, 'anion_sum': 0}
        
        # 6. Cost efficiency analysis (if possible)
        cost_efficiency = {
            'cost_per_nutrient_mg': {},
            'most_expensive_nutrients': [],
            'cost_effective_nutrients': []
        }
        
        # Calculate cost per mg of each nutrient delivered
        for nutrient in target_concentrations.keys():
            achieved = achieved_concentrations.get(nutrient, 0)
            water_contribution = water_analysis.get(nutrient, 0)
            fertilizer_contribution = achieved - water_contribution
            
            if fertilizer_contribution > 0:
                # This would need cost data to complete - placeholder for now
                cost_efficiency['cost_per_nutrient_mg'][nutrient] = {
                    'fertilizer_contribution_mg_l': fertilizer_contribution,
                    'efficiency_score': min(100, (fertilizer_contribution / target_concentrations[nutrient]) * 100)
                }
        
        # 7. Solution quality score
        quality_factors = {
            'targeting_accuracy': max(0, 100 - average_deviation),  # Higher is better
            'dosage_efficiency': max(0, 100 - (total_dosage / 15.0 * 100)),  # Lower dosage is better
            'safety_score': max(0, 100 - len(safety_warnings) * 20),  # Fewer warnings is better
            'ionic_balance_score': max(0, 100 - abs(ionic_balance.get('balance_error_percent', 0))),
            'fertilizer_utilization': min(100, len(active_fertilizers) / 8 * 100)  # Optimal around 6-8 fertilizers
        }
        
        overall_quality_score = sum(quality_factors.values()) / len(quality_factors)
        
        # 8. Recommendations based on analysis
        recommendations = []
        
        if average_deviation > 20:
            recommendations.append("High nutrient deviations detected. Consider adjusting fertilizer selection or dosages.")
        
        if total_dosage > 12:
            recommendations.append("Total dosage is high. Consider using more concentrated fertilizers or reducing targets.")
        
        if len(active_fertilizers) > 10:
            recommendations.append("Many fertilizers required. Consider simplifying the formulation.")
        
        if excellent_count / nutrient_count < 0.5 if nutrient_count > 0 else False:
            recommendations.append("Less than 50% of nutrients achieved excellent targeting. Review formulation strategy.")
        
        if len(safety_warnings) > 0:
            recommendations.append("Safety concerns detected. Review dosages and nutrient levels before use.")
        
        if not recommendations:
            recommendations.append("Solution appears well-optimized with good nutrient targeting and safe dosage levels.")
        
        # 9. Detailed results compilation
        detailed_verification = {
            # Core verification results
            'nutrient_analysis': nutrient_analysis,
            'average_deviation_percent': round(average_deviation, 2),
            'deviation_details': deviation_details,
            
            # Performance statistics
            'performance_summary': {
                'excellent_nutrients': excellent_count,
                'good_nutrients': good_count,
                'poor_nutrients': poor_count,
                'total_nutrients': nutrient_count,
                'success_rate_percent': round((excellent_count + good_count) / nutrient_count * 100, 1) if nutrient_count > 0 else 0
            },
            
            # Dosage analysis
            'dosage_analysis': dosage_analysis,
            
            # Safety assessment
            'safety_assessment': {
                'warnings': safety_warnings,
                'safety_level': 'safe' if len(safety_warnings) == 0 else ('caution' if len([w for w in safety_warnings if w['severity'] == 'critical']) == 0 else 'unsafe'),
                'total_warnings': len(safety_warnings)
            },
            
            # Ionic balance
            'ionic_balance': ionic_balance,
            
            # Quality metrics
            'quality_metrics': {
                'overall_score': round(overall_quality_score, 1),
                'individual_scores': quality_factors,
                'grade': self._get_quality_grade(overall_quality_score)
            },
            
            # Cost efficiency (placeholder)
            'cost_efficiency': cost_efficiency,
            
            # Recommendations
            'recommendations': recommendations,
            
            # Technical details
            'technical_details': {
                'total_volume_liters': volume_liters,
                'calculation_timestamp': datetime.datetime.now().isoformat(),
                'verification_method': 'detailed_comprehensive'
            }
        }
        
        # Log summary
        print(f"[VERIFY] ✅ Detailed verification completed:")
        print(f"  • Average deviation: {average_deviation:.2f}%")
        print(f"  • Success rate: {detailed_verification['performance_summary']['success_rate_percent']:.1f}%")
        print(f"  • Quality score: {overall_quality_score:.1f}/100")
        print(f"  • Safety level: {detailed_verification['safety_assessment']['safety_level']}")
        print(f"  • Active fertilizers: {len(active_fertilizers)}")
        print(f"  • Total dosage: {total_dosage:.3f} g/L")
        
        return detailed_verification


    def generate_nutrient_discrepancy_info(self, 
                                       nutrient: str,
                                       target: float, 
                                       achieved: float,
                                       dosages: Dict[str, float],
                                       fertilizers: List[Any],
                                       water_analysis: Dict[str, float]) -> Dict[str, Any]:
        """
        Generate detailed diagnostic information for nutrient discrepancies
        
        Returns:
            dict with 'has_discrepancy', 'severity', 'message', 'reasons'
        """
        
        # Calculate deviation
        if target == 0:
            return {
                'has_discrepancy': False,
                'severity': 'none',
                'message': '',
                'reasons': []
            }
        
        deviation_percent = abs((achieved - target) / target * 100)
        
        # No significant discrepancy (within 5%)
        if deviation_percent <= 5:
            return {
                'has_discrepancy': False,
                'severity': 'none',
                'message': '',
                'reasons': []
            }
        
        # Analyze reasons for discrepancy
        reasons = []
        severity = 'low'
        
        # 1. Check if any fertilizers supply this nutrient
        supplying_fertilizers = []
        for fert in fertilizers:
            cation_content = fert.composition.cations.get(nutrient, 0)
            anion_content = fert.composition.anions.get(nutrient, 0)
            total_content = cation_content + anion_content
            
            if total_content > 0:
                dosage = dosages.get(fert.name, 0)
                if dosage > 0:
                    supplying_fertilizers.append({
                        'name': fert.name,
                        'content_percent': total_content,
                        'dosage_g_l': dosage
                    })
        
        # 2. No fertilizers supply this nutrient
        if len(supplying_fertilizers) == 0:
            reasons.append({
                'type': 'no_fertilizer_source',
                'description': f'Ningún fertilizante en el catálogo contiene {nutrient}'
            })
            severity = 'high'
        
        # 3. Fertilizers supply it but dosage is too low
        elif achieved < target * 0.9:
            water_contribution = water_analysis.get(nutrient, 0)
            
            if water_contribution > target * 0.3:
                reasons.append({
                    'type': 'high_water_content',
                    'description': f'El agua aporta {water_contribution:.1f} ppm de {nutrient}, limitando los fertilizantes necesarios'
                })
                severity = 'medium'
            
            total_dosage = sum(dosages.values())
            if total_dosage > 12:
                reasons.append({
                    'type': 'conflicting_fertilizers',
                    'description': f'Alta dosificación total ({total_dosage:.1f} g/L) limita la cantidad de fertilizantes que aportan {nutrient}'
                })
                severity = 'medium'
            
            if nutrient in self.nutrient_ranges:
                ranges = self.nutrient_ranges[nutrient]
                if target > ranges['max']:
                    reasons.append({
                        'type': 'target_exceeds_safe_limits',
                        'description': f'Objetivo de {nutrient} ({target:.1f} ppm) excede límite seguro ({ranges["max"]} ppm)'
                    })
                    severity = 'high'
            
            avg_content = sum([f['content_percent'] for f in supplying_fertilizers]) / len(supplying_fertilizers)
            if avg_content < 5:
                reasons.append({
                    'type': 'low_fertilizer_content',
                    'description': f'Los fertilizantes disponibles tienen bajo contenido de {nutrient} (promedio {avg_content:.1f}%)'
                })
                severity = 'medium'
        
        # 4. Achieved exceeds target
        elif achieved > target * 1.1:
            water_contribution = water_analysis.get(nutrient, 0)
            
            if water_contribution > target * 0.5:
                reasons.append({
                    'type': 'excessive_water_content',
                    'description': f'El agua aporta {water_contribution:.1f} ppm de {nutrient}, excediendo el objetivo de {target:.1f} ppm'
                })
                severity = 'high'
            
            reasons.append({
                'type': 'fertilizer_byproduct',
                'description': f'{nutrient} se aporta como subproducto de fertilizantes dirigidos a otros nutrientes'
            })
            severity = 'medium'
        
        # 5. Check unusual phase requirements
        if nutrient in self.nutrient_ranges:
            ranges = self.nutrient_ranges[nutrient]
            if target < ranges['min'] * 0.5 or target > ranges['max'] * 1.5:
                reasons.append({
                    'type': 'unusual_phase_requirement',
                    'description': f'Requerimiento de fase inusual: {target:.1f} ppm (rango típico: {ranges["min"]}-{ranges["max"]} ppm)'
                })
                severity = 'medium'
        
        # Adjust severity based on deviation
        if deviation_percent > 20:
            severity = 'high'
        elif deviation_percent > 10:
            severity = max(severity, 'medium') if severity != 'high' else 'high'
        
        # Create message
        if achieved < target:
            message = f'Déficit de ppm encontrado, '
        else:
            message = f'Exceso de ppm encontrado, '
        
        if reasons:
            message += reasons[0]['description']
        
        return {
            'has_discrepancy': True,
            'severity': severity,
            'deviation_percent': round(deviation_percent, 1),
            'message': message,
            'reasons': reasons,
            'supplying_fertilizers': [f['name'] for f in supplying_fertilizers]
        }

    def create_detailed_verification_with_diagnostics(self, 
                                                   dosages: Dict[str, float],
                                                   achieved_concentrations: Dict[str, float],
                                                   target_concentrations: Dict[str, float],
                                                   water_analysis: Dict[str, float],
                                                   fertilizers: List[Any],
                                                   volume_liters: float) -> Dict[str, Any]:
        """
        Enhanced version that includes discrepancy diagnostics
        """
        
        # Get base verification
        verification = self.create_detailed_verification(
            dosages, achieved_concentrations, target_concentrations, water_analysis, volume_liters
        )
        
        # Add diagnostics for each nutrient
        nutrient_diagnostics = {}
        
        for nutrient in target_concentrations.keys():
            target = target_concentrations[nutrient]
            achieved = achieved_concentrations.get(nutrient, 0)
            
            diagnostic = self.generate_nutrient_discrepancy_info(
                nutrient=nutrient,
                target=target,
                achieved=achieved,
                dosages=dosages,
                fertilizers=fertilizers,
                water_analysis=water_analysis
            )
            
            nutrient_diagnostics[nutrient] = diagnostic
        
        # Add diagnostics to verification results
        verification['nutrient_diagnostics'] = nutrient_diagnostics
        
        return verification
    
    def _convert_to_meq_l(self, concentrations_mg_l: Dict[str, float]) -> Dict[str, float]:
        """Convert mg/L concentrations to meq/L for ionic balance calculations"""
        
        # Atomic weights and valences
        conversion_factors = {
            'Ca': 20.04,   # Ca²⁺ = 40.08/2
            'K': 39.10,    # K⁺ = 39.10/1  
            'Mg': 12.15,   # Mg²⁺ = 24.31/2
            'Na': 22.99,   # Na⁺ = 22.99/1
            'NH4': 18.04,  # NH₄⁺ = 18.04/1
            'N': 14.01,    # NO₃⁻ = 14.01/1 (as N)
            'S': 16.03,    # SO₄²⁻ = 32.06/2 (as S)
            'P': 30.97,    # H₂PO₄⁻ = 30.97/1 (as P)
            'Cl': 35.45,   # Cl⁻ = 35.45/1
            'HCO3': 61.02  # HCO₃⁻ = 61.02/1
        }
        
        meq_l = {}
        for element, mg_l in concentrations_mg_l.items():
            if element in conversion_factors and mg_l > 0:
                meq_l[element] = mg_l / conversion_factors[element]
            else:
                meq_l[element] = 0
        
        return meq_l

    def _get_quality_grade(self, score: float) -> str:
        """Convert quality score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'A-'
        elif score >= 75:
            return 'B+'
        elif score >= 70:
            return 'B'
        elif score >= 65:
            return 'B-'
        elif score >= 60:
            return 'C+'
        elif score >= 55:
            return 'C'
        elif score >= 50:
            return 'C-'
        else:
            return 'F'


class CostAnalyzer:
    """Professional cost analysis module with market-based pricing"""

    def __init__(self):
        # Market-based fertilizer costs (CRC per kg)
        # Updated with realistic 2024 pricing
        self.fertilizer_costs = {
            # Acids - Precios basados en API de Costa Rica
            'Acido Nítrico': 10000.0,
            'Acido Nitrico': 10000.0,
            'Ácido Nítrico': 10000.0,
            'Acido Fosfórico': 10000.0,
            'Acido Fosforico': 10000.0,
            'Ácido Fosfórico': 10000.0,
            'Acido Sulfurico': 8500.0,  # Estimado basado en patrón de precios
            'Acido Sulfúrico': 8500.0,
            'Ácido Sulfúrico': 8500.0,
            
            # Nitrates - Precios basados en API + estimaciones realistas
            'Nitrato de calcio': 14875.0,  # Precio exacto de API
            'Nitrato de Calcio': 14875.0,
            'Calcium Nitrate': 14875.0,
            'Nitrato de potasio': 16000.0,  # Estimado (típicamente más caro que calcio)
            'Nitrato de Potasio': 16000.0,
            'Potassium Nitrate': 16000.0,
            'Nitrato de amonio': 9500.0,   # Estimado (más barato que calcio)
            'Nitrato de Amonio': 9500.0,
            'Ammonium Nitrate': 9500.0,
            'Nitrato de magnesio': 12500.0, # Estimado (intermedio)
            'Nitrato de Magnesio': 12500.0,
            'Magnesium Nitrate': 12500.0,
            
            # Sulfates - Basado en patrón de sulfato de amonio de API
            'Sulfato de amonio': 10520.25,  # Precio exacto de API
            'Sulfato de Amonio': 10520.25,
            'Ammonium Sulfate': 10520.25,
            'Sulfato de potasio': 18000.0,  # Estimado (típicamente caro)
            'Sulfato de Potasio': 18000.0,
            'Potassium Sulfate': 18000.0,
            'Sulfato de magnesio': 8500.0,  # Estimado (más barato)
            'Sulfato de Magnesio': 8500.0,
            'Magnesium Sulfate': 8500.0,
            'Sulfato de calcio': 7500.0,   # Estimado (barato)
            'Sulfato de Calcio': 7500.0,
            'Calcium Sulfate': 7500.0,
            
            # Phosphates - Típicamente caros en Costa Rica
            'Fosfato monopotasico': 25000.0,  # Estimado alto (premium)
            'Fosfato monopotásico': 25000.0,
            'Fosfato Monopotasico': 25000.0,
            'Fosfato Monopotásico': 25000.0,
            'Monopotassium Phosphate': 25000.0,
            'KH2PO4': 25000.0,
            'MKP': 25000.0,
            'Fosfato dipotasico': 23000.0,
            'Fosfato dipotásico': 23000.0,
            'Dipotassium Phosphate': 23000.0,
            'Fosfato monoamonico': 20000.0,  # MAP - común
            'Fosfato monoamónico': 20000.0,
            'Monoammonium Phosphate': 20000.0,
            'MAP': 20000.0,
            'Fosfato diamonico': 18000.0,    # DAP - más común
            'Fosfato diamónico': 18000.0,
            'Fosfato diamónico (DAP)': 18000.0,  # Variante con paréntesis
            'Diammonium Phosphate': 18000.0,
            'DAP': 18000.0,
            
            # Chlorides - Basado en precio de Cloruro de Potasio de API
            'Cloruro de calcio': 12000.0,   # Estimado (más barato que K)
            'Cloruro de Calcio': 12000.0,
            'Calcium Chloride': 12000.0,
            'Cloruro de potasio': 58125.0,  # Precio exacto de API
            'Cloruro de Potasio': 58125.0,  # Precio exacto de API
            'Potassium Chloride': 58125.0,
            'Cloruro de magnesio': 10000.0, # Estimado
            'Cloruro de Magnesio': 10000.0,
            'Magnesium Chloride': 10000.0,
            
            # Micronutrients - Típicamente muy caros en Costa Rica
            'Quelato de hierro': 75000.0,   # Premium quelatos
            'Quelato de Hierro': 75000.0,
            'Iron Chelate': 75000.0,
            'Fe-EDTA': 75000.0,
            'FeEDTA': 75000.0,
            'Sulfato de hierro': 15000.0,   # Más barato que quelatos
            'Sulfato de Hierro': 15000.0,
            'Iron Sulfate': 15000.0,
            'FeSO4': 15000.0,
            'Sulfato de manganeso': 18000.0,
            'Sulfato de Manganeso': 18000.0,
            'Manganese Sulfate': 18000.0,
            'MnSO4': 18000.0,
            'MnSO4.4H2O': 18000.0,
            'Sulfato de zinc': 22000.0,     # Más caro que manganeso
            'Sulfato de Zinc': 22000.0,
            'Zinc Sulfate': 22000.0,
            'ZnSO4': 22000.0,
            'ZnSO4.7H2O': 22000.0,
            'Sulfato de cobre': 28000.0,    # Más caro
            'Sulfato de Cobre': 28000.0,
            'Copper Sulfate': 28000.0,
            'CuSO4': 28000.0,
            'CuSO4.5H2O': 28000.0,
            'Sulfato de cobre (acidif)': 28000.0,  # Variante específica
            'Acido borico': 35000.0,        # Boro es caro
            'Ácido bórico': 35000.0,
            'Ácido Bórico': 35000.0,
            'Boric Acid': 35000.0,
            'H3BO3': 35000.0,
            'Molibdato de sodio': 95000.0,  # Molibdeno muy caro
            'Molibdato de Sodio': 95000.0,
            'Sodium Molybdate': 95000.0,
            'Na2MoO4': 95000.0,
            'Na2MoO4.2H2O': 95000.0
        }

        # ACTUALIZAR TAMBIÉN los regional_factors para Costa Rica:
        self.regional_factors = {
            'North America': 1.0,
            'Europe': 1.15,
            'Asia': 0.85,
            'Latin America': 1.0,      # Cambiar de 0.90 a 1.0 para Costa Rica
            'Costa Rica': 1.0,         # Agregar específico para Costa Rica
            'Default': 1.0
        }

    def calculate_cost_analysis(self, 
                           dosages: Dict[str, float], 
                           fertilizer_data: Dict[str, Any], 
                           volume_liters: float,
                           region: str = 'Default') -> Dict[str, Any]:
        """
        Calculate comprehensive cost analysis from dosages and fertilizer data
        
        Args:
            dosages: Fertilizer dosages in g/L
            fertilizer_data: Dictionary containing fertilizer information (from API)  
            volume_liters: Total solution volume in liters
            region: Region for pricing adjustments
        
        Returns:
            Comprehensive cost analysis dictionary
        """
        print(f"[COST] Calculating cost analysis for {len(dosages)} fertilizers...")
        
        # Convert dosages (g/L) to amounts (kg) for the volume
        fertilizer_amounts_kg = {}
        for fert_name, dosage_g_l in dosages.items():
            if dosage_g_l > 0.001:  # Only include meaningful dosages
                amount_kg = (dosage_g_l * volume_liters) / 1000  # Convert g/L to kg for total volume
                fertilizer_amounts_kg[fert_name] = amount_kg
        
        print(f"[COST] Active fertilizers: {len(fertilizer_amounts_kg)}")
        for name, amount in fertilizer_amounts_kg.items():
            print(f"  • {name}: {amount:.3f} kg")
        
        # Use the existing cost calculation method
        cost_result = self.calculate_solution_cost_with_api_data(
            fertilizer_amounts=fertilizer_amounts_kg,
            concentrated_volume=volume_liters,
            diluted_volume=volume_liters,  # Assuming no dilution for now
            region=region
        )
        
        # Enhance the result with additional analysis for the constrained endpoint
        enhanced_result = cost_result.copy()
        
        # Add dosage-specific information
        enhanced_result['dosage_details'] = {}
        total_dosage = sum(dosages.values())
        
        for fert_name, dosage_g_l in dosages.items():
            if dosage_g_l > 0.001:
                fert_data = fertilizer_data.get(fert_name, {})
                
                # Calculate cost per g/L for this fertilizer
                amount_kg = fertilizer_amounts_kg.get(fert_name, 0)
                fert_cost = cost_result['cost_per_fertilizer'].get(fert_name, 0)
                cost_per_g_l = (fert_cost / dosage_g_l) if dosage_g_l > 0 else 0
                
                enhanced_result['dosage_details'][fert_name] = {
                    'dosage_g_l': dosage_g_l,
                    'amount_kg': amount_kg,
                    'cost_total': fert_cost,
                    'cost_per_g_l': cost_per_g_l,
                    'percentage_of_total_dosage': (dosage_g_l / total_dosage * 100) if total_dosage > 0 else 0,
                    'percentage_of_total_cost': cost_result['cost_percentages'].get(fert_name, 0),
                    'api_price_available': fert_data.get('price') is not None,
                    'price_match_type': fert_data.get('price_match_type', 'unknown')
                }
        
        # Add summary statistics
        enhanced_result['summary_statistics'] = {
            'total_dosage_g_l': total_dosage,
            'total_volume_liters': volume_liters,
            'active_fertilizers': len(fertilizer_amounts_kg),
            'cost_per_g_total_dosage': (cost_result['total_cost_concentrated'] / total_dosage) if total_dosage > 0 else 0,
            'average_dosage_per_fertilizer': total_dosage / len(fertilizer_amounts_kg) if len(fertilizer_amounts_kg) > 0 else 0,
            'cost_efficiency_score': min(100, (1 / (cost_result['cost_per_liter_diluted'] * 1000)) * 10) if cost_result['cost_per_liter_diluted'] > 0 else 0
        }
        
        # Add cost optimization suggestions
        enhanced_result['optimization_suggestions'] = []
        
        # Find most expensive fertilizers by cost percentage
        cost_percentages = cost_result.get('cost_percentages', {})
        expensive_fertilizers = [(name, pct) for name, pct in cost_percentages.items() if pct > 25]
        expensive_fertilizers.sort(key=lambda x: x[1], reverse=True)
        
        if expensive_fertilizers:
            top_expensive = expensive_fertilizers[0]
            enhanced_result['optimization_suggestions'].append({
                'type': 'expensive_fertilizer',
                'message': f'{top_expensive[0]} accounts for {top_expensive[1]:.1f}% of total cost. Consider alternatives if available.',
                'fertilizer': top_expensive[0],
                'cost_percentage': top_expensive[1]
            })
        
        # Check for high-dosage, low-cost-efficiency fertilizers
        for fert_name, details in enhanced_result['dosage_details'].items():
            if details['dosage_g_l'] > 2.0 and details['cost_per_g_l'] > enhanced_result['summary_statistics']['cost_per_g_total_dosage']:
                enhanced_result['optimization_suggestions'].append({
                    'type': 'inefficient_dosage',
                    'message': f'{fert_name} requires high dosage ({details["dosage_g_l"]:.2f} g/L) with above-average cost efficiency.',
                    'fertilizer': fert_name,
                    'dosage': details['dosage_g_l']
                })
        
        # Check pricing data coverage
        api_pricing_count = sum(1 for details in enhanced_result['dosage_details'].values() if details['api_price_available'])
        total_fertilizers = len(enhanced_result['dosage_details'])
        pricing_coverage = (api_pricing_count / total_fertilizers * 100) if total_fertilizers > 0 else 0
        
        if pricing_coverage < 70:
            enhanced_result['optimization_suggestions'].append({
                'type': 'limited_pricing_data',
                'message': f'Only {pricing_coverage:.1f}% of fertilizers have API pricing data. Cost analysis may be incomplete.',
                'coverage_percentage': pricing_coverage
            })
        
        # Add region-specific information
        enhanced_result['regional_info'] = {
            'region': region,
            'currency': 'CRC',  # Costa Rican Colones
            'pricing_date': cost_result.get('pricing_date', 'unknown'),
            'regional_factor_applied': cost_result.get('regional_factor', 1.0)
        }
        
        # Calculate cost-effectiveness metrics
        enhanced_result['cost_effectiveness'] = {
            'cost_per_liter_final_solution': cost_result['cost_per_liter_diluted'],
            'cost_per_cubic_meter': cost_result['cost_per_liter_diluted'] * 1000,
            'cost_per_gram_nutrients_delivered': 0,  # Would need nutrient delivery calculation
            'relative_cost_rating': self._get_cost_rating(cost_result['cost_per_liter_diluted'])
        }
        
        print(f"[COST] ✅ Cost analysis completed:")
        print(f"  • Total cost: ₡{cost_result['total_cost_concentrated']:.3f}")
        print(f"  • Cost per liter: ₡{cost_result['cost_per_liter_diluted']:.4f}")
        print(f"  • API pricing coverage: {pricing_coverage:.1f}%")
        print(f"  • Optimization suggestions: {len(enhanced_result['optimization_suggestions'])}")
        
        return enhanced_result

    def _get_cost_rating(self, cost_per_liter: float) -> str:
        """
        Get relative cost rating based on cost per liter
        """
        if cost_per_liter < 0.001:
            return 'Very Low'
        elif cost_per_liter < 0.005:
            return 'Low'
        elif cost_per_liter < 0.015:
            return 'Moderate'
        elif cost_per_liter < 0.030:
            return 'High'
        else:
            return 'Very High'


    def calculate_solution_cost_with_api_data(self, fertilizer_amounts: Dict[str, float], 
                              concentrated_volume: float, 
                              diluted_volume: float,
                              region: str = 'Default') -> Dict[str, Any]:
        """
        Calculate comprehensive solution cost analysis
        """
        print(f"\n[MONEY] CALCULATING COST ANALYSIS")
        print(f"Fertilizer amounts: {len(fertilizer_amounts)} fertilizers")
        print(f"Concentrated volume: {concentrated_volume:.1f} L")
        print(f"Diluted volume: {diluted_volume:.1f} L")
        
        regional_factor = self.regional_factors.get(region, 1.0)
        
        cost_per_fertilizer = {}
        total_cost_concentrated = 0
        total_cost_diluted = 0
        
        # Calculate cost for each fertilizer
        for fertilizer, amount_kg in fertilizer_amounts.items():
            if amount_kg > 0:
                # Get cost per kg (try multiple name variations)
                cost_per_kg = self._get_fertilizer_cost(fertilizer) * regional_factor
                
                # Calculate costs
                cost_concentrated = amount_kg * cost_per_kg
                cost_diluted = cost_concentrated  # Same cost regardless of dilution
                
                cost_per_fertilizer[fertilizer] = {
                    'amount_kg': round(amount_kg, 4),
                    'cost_per_kg': round(cost_per_kg, 2),
                    'total_cost': round(cost_concentrated, 3),
                    'price_source': 'fallback'  # Default to fallback since we're using internal pricing
                }
                
                total_cost_concentrated += cost_concentrated
                total_cost_diluted += cost_diluted
                
                print(f"  {fertilizer}: {amount_kg:.3f} kg × ₡{cost_per_kg:.2f}/kg = ₡{cost_concentrated:.3f}")
        
        # Calculate percentage distribution
        percentage_per_fertilizer = {}
        if total_cost_concentrated > 0:
            for fertilizer, cost_info in cost_per_fertilizer.items():
                percentage = (cost_info['total_cost'] / total_cost_concentrated) * 100
                percentage_per_fertilizer[fertilizer] = round(percentage, 1)
        
        # Calculate per-unit costs
        cost_per_liter_concentrated = total_cost_concentrated / concentrated_volume if concentrated_volume > 0 else 0
        cost_per_liter_diluted = total_cost_diluted / diluted_volume if diluted_volume > 0 else 0
        cost_per_m3_diluted = cost_per_liter_diluted * 1000
        # Create simplified cost dictionary for backward compatibility
        simple_cost_per_fertilizer = {name: info['total_cost'] for name, info in cost_per_fertilizer.items()}
        
        # Calculate pricing summary
        total_fertilizers_used = len([f for f in cost_per_fertilizer.keys() if cost_per_fertilizer[f]['amount_kg'] > 0])
        api_prices_used = 0  # Default to 0 since we're using fallback prices
        fallback_prices_used = total_fertilizers_used
        api_price_coverage = 0.0  # Default to 0% since we're using fallback prices
        
        # Enhanced result structure to match expected format
        result = {
            'total_cost_crc': round(total_cost_concentrated, 3),
            'cost_per_liter_crc': round(cost_per_liter_diluted, 4),
            'cost_per_m3_crc': round(cost_per_m3_diluted, 2),
            'api_price_coverage_percent': api_price_coverage,
            'fertilizer_costs': simple_cost_per_fertilizer,
            'cost_percentages': percentage_per_fertilizer,
            'pricing_sources': {
                'api_prices_used': api_prices_used,
                'fallback_prices_used': fallback_prices_used
            },
            'cost_per_m3_diluted': round(cost_per_m3_diluted, 2),
            'cost_per_fertilizer': cost_per_fertilizer,
            'regional_factor': regional_factor,
            'region': region,
            
            # Legacy fields for backward compatibility
            'total_cost_concentrated': round(total_cost_concentrated, 3),
            'total_cost_diluted': round(total_cost_diluted, 3),
            'cost_per_liter_concentrated': round(cost_per_liter_concentrated, 4),
            'cost_per_liter_diluted': round(cost_per_liter_diluted, 4),
            'cost_per_fertilizer': simple_cost_per_fertilizer,
            'percentage_per_fertilizer': percentage_per_fertilizer,
            'detailed_costs': cost_per_fertilizer,
            
            # Pricing summary for detailed analysis
            'pricing_summary': {
                'api_price_coverage': api_price_coverage,
                'api_prices_used': api_prices_used,
                'fallback_prices_used': fallback_prices_used,
                'total_fertilizers_analyzed': total_fertilizers_used
            }
        }
        
        print(f"[MONEY] Total cost: ₡{total_cost_concentrated:.3f}")
        print(f"[WATER] Cost per liter: ₡{cost_per_liter_diluted:.4f}")
        
        return result

    def _get_fertilizer_cost(self, fertilizer_name: str) -> float:
        """
        Get fertilizer cost with intelligent name matching
        """
        # Try exact match first
        if fertilizer_name in self.fertilizer_costs:
            return self.fertilizer_costs[fertilizer_name]
        
        # Try case-insensitive match
        name_lower = fertilizer_name.lower()
        for cost_name, cost in self.fertilizer_costs.items():
            if cost_name.lower() == name_lower:
                return cost
        
        # Try partial matching
        for cost_name, cost in self.fertilizer_costs.items():
            if name_lower in cost_name.lower() or cost_name.lower() in name_lower:
                return cost
        
        # Try keyword matching for common fertilizers
        keyword_mapping = {
            'nitrato': 1.00,
            'sulfato': 0.80,
            'fosfato': 2.50,
            'cloruro': 1.20,
            'calcio': 0.80,
            'potasio': 1.40,
            'magnesio': 0.70,
            'hierro': 5.00,
            'zinc': 4.00,
            'cobre': 5.50,
            'manganeso': 3.50,
            'boro': 6.00,
            'molibdeno': 12.00,
            'acido': 1.50
        }
        
        for keyword, default_cost in keyword_mapping.items():
            if keyword in name_lower:
                print(f"    [MONEY] Using keyword-based cost for {fertilizer_name}: ₡{default_cost:.2f}/kg")
                return default_cost
        
        # Default cost for unknown fertilizers
        default_cost = 2.00
        print(f"    [WARNING]  Unknown fertilizer {fertilizer_name}, using default cost: ₡{default_cost:.2f}/kg")
        return default_cost
   