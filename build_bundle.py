import os
import re

files_order = [
    "js/initialData.js",
    "js/state.js",
    "js/utils.js",
    "js/utils/aiParser.js",
    "js/utils/receiptScanner.js",
    "js/utils/cloudSync.js",
    "js/utils/exporter.js",
    "js/utils/licenseService.js",
    "js/components/icons.js",
    "js/components/toast.js",
    "js/components/modal.js",
    "js/components/licenseModal.js",
    "js/components/receiptScanModal.js",
    "js/components/aiModal.js",
    "js/components/telegramSimulator.js",
    "js/components/exportModal.js",
    "js/components/onboardingWizardModal.js",
    "js/components/transactionModal.js",
    "js/components/navbar.js",
    "js/components/bottomNav.js",
    "js/pages/dashboard.js",
    "js/pages/transactions.js",
    "js/pages/budgets.js",
    "js/pages/goals.js",
    "js/pages/bills.js",
    "js/pages/reports.js",
    "js/pages/settings.js",
    "js/auth-access.js",
    "js/app.js"
]

def clean_file_content(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove import statements
    content = re.sub(r'import\s+.*?from\s+[\'"].*?[\'"];?\n?', '', content)
    # Remove export default
    content = re.sub(r'export\s+default\s+', '', content)
    # Replace 'export async function' with 'async function'
    content = re.sub(r'export\s+async\s+function\s+', 'async function ', content)
    # Replace 'export function' with 'function'
    content = re.sub(r'export\s+function\s+', 'function ', content)
    # Replace 'export class' with 'class'
    content = re.sub(r'export\s+class\s+', 'class ', content)
    # Replace 'export const' with 'const'
    content = re.sub(r'export\s+const\s+', 'const ', content)
    # Replace 'export let' with 'let'
    content = re.sub(r'export\s+let\s+', 'let ', content)
    # Replace 'export var' with 'var'
    content = re.sub(r'export\s+var\s+', 'var ', content)
    # Remove export { ... };
    content = re.sub(r'export\s*\{[^}]*\};?\n?', '', content)

    return f"\n// ==================== [MODULE: {path}] ====================\n" + content

def build():
    output = "/**\n * Dompet Keluarga V2.2.1 - Production Bundle\n * Complete Unified Client-Side Application with Cloud Sync & OCR\n */\n"
    
    # Handle duplicate declarations if any across files
    for path in files_order:
        if os.path.exists(path):
            output += clean_file_content(path) + "\n"
        else:
            print(f"Warning: {path} not found")

    with open("js/bundle.js", "w", encoding="utf-8") as f:
        f.write(output)
    
    print(f"Successfully generated js/bundle.js ({len(output)} bytes)")

if __name__ == "__main__":
    build()
