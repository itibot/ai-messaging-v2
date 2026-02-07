import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SENSITIVE_PATTERNS = [
    /AIza[0-9A-Za-z-_]{30,45}/, // Google AI Key (usually 39 chars)
    /sk-ant-api03-[0-9A-Za-z-_]{90,110}/, // Anthropic API Key (usually ~108 chars)
];

const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', '.vercel', 'scripts'];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    let foundSecrets = false;

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            if (!EXCLUDED_DIRS.includes(file)) {
                if (scanDirectory(fullPath)) foundSecrets = true;
            }
        } else if (stats.isFile()) {
            // Don't scan the .env files (which are allowed to have keys locally) 
            // or other known safe non-code files if needed
            if (file.startsWith('.env') || file.endsWith('.md') || file === 'package-lock.json') continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            for (const pattern of SENSITIVE_PATTERNS) {
                if (pattern.test(content)) {
                    console.error(`❌ SECURITY VIOLATION: Potential secret found in ${fullPath}`);
                    foundSecrets = true;
                }
            }
        }
    }
    return foundSecrets;
}

console.log('🔍 Running Pre-flight Security Scan...');
const hasSecrets = scanDirectory(rootDir);

if (hasSecrets) {
    console.error('\n🛑 Build aborted: Sensitive data was detected in the codebase.');
    console.error('Please remove the secrets and use environment variables instead.');
    process.exit(1);
} else {
    console.log('✅ Security scan passed. No exposed secrets found.');
}
