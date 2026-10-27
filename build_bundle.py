import os
import re

files_order = [
    "js/utils/securityGuard.js",
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
    "js/components/pwaInstall.js",
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

    # Remove import statements (single-line and multi-line)
    content = re.sub(r'import\s+.*?from\s+[\'"].*?[\'"];?\n?', '', content, flags=re.DOTALL)
    content = re.sub(r'import\s+[\'"].*?[\'"];?\n?', '', content)
    # Remove export default
    content = re.sub(r'export\s+default\s+', '', content)
    # Replace 'export async function' with 'async function'
    content = re.sub(r'export\s+async\s+function\s+', 'async function ', content)
    # Replace 'export function' with 'function'
    content = re.sub(r'export\s+function\s+', 'function ', content)
    # Replace 'export class' with 'class'
    content = re.sub(r'export\s+class\s+', 'class ', content)
    # Replace 'export const' and 'export let' with 'var'
    content = re.sub(r'export\s+(const|let|var)\s+', 'var ', content)
    # Replace top-level const and let with var to avoid duplicate declaration SyntaxError
    content = re.sub(r'^(const|let)\s+', 'var ', content, flags=re.MULTILINE)
    # Remove export { ... };
    content = re.sub(r'export\s*\{[^}]*\};?\n?', '', content)

    # Strip multi-line comments (except URLs)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    # Strip standalone single-line comments
    content = re.sub(r'^\s*//(?!\s*http).*?$', '', content, flags=re.MULTILINE)
    # Collapse multiple empty lines
    content = re.sub(r'\n\s*\n+', '\n', content)

    return content

def build():
    output = "/** Dompet Keluarga PRO V3.18.6 - Production Bundle - Protected by SecurityGuard */\n"
    
    for path in files_order:
        if os.path.exists(path):
            output += clean_file_content(path) + "\n"
        else:
            print(f"Warning: {path} not found")

    with open("js/bundle.js", "w", encoding="utf-8") as f:
        f.write(output)
    
    with open("bundle.js", "w", encoding="utf-8") as f:
        f.write(output)
    
    print(f"Successfully generated js/bundle.js and bundle.js ({len(output)} bytes)")

if __name__ == "__main__":
    build()
