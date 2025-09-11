# API Testing Guide

This document provides sample API calls to test the Python API after running `main_api.py`.

## Server Information
- **Base URL**: `http://localhost:8000` (or next available port: 8001, 8002, etc.)
- **Documentation**: `http://localhost:8000/docs`
- **Interactive Testing**: Use FastAPI's built-in Swagger UI at `/docs`


Example API calls for the new constrained endpoint:

1. Basic constraint (limit Cloruro de calcio to max 500g per 1000L):
http://localhost:8000/swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.5}}

2. Multiple constraints with minimum requirements:
http://localhost:8000/swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.5,"min":0.1},"Sulfato de potasio":{"max":2.0}}

3. High priority constraints (strict enforcement):
http://localhost:8000/swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.5}}&constraint_priority=high

4. Allow poor targeting to respect constraints:
http://localhost:8000/swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.3}}&ignore_target_deviations=true

5. Complex multi-fertilizer constraints:
http://localhost:8000/swagger-integrated-calculation-with-constraints?fertilizer_constraints={"Cloruro de calcio":{"max":0.5,"min":0.1},"Sulfato de potasio":{"max":1.5},"Nitrato de potasio":{"max":3.0,"min":0.5}}&constraint_priority=absolute

## Quick Test Endpoints

## Favorite

http://localhost:8000/swagger-integrated-calculation?user_id=1&catalog_id=1&phase_id=1&water_id=1&volume_liters=1000&use_ml=true&apply_safety_caps=true&strict_caps=true

### 1. Health Check
```bash
GET http://localhost:8000/
```
Returns API information, version, and available endpoints.

### 2. System Test
```bash
GET http://localhost:8000/test
```
Comprehensive test of all system components with sample fertilizers.

## Main Calculation Endpoints

### 3. Simple Calculation
```bash
POST http://localhost:8000/calculate-simple
Content-Type: application/json

{
  "fertilizers": [
    {
      "name": "Nitrato de Calcio",
      "composition": {
        "cations": {"Ca": 19.0, "NH4": 1.1},
        "anions": {"N": 15.5}
      },
      "percentage": 100.0,
      "molecular_weight": 164.1,
      "density": 1.2
    }
  ],
  "target_concentrations": {
    "N": 150,
    "P": 40, 
    "K": 200,
    "Ca": 180,
    "Mg": 50,
    "S": 80
  },
  "water_analysis": {
    "Ca": 20,
    "K": 5,
    "N": 2,
    "P": 1,
    "Mg": 8,
    "S": 5
  },
  "calculation_settings": {
    "volume_liters": 1000,
    "precision": 3,
    "units": "mg/L",
    "crop_phase": "Growth"
  }
}
```

### 4. Advanced Calculation (with method selection)
```bash
POST http://localhost:8000/calculate-advanced?method=deterministic
Content-Type: application/json

# Same JSON body as simple calculation
# Available methods: deterministic, linear_algebra, machine_learning
```

### 5. Machine Learning Calculation
```bash
POST http://localhost:8000/calculate-ml
Content-Type: application/json

# Same JSON body as simple calculation
```

## Swagger API Integration

### 6. Real API Integration Test
```bash
GET http://localhost:8000/swagger-integrated-calculation?catalog_id=1&phase_id=1&water_id=1&volume_liters=1000&use_ml=false
```

Parameters:
- `catalog_id`: Fertilizer catalog ID (default: 1)
- `phase_id`: Crop phase ID (default: 1) 
- `water_id`: Water analysis ID (default: 1)
- `volume_liters`: Solution volume (default: 1000)
- `use_ml`: Use machine learning method (default: false)
- `use_linear_algebra`: Use linear algebra method (default: false)

## Machine Learning Endpoints

### 7. Train ML Model
```bash
POST http://localhost:8000/train-ml-model?n_samples=5000&model_type=RandomForest
```

Parameters:
- `n_samples`: Number of training samples (default: 5000)
- `model_type`: ML model type - RandomForest or XGBoost (default: RandomForest)

### 8. Compare Optimization Methods
```bash
GET http://localhost:8000/test-optimization-methods?target_N=150&target_P=40&target_K=200&target_Ca=180&target_Mg=50&target_S=80
```

Tests and compares all three optimization methods with custom targets.

## Database Endpoints

### 9. Fertilizer Database Info
```bash
GET http://localhost:8000/fertilizer-database
```

Returns complete fertilizer database information with all available fertilizers.

### 10. Search Fertilizers by Element
```bash
GET http://localhost:8000/fertilizers-containing/N?min_content=10.0
```

Find fertilizers containing specific element above minimum content percentage.

Available elements: N, P, K, Ca, Mg, S, Fe, Mn, Zn, Cu, B, Mo, Cl, Na, NH4

## Sample cURL Commands

### Basic Health Check
```bash
curl -X GET "http://localhost:8000/"
```

### System Test
```bash
curl -X GET "http://localhost:8000/test"
```

### Simple Calculation with Minimal Data
```bash
curl -X POST "http://localhost:8000/calculate-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "fertilizers": [
      {
        "name": "Test Fertilizer",
        "composition": {
          "cations": {"K": 39.0},
          "anions": {"N": 13.0}
        },
        "percentage": 100.0,
        "molecular_weight": 101.1,
        "density": 1.0
      }
    ],
    "target_concentrations": {"N": 150, "K": 200},
    "water_analysis": {"N": 5, "K": 10},
    "calculation_settings": {
      "volume_liters": 1000,
      "precision": 3,
      "units": "mg/L",
      "crop_phase": "Test"
    }
  }'
```

### Swagger Integration Test
```bash
curl -X GET "http://localhost:8000/swagger-integrated-calculation?catalog_id=1&phase_id=1&water_id=1"
```

### ML Model Training
```bash
curl -X POST "http://localhost:8000/train-ml-model?n_samples=2000&model_type=RandomForest"
```

## Expected Responses

All endpoints return JSON responses with:
- **Success responses**: Include calculation results, dosages, verification data, and PDF report information
- **Error responses**: Include error details and HTTP status codes (400, 404, 500)

## PDF Reports

Successful calculations generate PDF reports in the `./reports/` directory with names like:
- `simple_report_YYYYMMDD_HHMMSS.pdf`
- `advanced_report_deterministic_YYYYMMDD_HHMMSS.pdf`
- `swagger_integration_deterministic_YYYYMMDD_HHMMSS.pdf`

## Testing Tips

1. **Start with health check**: `GET /` to verify API is running
2. **Run system test**: `GET /test` to verify all components work
3. **Test simple calculation**: Use minimal fertilizer data first
4. **Try Swagger integration**: Tests real API connectivity
5. **Train ML model**: Required before using ML-based calculations
6. **Check logs**: Monitor console output for detailed calculation steps

## Common Issues

- **Port conflicts**: API automatically finds available port (8000-8005)
- **ML not trained**: Train model first using `/train-ml-model` endpoint
- **PDF generation**: Reports are saved to `./reports/` directory
- **Swagger API**: External API at `http://162.248.52.111:8082` may have connectivity issues

## Documentation

Access interactive API documentation at `http://localhost:8000/docs` for detailed schemas and testing interface.