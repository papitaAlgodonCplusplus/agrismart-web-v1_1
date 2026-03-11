In my nutrient-formulation component, using my python-api, I did a calculation based on cropPhaseRequierements id = 6 "Ayote (Squash) - Pico producción (Peak fruit production)",
but, the api manages to get accurate target vs obtained values:

Parámetro	Objetivo	Logrado	Desviación %	Estado	Info
K	265.30	308.30	16.21%	Aceptable	
Ca	171.80	207.80	20.95%	Aceptable	
Mg	32.80	86.80	164.63%	Crítico	
Fe	3.00	23.00	666.67%	Crítico	
B	0.45	10.45	2222.22%	Crítico	
Cu	0.05	4.05	8000.00%	Crítico	
Zn	0.35	8.35	2285.71%	Crítico	
Mn	0.80	4.80	500.00%	Crítico	
N	105.50	105.50	0.00%	Óptimo	
P	58.80	58.80	0.00%	Óptimo	
S	42.60	42.60	0.00%	Óptimo	
Mo	0.08	0.08	0.00%	Óptimo	

except, the water analysis (that I included on the analysis), makes those over 1000% deviations, however, I need to enhance my python api calculator, specifically when it encounters water chemistry values, to adjust the water L values to reduce the water-apported micro/macro nutrients, to avoid those huge deviations.

For example, for B, we obtained 0.45, throught the fertilizers, but the water used has 10.00 mg/L of B, and if we are using 1 L of water, that adds 10.00 mg of B, which is a huge contribution compared to the target of 0.45 mg/L.

So the api, when it encounters water chemistry values, should adjust the water L values to reduce the water-apported micro/macro nutrients, to avoid those huge deviations.

Now, this is assuming adjusting L values of water changes the amount of nutrients contributed by the water, which is a common practice in hydroponic nutrient management. If that's not the case, let me know what a better approach would be to handle the water chemistry contributions in the nutrient calculation.

If for example then, api reduced water L values to 0.045 L, then the contribution of B from water would be 0.45 mg (10.00 mg/L * 0.045 L), which would align with the target of 0.45 mg/L when combined with the fertilizer contributions, by setting the fertilizers B target to 0 mg/L, since the water is already providing the necessary B.

Example phases in the DB:

-- ============================================================
-- CORRECTIVE UPDATE: Nutrient solution values
-- Units assumed: mg/L (ppm) for all ions
--                mS/cm for EC
-- ============================================================

-- -------------------------------------------------------
-- Record 2: Kale - Crecimiento (Growth/Vegetative phase)
-- Leafy green: high N, moderate K, good Ca/Mg
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 1.8,
    pH      = 6.0,
    HCO3    = 20.00,
    NO3     = 180.00,   -- High N for leafy growth
    H2PO4   = 60.00,
    SO4     = 80.00,
    Cl      = 15.00,
    NH4     = 10.00,
    K       = 200.00,
    Ca      = 160.00,
    Mg      = 50.00,
    Na      = 10.00,
    Fe      = 3.00,
    B       = 0.50,
    Cu      = 0.05,
    Zn      = 0.30,
    Mn      = 0.80,
    Mo      = 0.08,
    DateUpdated = GETDATE()
WHERE Id = 2;

-- -------------------------------------------------------
-- Record 3: Kale - Establecimiento (Establishment/Seedling)
-- Lower EC, lower nutrients — young plants can't handle full strength
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 1.2,
    pH      = 6.0,
    HCO3    = 15.00,
    NO3     = 120.00,
    H2PO4   = 50.00,
    SO4     = 60.00,
    Cl      = 10.00,
    NH4     = 5.00,     -- Low NH4 for seedlings (sensitive)
    K       = 150.00,
    Ca      = 130.00,
    Mg      = 40.00,
    Na      = 5.00,
    Fe      = 2.00,
    B       = 0.30,
    Cu      = 0.02,
    Zn      = 0.20,
    Mn      = 0.50,
    Mo      = 0.05,
    DateUpdated = GETDATE()
WHERE Id = 3;

