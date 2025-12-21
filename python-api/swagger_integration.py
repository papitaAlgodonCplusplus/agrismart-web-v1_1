#!/usr/bin/env python3
"""
COMPLETE SWAGGER INTEGRATION MODULE
Real API calls, authentication, and data mapping
"""

import aiohttp
import ssl
import logging
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
        # Create SSL context that doesn't verify certificates for localhost development
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        # Create connector with SSL context
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        self.session = aiohttp.ClientSession(connector=connector)
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
                    requirements = data.get('result', {}).get('cropPhaseRequirements')
                    
                    if requirements:
                        print(f"[SUCCESS] Found crop requirements {requirements}")
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
        Get water chemistry analysis by ID
        """
        if not self.auth_token:
            raise Exception("Authentication required")

        print(f"[FETCH] Fetching water chemistry for water {water_id}...")

        # First, let's see what water chemistries are available
        list_url = f"{self.base_url}/WaterChemistry"
        try:
            async with self.session.get(list_url, headers=self.headers, timeout=10) as list_response:
                if list_response.status == 200:
                    list_data = await list_response.json()
                    water_list = list_data.get('result', {}).get('waterChemistries', [])
                    print(f"[DEBUG] Available water chemistry IDs: {[w.get('id') for w in water_list]}")
        except Exception as e:
            print(f"[DEBUG] Could not list water chemistries: {e}")

        # Use the GET by ID endpoint: /WaterChemistry/{Id}
        url = f"{self.base_url}/WaterChemistry/{water_id}"

        try:
            async with self.session.get(url, headers=self.headers, timeout=15) as response:
                if response.status == 200:
                    data = await response.json()

                    if data.get('success') and data.get('result'):
                        water_data = data['result'].get('waterChemistry')
                        if water_data:
                            print(f"[SUCCESS] Found water analysis (ID: {water_data.get('id')})")
                            # Log some key parameters
                            for key in ['ca', 'k', 'mg', 'nO3', 'sO4']:
                                if key in water_data:
                                    print(f"  {key}: {water_data[key]} mg/L")
                            return water_data

                    print(f"[WARNING] No water analysis found for water {water_id}")
                    return None

                else:
                    error_text = await response.text()
                    print(f"[WARNING] Water analysis fetch failed: HTTP {response.status}")
                    return None

        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error fetching water analysis: {e}")
            return None

    async def get_soil_analysis(self, crop_production_id: int) -> Optional[Dict[str, Any]]:
        """
        Get soil analysis for a crop production
        Endpoint: GET /CropProduction/{cropProductionId}/SoilAnalysis
        Response: { success, exception, result: { soilAnalyses: [...] } }
        """
        if not self.auth_token:
            raise Exception("Authentication required")

        print(f"[FETCH] Fetching soil analysis for crop production {crop_production_id}...")

        # Use the SoilAnalysis endpoint
        url = f"{self.base_url}/CropProduction/{crop_production_id}/SoilAnalysis"
        params = {'includeInactive': 'false'}  # Get only active soil analyses

        try:
            async with self.session.get(url, params=params, headers=self.headers, timeout=15) as response:
                print(f"[DEBUG] Soil analysis endpoint response status: {response.status}")

                if response.status == 200:
                    data = await response.json()
                    print(f"[DEBUG] Response success: {data.get('success')}, has result: {'result' in data}")

                    if data.get('success') and data.get('result'):
                        # Response structure: result.soilAnalyses (array)
                        soil_analyses = data['result'].get('soilAnalyses', [])
                        print(f"[DEBUG] Found {len(soil_analyses)} soil analyses")

                        if soil_analyses and len(soil_analyses) > 0:
                            # Get the first (most recent) soil analysis
                            soil_analysis = soil_analyses[0]
                            print(f"[SUCCESS] Found soil analysis (ID: {soil_analysis.get('id')}, Sample Date: {soil_analysis.get('sampleDate')})")
                            # Log some key parameters
                            for key in ['phSoil', 'totalNitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium']:
                                if key in soil_analysis and soil_analysis[key] is not None:
                                    value = soil_analysis[key]
                                    unit = "pH" if key == 'phSoil' else "ppm"
                                    print(f"  {key}: {value} {unit}")
                            return soil_analysis
                        else:
                            print(f"[INFO] No soil analyses found for crop production {crop_production_id}")
                            return None

                    print(f"[WARNING] Invalid response structure from soil analysis endpoint")
                    print(f"[DEBUG] Full response: {data}")
                    return None

                elif response.status == 404:
                    print(f"[INFO] No soil analysis available for crop production {crop_production_id}")
                    return None

                else:
                    error_text = await response.text()
                    print(f"[WARNING] Soil analysis fetch failed: HTTP {response.status}")
                    print(f"[DEBUG] Error response: {error_text[:200]}")
                    return None

        except asyncio.TimeoutError:
            print(f"[ERROR] Timeout fetching soil analysis - backend endpoint may be slow or broken")
            return None
        except aiohttp.ClientError as e:
            print(f"[ERROR] Network error fetching soil analysis: {e}")
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
        Map crop phase requirements to target nutrients.
        Handles both dictionary and list response formats.
        """
        try:
            # Handle case where requirements_data is a list
            if isinstance(requirements_data, list):
                if len(requirements_data) == 0:
                    logging.warning("Requirements data is an empty list")
                    return self._get_default_targets()
                # Take the first requirement from the list
                requirements = requirements_data[0]
                logging.info(f"Using first requirement from list: ID {requirements.get('id')}")
            
            # Handle case where requirements_data is a dictionary
            elif isinstance(requirements_data, dict):
                # Check if it has cropPhaseRequirements key
                if 'cropPhaseRequirements' in requirements_data:
                    crop_phase_reqs = requirements_data['cropPhaseRequirements']
                    if not crop_phase_reqs or len(crop_phase_reqs) == 0:
                        logging.warning("CropPhaseRequirements is empty")
                        return self._get_default_targets()
                    requirements = crop_phase_reqs[0]
                else:
                    # The dictionary itself might be the requirement
                    requirements = requirements_data
            
            # Handle None case
            elif requirements_data is None:
                logging.warning("Requirements data is None")
                return self._get_default_targets()
            
            else:
                logging.warning(f"Requirements data is not a dictionary or list: {type(requirements_data)}")
                return self._get_default_targets()

            # Extract nutrient values safely
            targets = {
                'N': float(requirements.get('no3', 0) + requirements.get('nh4', 0)),
                'P': float(requirements.get('h2PO4', 0) or requirements.get('h2po4', 0)),
                'K': float(requirements.get('k', 0)),
                'Ca': float(requirements.get('ca', 0)),
                'Mg': float(requirements.get('mg', 0)),
                'S': float(requirements.get('sO4', 0) or requirements.get('so4', 0)),
                'Fe': float(requirements.get('fe', 0)),
                'Mn': float(requirements.get('mn', 0)),
                'Zn': float(requirements.get('zn', 0)),
                'Cu': float(requirements.get('cu', 0)),
                'B': float(requirements.get('b', 0)),
                'Mo': float(requirements.get('mo', 0))
            }
            
            logging.info(f"Mapped requirements to targets: {targets}")
            return targets

        except Exception as e:
            logging.error(f"Error mapping requirements to targets: {str(e)}")
            logging.error(f"Requirements data: {requirements_data}")
            return self._get_default_targets()


    def _get_default_targets(self) -> Dict[str, float]:
        """Return default nutrient targets when requirements data is unavailable."""
        return {
            'N': 200.0,
            'P': 50.0,
            'K': 300.0,
            'Ca': 150.0,
            'Mg': 50.0,
            'S': 100.0,
            'Fe': 3.0,
            'Mn': 0.5,
            'Zn': 0.3,
            'Cu': 0.05,
            'B': 0.3,
            'Mo': 0.05
        }

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
        async with SwaggerAPIClient("http://163.178.171.144:80/") as client:
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