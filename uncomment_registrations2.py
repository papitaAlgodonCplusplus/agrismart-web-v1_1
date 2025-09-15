#!/usr/bin/env python3
import re

def uncomment_all_query_repositories():
    filepath = "Agrismart-main/AgriSmart.Api.Agronomic/Program.cs"

    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()

    # Remove comments from ALL query repository registrations
    # Pattern: // builder.Services.AddTransient<I*QueryRepository*, *QueryRepository*>();
    content = re.sub(
        r'// (builder\.Services\.AddTransient<I.*QueryRepository.*>\(\);)',
        r'\1',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)

    print("Uncommented all query repository registrations")

if __name__ == "__main__":
    uncomment_all_query_repositories()
    print("Done!")