-- -------------------------------------------------------
-- Record 4: Melón (Melon) - Fase 1 (Early vegetative)
-- Fruiting crop: balanced early, build K/Ca for later fruit set
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 2.0,
    pH      = 6.0,
    HCO3    = 15.00,
    NO3     = 170.00,
    H2PO4   = 55.00,
    SO4     = 80.00,
    Cl      = 15.00,
    NH4     = 8.00,
    K       = 220.00,
    Ca      = 180.00,
    Mg      = 50.00,
    Na      = 10.00,
    Fe      = 3.00,
    B       = 0.40,
    Cu      = 0.04,
    Zn      = 0.30,
    Mn      = 0.60,
    Mo      = 0.07,
    DateUpdated = GETDATE()
WHERE Id = 4;

-- -------------------------------------------------------
-- Record 5: Ayote (Squash) - Formación de planta
-- Plant formation: moderate N, good Ca for structural growth
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 1.8,
    pH      = 6.0,
    HCO3    = 20.00,
    NO3     = 160.00,
    H2PO4   = 55.00,
    SO4     = 75.00,
    Cl      = 15.00,
    NH4     = 8.00,
    K       = 180.00,
    Ca      = 160.00,
    Mg      = 50.00,
    Na      = 8.00,
    Fe      = 3.00,
    B       = 0.40,
    Cu      = 0.04,
    Zn      = 0.30,
    Mn      = 0.70,
    Mo      = 0.07,
    DateUpdated = GETDATE()
WHERE Id = 5;

-- -------------------------------------------------------
-- Record 6: Gerbera - Simple (Full cycle ornamental)
-- Flowering ornamental: moderate N, higher K for blooms
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 1.6,
    pH      = 5.8,     -- Slightly more acidic suits Gerbera
    HCO3    = 10.00,
    NO3     = 130.00,
    H2PO4   = 45.00,
    SO4     = 65.00,
    Cl      = 10.00,
    NH4     = 5.00,
    K       = 230.00,  -- High K promotes flowering
    Ca      = 140.00,
    Mg      = 45.00,
    Na      = 8.00,
    Fe      = 4.00,    -- Slightly higher Fe for ornamentals
    B       = 0.35,
    Cu      = 0.04,
    Zn      = 0.25,
    Mn      = 0.60,
    Mo      = 0.06,
    DateUpdated = GETDATE()
WHERE Id = 6;

-- -------------------------------------------------------
-- Record 7: Ayote (Squash) - Pico producción (Peak fruit production)
-- Peak fruiting: reduce N, maximize K and Ca for fruit quality
-- -------------------------------------------------------
UPDATE CropPhaseSolutionRequirement
SET
    EC      = 2.2,
    pH      = 6.2,
    HCO3    = 15.00,
    NO3     = 150.00,  -- Reduce N at fruiting to avoid vegetative overgrowth
    H2PO4   = 60.00,
    SO4     = 90.00,
    Cl      = 15.00,
    NH4     = 5.00,
    K       = 280.00,  -- High K at peak fruiting
    Ca      = 200.00,  -- High Ca prevents blossom-end rot
    Mg      = 55.00,
    Na      = 8.00,
    Fe      = 3.00,
    B       = 0.45,
    Cu      = 0.05,
    Zn      = 0.35,
    Mn      = 0.80,
    Mo      = 0.08,
    DateUpdated = GETDATE()
WHERE Id = 7; 


example waters:

select * from WaterChemistry	

Id	WaterId	Ca	K	Mg	Na	NH4	Fe	Cu	Mn	Zn	NO3	SO4	Cl	B	H2PO4	HCO3	BO4	MOO4	EC	pH	AnalysisDate	Active	DateCreated	DateUpdated	CreatedBy	UpdatedBy
2	1	10,15	2,6	4,8	9,4	0	0	0,1	0	0,1	1,4	0	1,2	0	0	77	0	0,01	0,15	7	2022-12-08	1	2024-09-13 10:59:19.757	2025-10-12 17:25:16.700	1	12
17	12	11,03	2,5	4,7	9,8	0	0	0,15	0	0,12	1,5	0	1,3	0	0	78	0	0,02	0,15	7	2022-12-09	1	2025-10-01 11:14:15.533	2025-11-18 21:43:35.167	8	6
19	13	36	43	54	25	0	20	4	4	8	0	0	72	10	0	0	0	0	46	0	1992-01-24	1	2025-11-07 20:18:18.663	NULL	6	NULL
20	14	59	85	87	37	0	10	2	4	3	0	0	13	10	0	0	0	0	10	0	2021-01-27	1	2025-11-18 21:23:20.847	NULL	6	NULL