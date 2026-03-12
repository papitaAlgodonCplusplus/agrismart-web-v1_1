-- Fertilizer composition update: replace random junk values with correct chemical composition %.
-- Fields updated: Ca, K, Mg, Na, nH4, N, sO4, S, Cl, h2PO4, P, hcO3, Fe, Mn, Zn, Cu, B, Mo
-- Values sourced from fertilizer_database.py (molecular-formula-derived %).
-- NitrogenPercentage / PhosphorusPercentage / PotassiumPercentage (label values) are NOT changed.

-- Acido Nítrico DAC — HNO3: N=22.23%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=22.23, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Acido Nítrico DAC';

-- Acido Fosfórico — H3PO4: P=31.61%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=31.61, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Acido Fosfórico';

-- Acido Sulfurico — H2SO4: S=32.69%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=32.69, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Acido Sulfurico';

-- Nitrato de amonio — NH4NO3: NH4=22.5%, N=35.0%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=22.5, N=35.0, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name LIKE 'Nitrato de amonio%';

-- Sulfato de amonio — (NH4)2SO4: NH4=27.28%, N=21.21%, S=24.26%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=27.28, N=21.21, sO4=0, S=24.26, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de amonio';

-- Nitrato de calcio — Ca(NO3)2·4H2O: Ca=16.97%, N=11.86%
UPDATE Fertilizer SET Ca=16.97, K=0, Mg=0, Na=0, nH4=0, N=11.86, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Nitrato de calcio';

-- Nitrato de calcio amoniacal — CAN (Ca(NO3)2 + NH4NO3): Ca=16.97%, N=11.86%, NH4=5.0% (estimate)
UPDATE Fertilizer SET Ca=16.97, K=0, Mg=0, Na=0, nH4=5.0, N=11.86, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Nitrato de calcio amoniacal';

-- Nitrato de potasio — KNO3: K=38.67%, N=13.85%
UPDATE Fertilizer SET Ca=0, K=38.67, Mg=0, Na=0, nH4=0, N=13.85, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Nitrato de potasio';

-- Nitrato de magnesio — Mg(NO3)2·6H2O: Mg=9.48%, N=10.93%
UPDATE Fertilizer SET Ca=0, K=0, Mg=9.48, Na=0, nH4=0, N=10.93, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Nitrato de magnesio';

-- Fosfato monoamonico (MAP) — NH4H2PO4: NH4=15.65%, N=12.18%, P=26.93%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=15.65, N=12.18, sO4=0, S=0, Cl=0, h2PO4=0, P=26.93, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Fosfato monoamonico (MAP)';

-- Fosfato diamónico (DAP) — (NH4)2HPO4: NH4=27.28%, N=21.22%, P=23.47%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=27.28, N=21.22, sO4=0, S=0, Cl=0, h2PO4=0, P=23.47, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Fosfato diamónico (DAP)';

-- Fosfato monopotásico — KH2PO4: K=28.73%, P=22.76%
UPDATE Fertilizer SET Ca=0, K=28.73, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=22.76, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Fosfato monopotásico';

-- Fosfato bipotásico — K2HPO4: K=44.93%, P=17.79%
UPDATE Fertilizer SET Ca=0, K=44.93, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=17.79, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Fosfato bipotásico';

-- Triple superfosfato — Ca(H2PO4)2·H2O: Ca=14.0%, P=46.0% (standard industry values)
UPDATE Fertilizer SET Ca=14.0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=46.0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Triple superfosfato';

-- Cloruro de Potasio — KCl: K=52.44%, Cl=47.56%
UPDATE Fertilizer SET Ca=0, K=52.44, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=47.56, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Cloruro de Potasio';

-- Sulfato de potasio — K2SO4: K=44.87%, S=18.39%
UPDATE Fertilizer SET Ca=0, K=44.87, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=18.39, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de potasio';

-- Sulfato de magnesio — MgSO4·7H2O: Mg=9.87%, S=13.01%
UPDATE Fertilizer SET Ca=0, K=0, Mg=9.87, Na=0, nH4=0, N=0, sO4=0, S=13.01, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de magnesio';

-- Cloruro de magnesio — MgCl2·6H2O: Mg=11.96%, Cl=34.87%
UPDATE Fertilizer SET Ca=0, K=0, Mg=11.96, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=34.87, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Cloruro de magnesio';

-- Cloruro de calcio — CaCl2·2H2O: Ca=27.26%, Cl=48.23%
UPDATE Fertilizer SET Ca=27.26, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=48.23, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Cloruro de calcio';

-- Cloruro de sodio — NaCl: Na=39.34%, Cl=60.66%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=39.34, nH4=0, N=0, sO4=0, S=0, Cl=60.66, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Cloruro de sodio';

-- Sulfato de hierro — FeSO4·7H2O: Fe=20.09%, S=11.53%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=11.53, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=20.09, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de hierro';

-- Cloruro de hierro — FeCl3·6H2O: Fe=20.66%, Cl=39.35%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=39.35, h2PO4=0, P=0, hcO3=0, Fe=20.66, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Cloruro de hierro';

-- Sulfato de cobre (acidif) — CuSO4·5H2O: Cu=25.45%, S=12.84%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=12.84, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=25.45, B=0, Mo=0 WHERE Name = 'Sulfato de cobre (acidif)';

-- Sulfato de manganeso — MnSO4·4H2O: Mn=24.63%, S=14.37%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=14.37, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=24.63, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de manganeso';

-- Sulfato de zinc — ZnSO4·7H2O: Zn=22.74%, S=11.15%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=11.15, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=22.74, Cu=0, B=0, Mo=0 WHERE Name = 'Sulfato de zinc';

-- Acido bórico — H3BO3: B=17.48%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=17.48, Mo=0 WHERE Name = 'Acido bórico';

-- Solucion al 35% Molibdato de Sodio — Na2MoO4·2H2O: Na=19.01%, Mo=39.66%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=19.01, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=39.66 WHERE Name = 'Solucion al 35% Molibdato de Sodio';

-- Molibdato de amonio — (NH4)6Mo7O24·4H2O: NH4=8.78%, N=6.82%, Mo=54.34%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=8.78, N=6.82, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=54.34 WHERE Name = 'Molibdato de amonio';

-- Quelato de hierro — Fe-EDTA: Fe=13.0%, N=7.63%, Na=6.27%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=6.27, nH4=0, N=7.63, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=13.0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Quelato de hierro';

-- Quelato de cobre — CuEDTA: Cu=18.28%, N=8.06%, Na=6.62%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=6.62, nH4=0, N=8.06, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=18.28, B=0, Mo=0 WHERE Name = 'Quelato de cobre';

-- Quelato de manganeso — MnEDTA: Mn=15.92%, N=8.12%, Na=6.67%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=6.67, nH4=0, N=8.12, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=15.92, Zn=0, Cu=0, B=0, Mo=0 WHERE Name = 'Quelato de manganeso';

-- Quelato de zinc — ZnEDTA: Zn=18.60%, N=7.97%, Na=6.54%
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=6.54, nH4=0, N=7.97, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=18.60, Cu=0, B=0, Mo=0 WHERE Name = 'Quelato de zinc';

-- abc, test, Vel impedit in in q, Castor Gilliam — unknown: all zeros
UPDATE Fertilizer SET Ca=0, K=0, Mg=0, Na=0, nH4=0, N=0, sO4=0, S=0, Cl=0, h2PO4=0, P=0, hcO3=0, Fe=0, Mn=0, Zn=0, Cu=0, B=0, Mo=0 WHERE Name IN ('abc', 'test', 'Vel impedit in in q', 'Castor Gilliam');
