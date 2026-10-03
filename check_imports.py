import os
import re

errors = []
checked = 0
for root, dirs, files in os.walk('js'):
    for f in files:
        if f.endswith('.js') and f != 'bundle.js':
            path = os.path.join(root, f)
            with open(path) as fh:
                content = fh.read()
            imports = re.findall(r'from\s+[\'"](.*?)[\'"]', content)
            for imp in imports:
                checked += 1
                resolved = os.path.normpath(os.path.join(root, imp))
                if not os.path.exists(resolved):
                    errors.append(f'BROKEN IMPORT in {path}: {imp} -> {resolved}')

print(f'Checked {checked} imports. Total errors: {len(errors)}')
for err in errors:
    print(' ', err)
