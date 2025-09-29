#!/usr/bin/env python3
"""
COMPLETE SWAGGER INTEGRATION MODULE
Real API calls, authentication, and data mapping
"""

import aiohttp
import asyncio
from typing import Dict, List, Optional, Any
from models import Fertilizer, FertilizerComposition, FertilizerChemistry
from fertilizer_database import EnhancedFertilizerDatabase

class SwaggerAPIClient:
    """Complete Swagger API client with real authentication and data fetching"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.auth_token = None
        self.headers = {'Content-Type': 'application/json'}
        self.fertilizer_db = EnhancedFertilizerDatabase()
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def login(self, user_email: str, password: str) -> Dict[str, Any]:
        """
        Real login implementation with proper authentication
        """
        print(f"[AUTH] Authenticating with {self.base_url}...")
        
        url = f"{self.base_url}/Authentication/Login"
        login_data = {
            "userEmail": user_email,
            "password": password
        }

        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.post(url, json=login_data, headers=self.headers, timeout=30) as response:
                response_text = await response.text()
                
                if response.status == 200:
                    try:
                        data = await response.json()
                        
                        if data.get('success') and data.get('result'):
                            self.auth_token = data['result']['token']
                            self.headers['Authorization'] = f'Bearer {self.auth_token}'
                            
                            print(f"[SUCCESS] Authentication successful!")
                            print(f"[USER] User: {data['result'].get('userName', 'Unknown')}")
                            print(f"[COMPANY] Company: {data['result'].get('companyName', 'Unknown')}")
                            
                            return {
                                'success': True,
                                'token': self.auth_token,
                                'user_data': data['result']
                            }
                        else:
                            error_msg = data.get('message', 'Authentication failed')
                            print(f"[ERROR] Login failed: {error_msg}")
                            raise Exception(f"Login failed: {error_msg}")
                            
                    except Exception as json_error:
                            print(f"[ERROR] JSON parsing error: {json_error}")
                            print(f"Raw response: {response_text[:500]}")
                            raise Exception(f"Authentication response parsing failed: {json_error}")
                        
                else:
                    print(f"[ERROR] HTTP Error {response.status}")
                    print(f"Response: {response_text[:500]}")
                    raise Exception(f"Authentication failed: HTTP {response.status}")
                    
        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error during authentication: {e}")
            raise Exception(f"Network error: {e}")
        except Exception as e:
            print(f"[ERROR] Authentication error: {e}")
            raise

    async def get_user_by_id(self, user_id: int) -> Dict[str, Any]:
        """Get user info by ID by fetching all users and filtering"""
        if not self.auth_token:
            raise Exception("Authentication required - please login first")

        print(f"[USER] Fetching user info for ID: {user_id}...")
        
        url = f"{self.base_url}/User"
        
        try:
            async with self.session.get(url, headers=self.headers, timeout=30) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"[SUCCESS] Fetched user list successfully: {len(data.get('result', {}).get('users', []))} users found")
                    print(f"Users data: {data.get('result', {}).get('users', [])[:5]}")  # Log first 5 users for debugging
                    if data.get('success') and data.get('result'):
                        users = data['result'].get('users', [])
                        
                        # Find user by ID
                        for user in users:
                            if user.get('clientId') == user_id:
                                print(f"[SUCCESS] Found user: {user.get('userEmail', 'N/A')}")
                                return user
                        
                        raise Exception(f"User with ID {user_id} not found")
                    else:
                        error_msg = data.get('exception', 'Failed to get users')
                        raise Exception(f"Get users failed: {error_msg}")
                else:
                    raise Exception(f"HTTP Error {response.status}")
                    
        except Exception as e:
            print(f"[ERROR] Get user error: {e}")
            raise
        
        
    async def get_fertilizer_inputs(self, catalog_id: int) -> List[Dict[str, Any]]:
        """
        Fetch FertilizerInput data which contains pricing information
        """
        if not self.auth_token:
            raise Exception("Authentication required")

        print(f"[FETCH] Fetching fertilizer inputs with pricing for catalog {catalog_id}...")
        
        url = f"{self.base_url}/FertilizerInput"
        params = {'CatalogId': catalog_id}

        try:
            async with self.session.get(url, params=params, headers=self.headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    fertilizer_inputs = data.get('result', {}).get('fertilizerInputs', [])
                    
                    if fertilizer_inputs:
                        print(f"[SUCCESS] Found {len(fertilizer_inputs)} fertilizer inputs with pricing")
                        # Log some price samples
                        for input_data in fertilizer_inputs[:5]:  # Show first 5
                            name = input_data.get('name', 'Unknown')
                            price = input_data.get('price', None)
                            print(f"  {name}: ₡{price} (sample)")
                        return fertilizer_inputs
                    else:
                        print(f"[WARNING] No fertilizer inputs found for catalog {catalog_id}")
                        return []
                        
                else:
                    error_text = await response.text()
                    print(f"[WARNING] Fertilizer inputs fetch failed: HTTP {response.status}")
                    return []
                    
        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error fetching fertilizer inputs: {e}")
            return []
        
    async def get_fertilizers(self, catalog_id: int, include_inactives: bool = False) -> List[Dict[str, Any]]:
            """
            Get all fertilizers from the specified catalog
            """
            if not self.auth_token:
                raise Exception("Authentication required - please login first")

            print(f"[FETCH] Fetching fertilizers from catalog {catalog_id}...")
            
            url = f"{self.base_url}/Fertilizer"
            params = {
                'CatalogId': catalog_id,
                'IncludeInactives': 'true' if include_inactives else 'false'
            }

            try:
                async with self.session.get(url, params=params, headers=self.headers, timeout=30) as response:
                    if response.status == 200:
                        data = await response.json()
                        fertilizers = data.get('result', {}).get('fertilizers', [])
                        
                        print(f"[SUCCESS] Found {len(fertilizers)} fertilizers")
                        
                        # Log first few fertilizer names for verification
                        for i, fert in enumerate(fertilizers[:5]):
                            print(f"  {i+1}. {fert.get('name', 'Unknown')} (ID: {fert.get('id', 'N/A')})")
                        
                        if len(fertilizers) > 5:
                            print(f"  ... and {len(fertilizers) - 5} more")
                        
                        return fertilizers
                        
                    elif response.status == 401:
                        print(f"[ERROR] Authentication failed - token may have expired")
                        raise Exception("Authentication failed - token may have expired")
                        
                    else:
                        error_text = await response.text()
                        print(f"[ERROR] HTTP {response.status}: {error_text[:300]}")
                        raise Exception(f"Failed to fetch fertilizers: HTTP {response.status}")
                        
            except aiohttp.ClientError as e:
                print(f"[ERROR] Network error fetching fertilizers: {e}")
                raise Exception(f"Network error: {e}")

    async def get_crop_phase_requirements(self, phase_id: int) -> Optional[Dict[str, Any]]:
        """
        Get crop phase solution requirements
        """
        if not self.auth_token:
            raise Exception("Authentication required")

        print(f"[FETCH] Fetching crop phase requirements for phase {phase_id}...")
        
        url = f"{self.base_url}/CropPhaseSolutionRequirement"
        params = {'PhaseId': phase_id}

        try:
            async with self.session.get(url, params=params, headers=self.headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    requirements = data.get('result', {}).get('cropPhaseSolutionRequirement')
                    
                    if requirements:
                        print(f"[SUCCESS] Found crop requirements")
                        # Log some key requirements
                        for key in ['n', 'p', 'k', 'ca', 'mg']:
                            if key in requirements:
                                print(f"  {key.upper()}: {requirements[key]} mg/L")
                        return requirements
                    else:
                        print(f"[WARNING]  No requirements found for phase {phase_id}")
                        return None
                        
                else:
                    error_text = await response.text()
                    print(f"[WARNING]  Requirements fetch failed: HTTP {response.status}")
                    return None
                    
        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error fetching requirements: {e}")
            return None

    async def get_water_chemistry(self, water_id: int, catalog_id: int) -> Optional[Dict[str, Any]]:
        """
        Get water chemistry analysis
        """
        if not self.auth_token:
            raise Exception("Authentication required")

        print(f"[FETCH] Fetching water chemistry for water {water_id}...")
        
        url = f"{self.base_url}/WaterChemistry"
        params = {
            'WaterId': water_id,
            'CatalogId': catalog_id
        }

        try:
            async with self.session.get(url, params=params, headers=self.headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()
                    water_list = data.get('result', {}).get('waterChemistries', [])
                    
                    if water_list:
                        water_data = water_list[0]
                        print(f"[SUCCESS] Found water analysis")
                        # Log some key parameters
                        for key in ['ca', 'k', 'mg', 'nO3', 'sO4']:
                            if key in water_data:
                                print(f"  {key}: {water_data[key]} mg/L")
                        return water_data
                    else:
                        print(f"[WARNING]  No water analysis found for water {water_id}")
                        return None
                        
                else:
                    error_text = await response.text()
                    print(f"[WARNING]  Water analysis fetch failed: HTTP {response.status}")
                    return None
                    
        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error fetching water analysis: {e}")
            return None

    def map_swagger_fertilizer_to_model(self, swagger_fert: Dict[str, Any], chemistry: Optional[Dict[str, Any]] = None) -> Fertilizer:
        """
        Convert Swagger fertilizer data to our Fertilizer model with intelligent composition mapping
        """
        name = swagger_fert.get('name', 'Unknown')
        print(f"    [PROCESS] Mapping fertilizer: {name}")

        # Get chemistry data or use defaults
        if chemistry is None:
            chemistry = {
                'formula': name,
                'purity': 98.0,
                'density': 1.0,
                'solubility20': 100.0,
                'isPhAdjuster': False
            }

        # Extract basic properties
        formula = chemistry.get('formula', name)
        purity = float(chemistry.get('purity', 98.0))
        density = float(chemistry.get('density', 1.0))
        solubility = float(chemistry.get('solubility20', 100.0))
        is_ph_adjuster = bool(chemistry.get('isPhAdjuster', False))

        print(f"      Formula: {formula}")
        print(f"      Purity: {purity}%")
        print(f"      Density: {density}")

        # Get composition from our database using intelligent matching
        composition_data = self.fertilizer_db.find_fertilizer_composition(name, formula)

        if composition_data:
            cations = composition_data['cations'].copy()
            anions = composition_data['anions'].copy()
            molecular_weight = composition_data['mw']
            print(f"      [SUCCESS] Found in database: {composition_data['formula']}")
            
            # Calculate total content for verification
            total_content = sum(cations.values()) + sum(anions.values())
            print(f"      Total content: {total_content:.1f}%")
            
        else:
            # Create default empty composition with all required elements
            cations = {
                'Ca': 0.0, 'K': 0.0, 'Mg': 0.0, 'Na': 0.0, 'NH4': 0.0,
                'Fe': 0.0, 'Mn': 0.0, 'Zn': 0.0, 'Cu': 0.0
            }
            anions = {
                'N': 0.0, 'S': 0.0, 'Cl': 0.0, 'P': 0.0, 'HCO3': 0.0,
                'B': 0.0, 'Mo': 0.0
            }
            molecular_weight = 100.0
            print(f"      [WARNING]  Not found in database, using defaults")

        # Validate and clean values
        if molecular_weight <= 0:
            molecular_weight = 100.0
        if purity <= 0 or purity > 100:
            purity = 98.0
        if density <= 0:
            density = 1.0
        if solubility < 0:
            solubility = 100.0

        # Create Fertilizer object
        fertilizer = Fertilizer(
            name=name,
            percentage=purity,
            molecular_weight=molecular_weight,
            salt_weight=molecular_weight,
            density=density,
            chemistry=FertilizerChemistry(
                formula=formula,
                purity=purity,
                solubility=solubility,
                is_ph_adjuster=is_ph_adjuster
            ),
            composition=FertilizerComposition(
                cations=cations,
                anions=anions
            )
        )

        # Log main nutrients for verification
        main_nutrients = []
        for elem, content in cations.items():
            if content > 1:
                main_nutrients.append(f"{elem}:{content:.1f}%")
        for elem, content in anions.items():
            if content > 1:
                main_nutrients.append(f"{elem}:{content:.1f}%")
        
        if main_nutrients:
            print(f"      Main nutrients: {', '.join(main_nutrients)}")
        else:
            print(f"      [WARNING]  No significant nutrients found")

        return fertilizer

    def map_requirements_to_targets(self, requirements_data: Optional[Dict]) -> Dict[str, float]:
        """
        Map API requirements format to calculator target concentrations.
        
        Args:
            requirements_data: API requirements data (can be None)
            
        Returns:
            Dictionary of target concentrations in ppm
        """
        targets = {}
        
        # Handle None or empty requirements
        if not requirements_data:
            print("[WARNING] No requirements data provided, returning empty targets")
            return targets
        
        # Handle case where requirements_data is not a dictionary
        if not isinstance(requirements_data, dict):
            print(f"[WARNING] Requirements data is not a dictionary: {type(requirements_data)}")
            return targets
        
        # API field name to calculator nutrient mapping
        nutrient_mapping = {
            'nitrogen': 'N',
            'phosphorus': 'P', 
            'potassium': 'K',
            'calcium': 'Ca',
            'magnesium': 'Mg',
            'sulfur': 'S',
            'iron': 'Fe',
            'manganese': 'Mn',
            'zinc': 'Zn',
            'copper': 'Cu',
            'boron': 'B',
            'molybdenum': 'Mo',
            'chlorine': 'Cl',
            'sodium': 'Na'
        }
        
        for api_field, calc_nutrient in nutrient_mapping.items():
            if api_field in requirements_data:
                value = requirements_data[api_field]
                if value is not None and value > 0:
                    targets[calc_nutrient] = float(value)
                    print(f"  [TARGET] {calc_nutrient}: {value} ppm")
        
        if not targets:
            print("[WARNING] No valid nutrient targets found in requirements data")
        
        return targets

    def map_water_to_analysis(self, water_data):
        """Map API water data to our analysis format with null safety"""
        
        # Initialize with default empty analysis
        analysis = {}
        
        # Check if water_data exists and is not None
        if not water_data:
            print("[WARNING] No water analysis data found - using default values")
            return analysis
        
        # Element mapping from API fields to our analysis fields
        element_mapping = {
            'no3': 'NO3',
            'po4': 'PO4', 
            'k': 'K',
            'ca': 'Ca',
            'mg': 'Mg',
            'na': 'Na',
            'cl': 'Cl',
            'sul': 'SO4',
            'sO4': 'SO4',  # Alternative field name
            'bO4': 'BO4',
            'bo4': 'BO4',  # Alternative field name
            'nh4': 'NH4',
            'nH4': 'NH4',  # Alternative field name
            'hco3': 'HCO3',
            'hcO3': 'HCO3',  # Alternative field name
            'nO3': 'NO3',   # Alternative field name
            'h2PO4': 'H2PO4',
            'h2po4': 'H2PO4',  # Alternative field name
            'moO4': 'MoO4',
            'fe': 'Fe',
            'b': 'B',
            'cu': 'Cu',
            'zn': 'Zn',
            'mn': 'Mn',
            'mo': 'Mo',
            'pH': 'pH',
            'ph': 'pH',  # Alternative field name
            'phLevel': 'pH',  # Alternative field name
            'ec': 'EC',
            'ecLevel': 'EC',  # Alternative field name
            'tdsLevel': 'TDS',
            'temperature': 'Temperature',
            'oxygenLevel': 'DO'  # Dissolved oxygen
        }
        
        print(f"[FETCH] Mapping water analysis...")
        
        # Ensure water_data is a dictionary
        water = water_data
        if isinstance(water_data, list) and len(water_data) > 0:
            water = water_data[0]  # Take first item if it's a list
        
        # Additional null check after potential list extraction
        if not water or not isinstance(water, dict):
            print("[WARNING] Invalid water analysis data format - using default values")
            return analysis
        
        # Map the fields safely
        mapped_count = 0
        for api_field, our_field in element_mapping.items():
            # Safe check for field existence
            if api_field in water:
                value = water.get(api_field)  # Use .get() for additional safety
                if value is not None and value >= 0:
                    analysis[our_field] = float(value)
                    print(f"  {our_field}: {value} mg/L")
                    mapped_count += 1
        
        if mapped_count == 0:
            print("[WARNING] No valid water analysis parameters found")
        else:
            print(f"[SUCCESS] Mapped {mapped_count} water analysis parameters")
        
        return analysis
    
    async def test_connection(self) -> bool:
        """
        Test connection to the Swagger API
        """
        print(f"[TEST] Testing connection to {self.base_url}...")
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            # Try a simple endpoint that doesn't require authentication
            async with self.session.get(f"{self.base_url}/health", timeout=10) as response:
                if response.status == 200:
                    print(f"[SUCCESS] API connection successful")
                    return True
                else:
                    print(f"[WARNING]  API responded with status {response.status}")
                    return False
                    
        except aiohttp.ClientError as e:
            print(f"[ERROR] Connection failed: {e}")
            return False
        except Exception as e:
            print(f"[ERROR] Connection test error: {e}")
            return False

# Helper functions for standalone usage
async def test_swagger_integration():
    """
    Test function to verify Swagger integration works
    """
    print("[TEST] Testing Swagger API Integration...")
    
    try:
        async with SwaggerAPIClient("https://agrismart-agronomic-latest.onrender.com") as client:
            # Test connection
            if not await client.test_connection():
                print("[ERROR] Connection test failed")
                return False
            
            # Test authentication
            login_result = await client.login("csolano@iapcr.com", "123")
            if not login_result.get('success'):
                print("[ERROR] Authentication test failed")
                return False
                
            # Test data fetching
            fertilizers = await client.get_fertilizers(1)
            if not fertilizers:
                print("[ERROR] Fertilizer fetch test failed")
                return False
                
            print(f"[SUCCESS] Integration test successful!")
            print(f"   - Fetched {len(fertilizers)} fertilizers")
            print(f"   - Authentication working")
            print(f"   - API connection stable")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Integration test failed: {e}")
        return False

if __name__ == "__main__":
    # Run test if executed directly
    asyncio.run(test_swagger_integration())