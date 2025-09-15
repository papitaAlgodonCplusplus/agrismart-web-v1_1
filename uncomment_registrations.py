#!/usr/bin/env python3
import re

def uncomment_query_repositories():
    filepath = "Agrismart-main/AgriSmart.Api.Agronomic/Program.cs"

    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # Remove comments from query repository registrations
    # Pattern: // builder.Services.AddTransient<I*QueryRepository*, *QueryRepository*>(); // Temporarily commented due to build issues
    content = re.sub(
        r'// (builder\.Services\.AddTransient<I.*QueryRepository.*>.*\(\);) // Temporarily commented due to build issues',
        r'\1',
        content
    )

    # Also uncomment the base query repository
    content = re.sub(
        r'// (builder\.Services\.AddScoped\(typeof\(IBaseQueryRepository.*\)\);) // Temporarily commented due to build issues',
        r'\1',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

    print("Uncommented query repository registrations")

if __name__ == "__main__":
    uncomment_query_repositories()
    print("Done!")