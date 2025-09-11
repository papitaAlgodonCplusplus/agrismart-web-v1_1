#!/usr/bin/env python3
"""
UPDATED COMPLETE FERTILIZER DATABASE MODULE WITH MICRONUTRIENT SUPPORT
Comprehensive fertilizer composition database with intelligent matching and complete micronutrient coverage
"""

from typing import Dict, Optional, List, Any
from models import Fertilizer, FertilizerComposition, FertilizerChemistry

class EnhancedFertilizerDatabase:
    """Complete fertilizer composition database with intelligent pattern matching and micronutrient support"""
    
    def __init__(self):
        self.fertilizer_data = {
            # ACIDS
            'acido_nitrico': {
                'patterns': ['acido nitrico', 'nitric acid', 'hno3', 'acido nítrico'],
                'formula_patterns': ['HNO3'],
                'composition': {
                    'formula': 'HNO3',
                    'mw': 63.01,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 22.23, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'acido_fosforico': {
                'patterns': ['acido fosforico', 'acido fosfórico', 'phosphoric acid', 'h3po4'],
                'formula_patterns': ['H3PO4'],
                'composition': {
                    'formula': 'H3PO4',
                    'mw': 97.99,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 31.61, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'acido_sulfurico': {
                'patterns': ['acido sulfurico', 'acido sulfúrico', 'sulfuric acid', 'h2so4'],
                'formula_patterns': ['H2SO4'],
                'composition': {
                    'formula': 'H2SO4',
                    'mw': 98.08,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 32.69, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            
            # NITRATES
            'nitrato_calcio': {
                'patterns': ['nitrato de calcio', 'calcium nitrate', 'nitrato calcio'],
                'formula_patterns': ['CA(NO3)2', 'CA(NO3)2.4H2O', 'CA(NO3)2.2H2O', 'Ca(NO3)2'],
                'composition': {
                    'formula': 'Ca(NO3)2.4H2O',
                    'mw': 236.15,
                    'cations': {'Ca': 16.97, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 11.86, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'nitrato_potasio': {
                'patterns': ['nitrato de potasio', 'potassium nitrate', 'nitrato potasio'],
                'formula_patterns': ['KNO3'],
                'composition': {
                    'formula': 'KNO3',
                    'mw': 101.1,
                    'cations': {'Ca': 0, 'K': 38.67, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 13.85, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'nitrato_amonio': {
                'patterns': ['nitrato de amonio', 'ammonium nitrate', 'nitrato amonio'],
                'formula_patterns': ['NH4NO3'],
                'composition': {
                    'formula': 'NH4NO3',
                    'mw': 80.04,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 22.5, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 35.0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'nitrato_magnesio': {
                'patterns': ['nitrato de magnesio', 'magnesium nitrate', 'nitrato magnesio'],
                'formula_patterns': ['MG(NO3)2', 'MG(NO3)2.6H2O', 'Mg(NO3)2'],
                'composition': {
                    'formula': 'Mg(NO3)2.6H2O',
                    'mw': 256.41,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 9.48, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 10.93, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            
            # SULFATES
            'sulfato_amonio': {
                'patterns': ['sulfato de amonio', 'ammonium sulfate', 'sulfato amonio'],
                'formula_patterns': ['(NH4)2SO4', 'NH4)2SO4'],
                'composition': {
                    'formula': '(NH4)2SO4',
                    'mw': 132.14,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 27.28, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 21.21, 'S': 24.26, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'sulfato_potasio': {
                'patterns': ['sulfato de potasio', 'potassium sulfate', 'sulfato potasio'],
                'formula_patterns': ['K2SO4'],
                'composition': {
                    'formula': 'K2SO4',
                    'mw': 174.26,
                    'cations': {'Ca': 0, 'K': 44.87, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 18.39, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'sulfato_magnesio': {
                'patterns': ['sulfato de magnesio', 'magnesium sulfate', 'sulfato magnesio', 'sal de epsom', 'epsom salt'],
                'formula_patterns': ['MGSO4', 'MGSO4.7H2O', 'MgSO4', 'MgSO4.7H2O'],
                'composition': {
                    'formula': 'MgSO4.7H2O',
                    'mw': 246.47,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 9.87, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 13.01, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'sulfato_calcio': {
                'patterns': ['sulfato de calcio', 'calcium sulfate', 'sulfato calcio', 'yeso'],
                'formula_patterns': ['CASO4', 'CASO4.2H2O', 'CaSO4', 'CaSO4.2H2O'],
                'composition': {
                    'formula': 'CaSO4.2H2O',
                    'mw': 172.17,
                    'cations': {'Ca': 23.28, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 18.62, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            
            # PHOSPHATES
            'fosfato_monopotasico': {
                'patterns': ['fosfato monopotasico', 'fosfato monopotásico', 'monopotassium phosphate', 'kh2po4', 'mkp'],
                'formula_patterns': ['KH2PO4'],
                'composition': {
                    'formula': 'KH2PO4',
                    'mw': 136.09,
                    'cations': {'Ca': 0, 'K': 28.73, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 22.76, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'fosfato_dipotasico': {
                'patterns': ['fosfato dipotasico', 'fosfato dipotásico', 'dipotassium phosphate', 'k2hpo4', 'dkp'],
                'formula_patterns': ['K2HPO4'],
                'composition': {
                    'formula': 'K2HPO4',
                    'mw': 174.18,
                    'cations': {'Ca': 0, 'K': 44.93, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 17.79, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'fosfato_monoamonico': {
                'patterns': ['fosfato monoamonico', 'fosfato monoamónico', 'monoammonium phosphate', 'map'],
                'formula_patterns': ['NH4H2PO4'],
                'composition': {
                    'formula': 'NH4H2PO4',
                    'mw': 115.03,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 15.65, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 12.18, 'S': 0, 'Cl': 0, 'P': 26.93, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'fosfato_diamonico': {
                'patterns': ['fosfato diamonico', 'fosfato diamónico', 'diammonium phosphate', 'dap'],
                'formula_patterns': ['(NH4)2HPO4'],
                'composition': {
                    'formula': '(NH4)2HPO4',
                    'mw': 132.06,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 27.28, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 21.22, 'S': 0, 'Cl': 0, 'P': 23.47, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            
            # CHLORIDES
            'cloruro_calcio': {
                'patterns': ['cloruro de calcio', 'calcium chloride', 'cloruro calcio'],
                'formula_patterns': ['CACL2', 'CACL2.2H2O', 'CaCl2', 'CaCl2.2H2O'],
                'composition': {
                    'formula': 'CaCl2.2H2O',
                    'mw': 147.01,
                    'cations': {'Ca': 27.26, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 48.23, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_potasio': {
                'patterns': ['cloruro de potasio', 'potassium chloride', 'cloruro potasio', 'muriato de potasio'],
                'formula_patterns': ['KCL', 'KCl'],
                'composition': {
                    'formula': 'KCl',
                    'mw': 74.55,
                    'cations': {'Ca': 0, 'K': 52.44, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 47.56, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_magnesio': {
                'patterns': ['cloruro de magnesio', 'magnesium chloride', 'cloruro magnesio'],
                'formula_patterns': ['MGCL2', 'MGCL2.6H2O', 'MgCl2', 'MgCl2.6H2O'],
                'composition': {
                    'formula': 'MgCl2.6H2O',
                    'mw': 203.30,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 11.96, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 34.87, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },

            # ===== IRON SOURCES (Complete Coverage) =====
            'quelato_hierro': {
                'patterns': ['quelato de hierro', 'iron chelate', 'fe-edta', 'fe edta', 'feeedta', 'iron edta', 'chelato hierro'],
                'formula_patterns': ['FE-EDTA', 'C10H12FeN2NaO8'],
                'composition': {
                    'formula': 'C10H12FeN2NaO8',
                    'mw': 367.05,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 6.27, 'NH4': 0, 'Fe': 13.0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 7.63, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'sulfato_hierro': {
                'patterns': ['sulfato de hierro', 'iron sulfate', 'sulfato ferroso', 'feso4', 'ferrous sulfate', 'hierro sulfato'],
                'formula_patterns': ['FESO4', 'FESO4.7H2O', 'FeSO4', 'FeSO4.7H2O'],
                'composition': {
                    'formula': 'FeSO4.7H2O',
                    'mw': 278.01,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 20.09, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 11.53, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_hierro': {
                'patterns': ['cloruro de hierro', 'iron chloride', 'ferric chloride', 'fecl3', 'hierro cloruro'],
                'formula_patterns': ['FECL3', 'FeCl3.6H2O', 'FeCl3'],
                'composition': {
                    'formula': 'FeCl3.6H2O',
                    'mw': 270.30,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 20.66, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 39.35, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'quelato_hierro_dtpa': {
                'patterns': ['fe-dtpa', 'iron dtpa', 'quelato hierro dtpa', 'dtpa iron'],
                'formula_patterns': ['FE-DTPA'],
                'composition': {
                    'formula': 'Fe-DTPA',
                    'mw': 447.16,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 5.15, 'NH4': 0, 'Fe': 12.5, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 6.26, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },

            # ===== MANGANESE SOURCES (Complete Coverage) =====
            'sulfato_manganeso': {
                'patterns': ['sulfato de manganeso', 'manganese sulfate', 'sulfato manganeso', 'mnso4', 'manganeso sulfato'],
                'formula_patterns': ['MNSO4', 'MNSO4.4H2O', 'MnSO4', 'MnSO4.4H2O', 'MNSO4.H2O'],
                'composition': {
                    'formula': 'MnSO4.4H2O',
                    'mw': 223.06,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 24.63, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 14.37, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_manganeso': {
                'patterns': ['cloruro de manganeso', 'manganese chloride', 'mncl2', 'manganeso cloruro'],
                'formula_patterns': ['MNCL2', 'MnCl2.4H2O', 'MnCl2'],
                'composition': {
                    'formula': 'MnCl2.4H2O',
                    'mw': 197.91,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 27.76, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 35.84, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'quelato_manganeso': {
                'patterns': ['quelato de manganeso', 'manganese chelate', 'mn-edta', 'mn edta', 'manganeso quelato'],
                'formula_patterns': ['MN-EDTA'],
                'composition': {
                    'formula': 'MnEDTA',
                    'mw': 345.08,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 6.67, 'NH4': 0, 'Fe': 0, 'Mn': 15.92, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 8.12, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },

            # ===== ZINC SOURCES (Complete Coverage) =====
            'sulfato_zinc': {
                'patterns': ['sulfato de zinc', 'zinc sulfate', 'sulfato zinc', 'znso4', 'zinc sulfato'],
                'formula_patterns': ['ZNSO4', 'ZNSO4.7H2O', 'ZnSO4', 'ZnSO4.7H2O', 'ZNSO4.H2O'],
                'composition': {
                    'formula': 'ZnSO4.7H2O',
                    'mw': 287.56,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 22.74, 'Cu': 0},
                    'anions': {'N': 0, 'S': 11.15, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_zinc': {
                'patterns': ['cloruro de zinc', 'zinc chloride', 'zncl2', 'zinc cloruro'],
                'formula_patterns': ['ZNCL2', 'ZnCl2'],
                'composition': {
                    'formula': 'ZnCl2',
                    'mw': 136.30,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 47.96, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 52.04, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'quelato_zinc': {
                'patterns': ['quelato de zinc', 'zinc chelate', 'zn-edta', 'zn edta', 'zinc quelato'],
                'formula_patterns': ['ZN-EDTA'],
                'composition': {
                    'formula': 'ZnEDTA',
                    'mw': 351.56,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 6.54, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 18.60, 'Cu': 0},
                    'anions': {'N': 7.97, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },

            # ===== COPPER SOURCES (Complete Coverage) =====
            'sulfato_cobre': {
                'patterns': ['sulfato de cobre', 'copper sulfate', 'sulfato cobre', 'cuso4', 'cobre sulfato'],
                'formula_patterns': ['CUSO4', 'CUSO4.5H2O', 'CuSO4', 'CuSO4.5H2O'],
                'composition': {
                    'formula': 'CuSO4.5H2O',
                    'mw': 249.69,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 25.45},
                    'anions': {'N': 0, 'S': 12.84, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'cloruro_cobre': {
                'patterns': ['cloruro de cobre', 'copper chloride', 'cucl2', 'cobre cloruro'],
                'formula_patterns': ['CUCL2', 'CuCl2.2H2O', 'CuCl2'],
                'composition': {
                    'formula': 'CuCl2.2H2O',
                    'mw': 170.48,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 37.27},
                    'anions': {'N': 0, 'S': 0, 'Cl': 41.61, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },
            'quelato_cobre': {
                'patterns': ['quelato de cobre', 'copper chelate', 'cu-edta', 'cu edta', 'cobre quelato'],
                'formula_patterns': ['CU-EDTA'],
                'composition': {
                    'formula': 'CuEDTA',
                    'mw': 347.76,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 6.62, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 18.28},
                    'anions': {'N': 8.06, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            },

           # ===== BORON SOURCES (Complete Coverage) =====
            'acido_borico': {
                'patterns': ['acido borico', 'ácido bórico', 'boric acid', 'h3bo3', 'boro acido'],
                'formula_patterns': ['H3BO3'],
                'composition': {
                    'formula': 'H3BO3',
                    'mw': 61.83,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 17.48, 'Mo': 0}
                }
            },
            'borax': {
                'patterns': ['borax', 'sodium borate', 'borato de sodio', 'na2b4o7', 'tetraborato de sodio'],
                'formula_patterns': ['NA2B4O7', 'Na2B4O7.10H2O'],
                'composition': {
                    'formula': 'Na2B4O7.10H2O',
                    'mw': 381.37,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 12.06, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 11.34, 'Mo': 0}
                }
            },
            'soluboro': {
                'patterns': ['soluboro', 'solubor', 'etanolamina borato', 'ethanolamine borate'],
                'formula_patterns': ['C2H8BNO3'],
                'composition': {
                    'formula': 'C2H8BNO3',
                    'mw': 104.90,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 13.35, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 10.3, 'Mo': 0}
                }
            },

            # ===== MOLYBDENUM SOURCES (Complete Coverage) =====
            'molibdato_sodio': {
                'patterns': ['molibdato de sodio', 'sodium molybdate', 'molibdato sodio', 'na2moo4', 'molibdeno sodio'],
                'formula_patterns': ['NA2MOO4', 'NA2MOO4.2H2O', 'Na2MoO4', 'Na2MoO4.2H2O'],
                'composition': {
                    'formula': 'Na2MoO4.2H2O',
                    'mw': 241.95,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 19.01, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 39.66}
                }
            },
            'molibdato_amonio': {
                'patterns': ['molibdato de amonio', 'ammonium molybdate', '(nh4)6mo7o24', 'molibdeno amonio'],
                'formula_patterns': ['(NH4)6MO7O24', '(NH4)6Mo7O24.4H2O'],
                'composition': {
                    'formula': '(NH4)6Mo7O24.4H2O',
                    'mw': 1235.86,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 8.78, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 6.82, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 54.34}
                }
            },
            'molibdato_calcio': {
                'patterns': ['molibdato de calcio', 'calcium molybdate', 'camoo4', 'molibdeno calcio'],
                'formula_patterns': ['CAMOO4', 'CaMoO4'],
                'composition': {
                    'formula': 'CaMoO4',
                    'mw': 200.02,
                    'cations': {'Ca': 20.04, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 47.96}
                }
            },

            # ===== MICRONUTRIENT MIXES (Professional Blends) =====
            'mix_micronutrientes': {
                'patterns': ['mix micronutrientes', 'micronutrient mix', 'cocktail micronutrientes', 'mezcla micronutrientes', 'micro mix'],
                'formula_patterns': ['MICRO-MIX'],
                'composition': {
                    'formula': 'Micronutrient Mix',
                    'mw': 500.0,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 8.0, 'NH4': 0, 'Fe': 7.0, 'Mn': 2.0, 'Zn': 1.5, 'Cu': 0.8},
                    'anions': {'N': 5.0, 'S': 2.0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 1.1, 'Mo': 0.15}
                }
            },
            'tenso_cocktail': {
                'patterns': ['tenso cocktail', 'tenso micro', 'professional micronutrient blend'],
                'formula_patterns': ['TENSO-MIX'],
                'composition': {
                    'formula': 'Professional Micro Blend',
                    'mw': 450.0,
                    'cations': {'Ca': 1.0, 'K': 2.0, 'Mg': 1.5, 'Na': 5.0, 'NH4': 0, 'Fe': 6.0, 'Mn': 1.8, 'Zn': 1.2, 'Cu': 0.6},
                    'anions': {'N': 3.0, 'S': 1.5, 'Cl': 0, 'P': 0.5, 'HCO3': 0, 'B': 0.9, 'Mo': 0.12}
                }
            },

            # ===== SPECIALIZED FERTILIZERS WITH MICRONUTRIENTS =====
            'nitrato_calcio_boro': {
                'patterns': ['nitrato de calcio con boro', 'calcium nitrate boron', 'nitrato calcio boro', 'calcium nitrate + b'],
                'formula_patterns': ['CA(NO3)2+B'],
                'composition': {
                    'formula': 'Ca(NO3)2.4H2O + B',
                    'mw': 236.15,
                    'cations': {'Ca': 16.5, 'K': 0, 'Mg': 0, 'Na': 0, 'NH4': 0, 'Fe': 0, 'Mn': 0, 'Zn': 0, 'Cu': 0},
                    'anions': {'N': 11.5, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0.3, 'Mo': 0}
                }
            },
            'sulfato_magnesio_micro': {
                'patterns': ['sulfato magnesio micro', 'magnesium sulfate micronutrients', 'epsom plus micro'],
                'formula_patterns': ['MGSO4+MICRO'],
                'composition': {
                    'formula': 'MgSO4.7H2O + Micronutrients',
                    'mw': 246.47,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 9.5, 'Na': 1.0, 'NH4': 0, 'Fe': 0.5, 'Mn': 0.3, 'Zn': 0.2, 'Cu': 0.1},
                    'anions': {'N': 0, 'S': 12.8, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0.15, 'Mo': 0.02}
                }
            },

            # ===== CHELATED MICRONUTRIENT BLENDS =====
            'quelatos_mezclados': {
                'patterns': ['quelatos mezclados', 'mixed chelates', 'chelated micronutrient blend', 'edta mix'],
                'formula_patterns': ['EDTA-MIX'],
                'composition': {
                    'formula': 'Mixed EDTA Chelates',
                    'mw': 400.0,
                    'cations': {'Ca': 0, 'K': 0, 'Mg': 0, 'Na': 15.0, 'NH4': 0, 'Fe': 6.0, 'Mn': 3.0, 'Zn': 2.0, 'Cu': 1.0},
                    'anions': {'N': 20.0, 'S': 0, 'Cl': 0, 'P': 0, 'HCO3': 0, 'B': 0, 'Mo': 0}
                }
            }
        }

    def find_fertilizer_composition(self, name: str, formula: str = "") -> Optional[Dict[str, Any]]:
        """
        Find fertilizer composition by intelligent name and formula matching including micronutrients
        """
        name_lower = name.lower().strip()
        formula_upper = formula.upper().strip()

        print(f"    Searching enhanced database for: name='{name_lower}', formula='{formula_upper}'")

        # Strategy 1: Try exact name pattern matching first
        for fert_key, fert_data in self.fertilizer_data.items():
            for pattern in fert_data['patterns']:
                if pattern in name_lower or name_lower in pattern:
                    print(f"    [FOUND] by name pattern: '{pattern}' -> {fert_data['composition']['formula']}")
                    return fert_data['composition']

        # Strategy 2: Try formula pattern matching
        if formula_upper:
            for fert_key, fert_data in self.fertilizer_data.items():
                for formula_pattern in fert_data['formula_patterns']:
                    if formula_pattern in formula_upper or formula_upper in formula_pattern:
                        print(f"    [FOUND] by formula pattern: '{formula_pattern}' -> {fert_data['composition']['formula']}")
                        return fert_data['composition']

        # Strategy 3: Enhanced fuzzy matching including ALL micronutrients
        enhanced_fuzzy_matches = {
            # Existing macronutrient matches
            'calcium': 'nitrato_calcio',
            'potassium': 'nitrato_potasio',
            'nitrate': 'nitrato_calcio',
            'phosphate': 'fosfato_monopotasico',
            'sulfate': 'sulfato_magnesio',
            'magnesium': 'sulfato_magnesio',
            
            # ENHANCED: Complete micronutrient matches
            'iron': 'quelato_hierro',
            'hierro': 'quelato_hierro',
            'fe': 'quelato_hierro',
            'ferrous': 'sulfato_hierro',
            'ferric': 'cloruro_hierro',
            
            'manganese': 'sulfato_manganeso',
            'manganeso': 'sulfato_manganeso',
            'mn': 'sulfato_manganeso',
            
            'zinc': 'sulfato_zinc',
            'zn': 'sulfato_zinc',
            
            'copper': 'sulfato_cobre',
            'cobre': 'sulfato_cobre',
            'cu': 'sulfato_cobre',
            
            'boron': 'acido_borico',
            'boro': 'acido_borico',
            'b': 'acido_borico',
            'boric': 'acido_borico',
            
            'molybdenum': 'molibdato_sodio',
            'molibdeno': 'molibdato_sodio',
            'mo': 'molibdato_sodio',
            'molybdate': 'molibdato_sodio',
            
            # Chelate patterns
            'chelate': 'quelato_hierro',
            'quelato': 'quelato_hierro',
            'edta': 'quelato_hierro',
            'dtpa': 'quelato_hierro_dtpa',
            
            # Mix patterns
            'micronutrient': 'mix_micronutrientes',
            'micronutrientes': 'mix_micronutrientes',
            'micro': 'mix_micronutrientes',
            'mix': 'mix_micronutrientes',
            'cocktail': 'mix_micronutrientes',
            'blend': 'mix_micronutrientes',
            'tenso': 'tenso_cocktail',
            
            # Specialized patterns
            'soluboro': 'soluboro',
            'solubor': 'soluboro',
            'borax': 'borax',
            'epsom': 'sulfato_magnesio'
        }
        
        for keyword, fert_key in enhanced_fuzzy_matches.items():
            if keyword in name_lower:
                if fert_key in self.fertilizer_data:
                    print(f"    [FOUND] by enhanced fuzzy matching: '{keyword}' -> {self.fertilizer_data[fert_key]['composition']['formula']}")
                    return self.fertilizer_data[fert_key]['composition']

        print(f"    [NOT FOUND] NO MATCH FOUND for '{name}' with formula '{formula}'")
        return None

    def create_fertilizer_from_database(self, name: str, formula: str = "") -> Optional[Fertilizer]:
        """
        Create a complete Fertilizer object from enhanced database
        """
        composition_data = self.find_fertilizer_composition(name, formula)
        
        if not composition_data:
            return None
        
        return Fertilizer(
            name=name,
            percentage=98.0,  # Default purity
            molecular_weight=composition_data['mw'],
            salt_weight=composition_data['mw'],
            density=1.0,  # Default density
            chemistry=FertilizerChemistry(
                formula=composition_data['formula'],
                purity=98.0,
                solubility=100.0,
                is_ph_adjuster=False
            ),
            composition=FertilizerComposition(
                cations=composition_data['cations'],
                anions=composition_data['anions']
            )
        )
