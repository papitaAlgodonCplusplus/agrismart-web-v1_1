import os
import re

# Define the entities that have delete commands
entities = [
    "AnalyticalEntity", "CalculationSetting", "Catalog", "Client", "Company",
    "Container", "Crop", "CropPhase", "CropPhaseOptimal", "CropProduction",
    "CropProductionIrrigationSector", "Device", "Dropper", "Farm",
    "FertilizerChemistry", "Fertilizer", "FertilizerInput", "GrowingMedium",
    "IrrigationEvent", "License", "MeasurementVariable", "ProductionUnit",
    "RelayModule", "Sensor", "User", "WaterChemistry", "Water"
]

mappers_dir = r"C:\Users\AlexQQ\Desktop\agrismart-web-v1_1\Agrismart-main\AgriSmart.Application.Agronomic\Mappers"

for entity in entities:
    mapping_file = f"{entity}MappingProfile.cs"
    file_path = os.path.join(mappers_dir, mapping_file)

    if os.path.exists(file_path):
        print(f"Processing {mapping_file}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if delete mapping already exists
        if f"CreateMap<Delete{entity}Command, {entity}>" not in content:
            # Find the last CreateMap line and add the delete mapping after it
            lines = content.split('\n')

            # Find the position to insert the delete mapping
            insert_pos = -1
            for i, line in enumerate(lines):
                if line.strip() == '}' and i > 0 and 'CreateMap' in lines[i-1]:
                    insert_pos = i
                    break

            if insert_pos > 0:
                # Insert the delete mapping before the closing brace
                lines.insert(insert_pos, f"            CreateMap<Delete{entity}Command, {entity}>();")

                new_content = '\n'.join(lines)

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                print(f"  Added delete mapping for {entity}")
            else:
                print(f"  Could not find insertion point for {entity}")
        else:
            print(f"  Delete mapping already exists for {entity}")
    else:
        print(f"  {mapping_file} not found")

print("Done!")