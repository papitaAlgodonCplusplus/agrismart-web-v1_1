#!/usr/bin/env python3
"""
DIAGNOSTIC SCRIPT: Debug fertilizer dosage issues
Run this to understand why fertilizer rows are missing from PDF
"""

def diagnose_fertilizer_dosages(calculation_results):
    """Comprehensive diagnosis of fertilizer dosage data structure"""
    
    print("=" * 60)
    print("FERTILIZER DOSAGE DIAGNOSTIC REPORT")
    print("=" * 60)
    
    # 1. Check if calculation_results exists
    if not calculation_results:
        print("[ERROR] ERROR: calculation_results is None or empty!")
        return
    
    print(f"[SUCCESS] calculation_results found with {len(calculation_results)} top-level keys")
    print(f"   Keys: {list(calculation_results.keys())}")
    
    # 2. Check fertilizer_dosages
    fertilizer_dosages = calculation_results.get('fertilizer_dosages', {})
    
    if not fertilizer_dosages:
        print("[ERROR] ERROR: fertilizer_dosages is None or empty!")
        print("   This is likely why no fertilizer rows appear in the PDF")
        return
    
    print(f"[SUCCESS] fertilizer_dosages found with {len(fertilizer_dosages)} fertilizers")
    
    # 3. Analyze each fertilizer dosage
    print("\n[FORM] INDIVIDUAL FERTILIZER ANALYSIS:")
    print("-" * 50)
    
    active_fertilizers = 0
    total_dosage = 0
    
    for i, (fert_name, dosage_info) in enumerate(fertilizer_dosages.items(), 1):
        print(f"\n{i}. {fert_name}")
        print(f"   Raw data: {dosage_info}")
        print(f"   Data type: {type(dosage_info)}")
        
        # Try to extract dosage value
        if isinstance(dosage_info, dict):
            print(f"   Dict keys: {list(dosage_info.keys())}")
            
            # Check for dosage_g_per_L
            if 'dosage_g_per_L' in dosage_info:
                dosage_g_l = dosage_info['dosage_g_per_L']
                print(f"   dosage_g_per_L: {dosage_g_l} ({type(dosage_g_l)})")
                
                try:
                    dosage_float = float(dosage_g_l)
                    print(f"   [SUCCESS] Converted to float: {dosage_float}")
                    
                    if dosage_float > 0.0001:
                        print(f"   [SUCCESS] ACTIVE: Above threshold (0.0001)")
                        active_fertilizers += 1
                        total_dosage += dosage_float
                    else:
                        print(f"   [WARNING]  INACTIVE: Below threshold ({dosage_float:.8f} < 0.0001)")
                        
                except (ValueError, TypeError) as e:
                    print(f"   [ERROR] Conversion failed: {e}")
            
            # Check for other possible dosage keys
            for key in ['dosage_g_L', 'dosage', 'dosage_ml_per_L']:
                if key in dosage_info:
                    print(f"   {key}: {dosage_info[key]}")
        
        elif isinstance(dosage_info, (int, float)):
            print(f"   Direct numeric value: {dosage_info}")
            try:
                dosage_float = float(dosage_info)
                if dosage_float > 0.0001:
                    active_fertilizers += 1
                    total_dosage += dosage_float
            except:
                pass
        
        else:
            print(f"   [ERROR] Unknown data type: {type(dosage_info)}")
    
    # 4. Summary
    print("\n[?] SUMMARY:")
    print("-" * 30)
    print(f"Total fertilizers: {len(fertilizer_dosages)}")
    print(f"Active fertilizers (>0.0001 g/L): {active_fertilizers}")
    print(f"Inactive fertilizers: {len(fertilizer_dosages) - active_fertilizers}")
    print(f"Total dosage: {total_dosage:.6f} g/L")
    
    # 5. Recommendations
    print("\n[?] RECOMMENDATIONS:")
    print("-" * 30)
    
    if active_fertilizers == 0:
        print("[ERROR] NO ACTIVE FERTILIZERS FOUND!")
        print("   This explains why fertilizer rows are missing from PDF")
        print("   Possible causes:")
        print("   1. Calculation method returned zero/very small dosages")
        print("   2. Data structure format changed")
        print("   3. Units conversion issue (mg/L vs g/L)")
        print("   4. Threshold too high in PDF generator")
        print("\n   FIXES TO TRY:")
        print("   - Lower threshold in PDF generator (0.000001 instead of 0.0001)")
        print("   - Check if dosages are in mg/L and need conversion to g/L")
        print("   - Verify calculation method is working correctly")
        print("   - Add debug fertilizers with non-zero values")
    
    elif active_fertilizers < 3:
        print("[WARNING]  FEW ACTIVE FERTILIZERS")
        print("   This might indicate calculation issues")
        print("   - Check if optimization converged properly")
        print("   - Verify fertilizer database compositions")
    
    else:
        print("[SUCCESS] GOOD: Multiple active fertilizers found")
        print("   PDF should show fertilizer rows if extraction is working")
    
    print("\n" + "=" * 60)

# Test with sample data
def test_diagnostic():
    """Test the diagnostic with sample data structures"""
    
    # Test case 1: Working data structure
    print("TEST 1: Working data structure")
    working_data = {
        'fertilizer_dosages': {
            'Nitrato de calcio': {'dosage_g_per_L': 0.919, 'dosage_ml_per_L': 0.919},
            'Nitrato de potasio': {'dosage_g_per_L': 0.011, 'dosage_ml_per_L': 0.011},
            'Fosfato monopotasico': {'dosage_g_per_L': 0.294, 'dosage_ml_per_L': 0.294}
        }
    }
    diagnose_fertilizer_dosages(working_data)
    
    print("\n" + "="*60 + "\n")
    
    # Test case 2: Zero dosages
    print("TEST 2: Zero dosages (problem case)")
    zero_data = {
        'fertilizer_dosages': {
            'Nitrato de calcio': {'dosage_g_per_L': 0.0, 'dosage_ml_per_L': 0.0},
            'Nitrato de potasio': {'dosage_g_per_L': 0.0, 'dosage_ml_per_L': 0.0},
            'Fosfato monopotasico': {'dosage_g_per_L': 0.0, 'dosage_ml_per_L': 0.0}
        }
    }
    diagnose_fertilizer_dosages(zero_data)

if __name__ == "__main__":
    test_diagnostic()
    
    print("\n[?] TO USE THIS DIAGNOSTIC:")
    print("1. Import this function in your main code")
    print("2. Call diagnose_fertilizer_dosages(calculation_results) before PDF generation")
    print("3. Check the output to understand why fertilizer rows are missing")
    print("4. Apply the recommended fixes")