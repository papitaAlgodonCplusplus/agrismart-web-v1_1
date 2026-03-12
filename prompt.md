I applied the changes (DB updated, restarted both apis), it gets a bit closer but still diverges a lot: 
 
 Cálculo completado exitosamente
 Calculadora de Fertilizantes
Fase del Cultivo
Ayote - Pico producción
Fuente de Agua
AguaLago
 Análisis de Suelo (Opcional)
Deirdre Tyler
 Seleccione una producción para incluir análisis de suelo en el cálculo
Catálogo
UCR
 Resultados del Cálculo Avanzado
Dosificación de Fertilizantes
Fertilizante	Dosificación (g/L)	Dosificación (mL/L)
Sulfato de amonio	0.011	0.011
Nitrato de potasio	0.236	0.236
Nitrato de magnesio	0.173	0.173
Triple superfosfato	0.065	0.065
Sulfato de potasio	0.098	0.098
Cloruro de calcio	0.287	0.287
Sulfato de hierro	0.007	0.007
Sulfato de manganeso	0.002	0.002
Verificación de Nutrientes
Parámetro	Objetivo	Logrado	Desviación %	Estado	Info
K	265.30	265.30	0.00%	Óptimo	
Ca	171.80	171.80	0.00%	Óptimo	
Mg	32.80	32.80	0.00%	Óptimo	
Fe	3.00	3.00	0.00%	Óptimo	
B	0.45	0.45	0.00%	Óptimo	
Cu	0.05	0.05	0.00%	Óptimo	
Zn	0.35	0.35	0.00%	Óptimo	
Mn	0.80	0.80	0.00%	Óptimo	
N	105.50	105.50	0.00%	Óptimo	
S	42.60	42.60	0.00%	Óptimo	
P	58.80	58.80	0.00%	Óptimo	
Mo	0.08	0.08	0.00%	Óptimo	
Métricas de Rendimiento
Fertilizantes Procesados
68
Dosificaciones Activas
8
Resumen de Optimización
Método	linear_programming	Estado	Optimal
Fertilizantes Activos	8	Dosificación Total (g/L)	0.88
Desviación Promedio (%)	0%	Tasa de Éxito (%)	100%
Tiempo de Resolución (s)	0.82	Error de Balance Iónico	58.55
Análisis de Costos Detallado
Costo Total
₡11388.00
Costo por Litro
₡11.39
Costo por m³
₡11388.00
Desviación de Precios
0%
Desglose de Costos por Fertilizante
Fertilizante	Costo (₡)
Cloruro de calcio	3446.50
Nitrato de magnesio	2161.17
Nitrato de potasio	3769.77
Sulfato de amonio	113.69
Sulfato de hierro	104.76
Sulfato de manganeso	27.96
Sulfato de potasio	1763.98
Triple superfosfato	0.16
Análisis del Agua de Riego
Ca
0.45
K
0.54
N
0.00
P
0.00
Mg
0.68
S
0.00
Fe
0.25
Mn
0.05
Zn
0.10
Cu
0.05
B
0.13
Mo
0.00
Calidad del Agua de Riego (por Litro)
Se requiere dilución: agua fuente excede objetivos
Nutriente limitante: Cu. Mezcle por cada litro de solución final:

1.25% agua fuente
98.75% agua RO/pura
Nutrientes del agua que excedían objetivos — ajustados con factor de dilución 0.0125
Nutriente	Agua fuente
(mg/L)	Objetivo
(mg/L)	Dilución
requerida	Aporte ajustado
(mg/L por L final)
B	10.00	0.45	4.50%	0.125
Cu	4.00	0.05	1.25%	0.050
Fe	20.00	3.00	15.00%	0.250
Mg	54.00	32.80	60.74%	0.675
Mn	4.00	0.80	20.00%	0.050
Zn	8.00	0.35	4.37%	0.100
Análisis de Suelo Aplicado
ID de Análisis: 29
pH del Suelo: 5
Fecha de Muestra: 12/12/25, 12:00 AM
Ajustes por Nutrientes Disponibles en Suelo
Nutriente	Suelo (ppm)	Disponibilidad	Cantidad Disponible (ppm)	Reducción en Objetivo (mg/L)
N	89.0	50%	44.5	-44.5
P	4.0	30%	1.2	-1.2
K	21.0	70%	14.7	-14.7
Ca	47.0	60%	28.2	-28.2
Mg	37.0	60%	22.2	-22.2
S	79.0	60%	47.4	-47.4
Análisis de Uso de Fertilizantes
Distribución de Cantidad Necesaria (g/L)
Distribución de Costos
Aporte Nutricional por Fertilizante (mg/L)
concentración final = fertilizante + agua
Fertilizante
dosificación usada	N	P	K	Ca	Mg	S	Fe	Mn	Zn	Cu	B	Mo
Nitrato de potasio
0.236 g/L	32.632	0.000	91.111	0.000	0.000	0.000	0.000	0.000	0.000	0.000	0.000	0.000
Cloruro de calcio
0.287 g/L	0.000	0.000	0.000	78.293	0.000	0.000	0.000	0.000	0.000	0.000	0.000	0.000
Nitrato de magnesio
0.173 g/L	18.897	0.000	0.000	0.000	16.390	0.000	0.000	0.000	0.000	0.000	0.000	0.000
Sulfato de potasio
0.098 g/L	0.000	0.000	43.972	0.000	0.000	18.022	0.000	0.000	0.000	0.000	0.000	0.000
Sulfato de amonio
0.011 g/L	2.292	0.000	0.000	0.000	0.000	2.622	0.000	0.000	0.000	0.000	0.000	0.000
Sulfato de hierro
0.007 g/L	0.000	0.000	0.000	0.000	0.000	0.805	1.403	0.000	0.000	0.000	0.000	0.000
Sulfato de manganeso
0.002 g/L	0.000	0.000	0.000	0.000	0.000	0.223	0.000	0.383	0.000	0.000	0.000	0.000
Triple superfosfato
0.065 g/L	0.000	30.000	0.000	9.130	0.000	0.000	0.000	0.000	0.000	0.000	0.000	0.000
Σ Fertilizantes	53.821	30.000	135.083	87.423	16.390	21.672	1.403	0.383	0.000	0.000	0.000	0.000
Agua (ajustada)	0.000	0.000	0.537	0.450	0.675	0.000	0.250	0.050	0.100	0.050	0.125	0.000
Total Final (Fert + Agua)	53.821	30.000	135.620	87.873	17.065	21.672	1.653	0.433	0.100	0.050	0.125	0.000
Logrado (API)	105.500	58.800	265.300	171.800	32.800	42.600	3.000	0.800	0.350	0.050	0.450	0.080
Coincide (±10%)												
Análisis Parámetros Adicionales
Parámetro	Objetivo	Logrado	Unidad	Desviación	Estado	Info
pH	6.5	7.0		+0.5	 Óptimo	
EC	1.5	46.0	dS/m	+44.5	 Crítico	




