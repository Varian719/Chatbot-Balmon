import re
import glob

for file in glob.glob('*.html'):
    if 'draf_' in file or 'test' in file or 'datachat.html' in file:
        continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We find .dropdown-content li a { ... } and add text-shadow: none; if it's missing.
    # regex to match: \.dropdown-content li a \s*{[^}]+}
    def add_text_shadow(match):
        block = match.group(0)
        if 'text-shadow' not in block:
            # insert before the closing brace
            return block.rstrip(' \t\n\r}') + '\n            text-shadow: none;\n        }'
        return block

    new_content = re.sub(r'\.dropdown-content\s+li\s+a\s*\{[^}]+\}', add_text_shadow, content)
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {file}')
