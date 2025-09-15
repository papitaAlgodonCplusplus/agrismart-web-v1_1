#!/usr/bin/env python3
import os
import re

def fix_repository_files():
    base_path = "Agrismart-main/AgriSmart.Infrastructure/Repositories/Query"

    # Check if directory exists
    if not os.path.exists(base_path):
        print(f"Directory {base_path} not found")
        return

    for filename in os.listdir(base_path):
        if filename.endswith('.cs'):
            filepath = os.path.join(base_path, filename)

            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()

            # Check if the file uses Profiles and doesn't have the using statement
            if 'Profiles.' in content and 'using AgriSmart.Core.Enums;' not in content:
                print(f"Fixing {filename}")
                # Add the using statement after the Microsoft.AspNetCore.Http using
                content = re.sub(
                    r'(using Microsoft\.AspNetCore\.Http;)',
                    r'\1\nusing AgriSmart.Core.Enums;',
                    content
                )

                with open(filepath, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Fixed {filename}")

if __name__ == "__main__":
    fix_repository_files()
    print("Done!")