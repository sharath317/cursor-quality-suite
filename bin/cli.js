#!/usr/bin/env node

/**
 * cursor-quality-suite CLI
 * Code Quality & Testing Commands for Cursor IDE
 * Test Generation, Mutation Testing, Architecture Visualization
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const VERSION = '1.1.0';
const CURSOR_DIR = '.cursor';
const COMMANDS_DIR = 'commands';

const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    step: (msg) => console.log(`  ${colors.dim}→${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

const BUNDLES = {
    minimal: {
        name: 'Minimal (Testing Only)',
        description: 'Test generation and mutation testing',
        commands: ['testing'],
        count: 3,
    },
    standard: {
        name: 'Standard (Testing + Quality)',
        description: 'Full testing and code quality suite',
        commands: ['testing', 'code-quality'],
        count: 7,
    },
};

function prompt(question, defaultValue = '') {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const defaultText = defaultValue ? ` (${defaultValue})` : '';

    return new Promise((resolve) => {
        rl.question(`${question}${defaultText}: `, (answer) => {
            rl.close();
            resolve(answer || defaultValue);
        });
    });
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyCommands(sourceDir, targetDir, categories) {
    let copiedCount = 0;

    categories.forEach((category) => {
        const srcCategoryDir = path.join(sourceDir, category);

        if (fs.existsSync(srcCategoryDir)) {
            const files = fs.readdirSync(srcCategoryDir).filter((f) => f.endsWith('.md'));

            files.forEach((file) => {
                const srcFile = path.join(srcCategoryDir, file);
                const tgtFile = path.join(targetDir, file);

                if (!fs.existsSync(tgtFile)) {
                    fs.copyFileSync(srcFile, tgtFile);
                    log.step(`Installed: ${file}`);
                    copiedCount++;
                } else {
                    log.step(`Exists: ${file} (skipped)`);
                }
            });
        }
    });

    return copiedCount;
}

async function init(flags = {}) {
    console.log(`
${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 CURSOR QUALITY SUITE v${VERSION}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
Code Quality: Testing, Architecture & Analysis

`);

    const projectDir = process.cwd();
    const cursorDir = path.join(projectDir, CURSOR_DIR);
    const commandsDir = path.join(cursorDir, COMMANDS_DIR);

    log.header('📦 Select Command Bundle');

    Object.entries(BUNDLES).forEach(([key, bundle], idx) => {
        console.log(`  ${idx + 1}. ${colors.bold}${bundle.name}${colors.reset}`);
        console.log(`     ${bundle.description} (${bundle.count} commands)\n`);
    });

    let selectedBundle = 'standard';
    if (!flags.bundle && !flags.yes) {
        const bundleAnswer = await prompt('Select bundle (1-2)', '2');
        selectedBundle = Object.keys(BUNDLES)[parseInt(bundleAnswer, 10) - 1] || 'standard';
    } else if (flags.bundle) {
        selectedBundle = flags.bundle;
    }

    const bundle = BUNDLES[selectedBundle];
    log.success(`Selected: ${bundle.name}`);

    log.header('📥 Installing Commands');

    ensureDir(commandsDir);

    const packageDir = path.dirname(__dirname);
    const packageCommandsDir = path.join(packageDir, 'commands');

    const copiedCount = copyCommands(packageCommandsDir, commandsDir, bundle.commands);

    console.log(`
${colors.bold}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ INSTALLATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.cyan}Commands installed:${colors.reset} ${copiedCount}
${colors.cyan}Location:${colors.reset}          ${commandsDir}

${colors.bold}Commands Reference:${colors.reset}

  ${colors.cyan}🧪 Testing${colors.reset}
  /risk-test-gen       Generate tests for high-risk paths
  /mutation-audit      Verify test quality via mutations
  /write-unit-tests    Generate unit tests for components

  ${colors.cyan}📊 Code Quality${colors.reset}
  /visualize-architecture   Generate Mermaid diagrams
  /code-standards           Reference guide for quality
  /churn-map                Find high-churn files
  /pattern-drift            Detect pattern violations

${colors.dim}Documentation: https://github.com/sharath317/cursor-quality-suite${colors.reset}
`);
}

async function status() {
    const projectDir = process.cwd();
    const commandsDir = path.join(projectDir, CURSOR_DIR, COMMANDS_DIR);

    if (!fs.existsSync(commandsDir)) {
        log.warn('Quality Suite not installed. Run: npx cursor-quality-suite');
        process.exit(0);
    }

    const commands = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md'));

    console.log(`
${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 QUALITY SUITE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

${colors.cyan}Version:${colors.reset}  ${VERSION}
${colors.cyan}Commands:${colors.reset} ${commands.length} installed
${colors.cyan}Location:${colors.reset} ${commandsDir}

${colors.bold}Installed Commands:${colors.reset}`);

    commands.forEach((cmd) => {
        console.log(`  - /${cmd.replace('.md', '')}`);
    });

    console.log('');
}

async function listCommands() {
    const packageDir = path.dirname(__dirname);
    const packageCommandsDir = path.join(packageDir, 'commands');

    console.log(`
${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 AVAILABLE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

    const categories = ['testing', 'code-quality'];
    const icons = { testing: '🧪', 'code-quality': '📊' };

    categories.forEach((cat) => {
        const catDir = path.join(packageCommandsDir, cat);
        if (fs.existsSync(catDir)) {
            console.log(`\n${icons[cat]} ${colors.bold}${cat.toUpperCase()}${colors.reset}`);

            const files = fs.readdirSync(catDir).filter((f) => f.endsWith('.md'));
            files.forEach((file) => {
                const name = file.replace('.md', '');
                console.log(`  /${name}`);
            });
        }
    });

    console.log('');
}

// Code Quality Check - Node.js implementation
async function runQualityCheck(targetPath = '.') {
    const { execSync } = require('child_process');
    
    console.log(`
${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 CODE QUALITY CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);

    const thresholds = {
        LOC_WARNING: 150,
        LOC_CRITICAL: 300,
        IMPORTS_WARNING: 20,
        IMPORTS_CRITICAL: 35,
        USESTATE_WARNING: 4,
        USESTATE_CRITICAL: 6,
        USEEFFECT_WARNING: 3,
        USEEFFECT_CRITICAL: 5,
        HOOKS_WARNING: 8,
        HOOKS_CRITICAL: 15,
    };

    let criticalCount = 0;
    let warningCount = 0;
    const issues = [];

    // Find TSX files
    let files = [];
    try {
        const result = execSync(
            `find "${targetPath}" -name "*.tsx" -type f 2>/dev/null | grep -v node_modules | grep -v ".test." | grep -v ".stories." | grep -v ".styled." | grep -v ".types." | grep -v ".mock."`,
            { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
        );
        files = result.trim().split('\n').filter(Boolean);
    } catch {
        log.warn('No TSX files found or find command failed');
        return;
    }

    log.info(`Scanning ${files.length} components in ${targetPath}...\n`);

    console.log(`${colors.bold}COMPONENT SIZE CHECK${colors.reset}\n`);

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            const loc = lines.length;
            const imports = (content.match(/^import/gm) || []).length;
            const useStates = (content.match(/useState/g) || []).length;
            const useEffects = (content.match(/useEffect/g) || []).length;
            const hooks = new Set(content.match(/use[A-Z][a-zA-Z]+/g) || []).size;

            const fileIssues = [];
            let hasCritical = false;
            let hasWarning = false;

            // Check LOC
            if (loc > thresholds.LOC_CRITICAL) {
                fileIssues.push(`  ${colors.red}🔴 Lines: ${loc} (critical > ${thresholds.LOC_CRITICAL})${colors.reset}`);
                hasCritical = true;
            } else if (loc > thresholds.LOC_WARNING) {
                fileIssues.push(`  ${colors.yellow}⚠️  Lines: ${loc} (warning > ${thresholds.LOC_WARNING})${colors.reset}`);
                hasWarning = true;
            }

            // Check imports
            if (imports > thresholds.IMPORTS_CRITICAL) {
                fileIssues.push(`  ${colors.red}🔴 Imports: ${imports} (critical > ${thresholds.IMPORTS_CRITICAL})${colors.reset}`);
                hasCritical = true;
            } else if (imports > thresholds.IMPORTS_WARNING) {
                fileIssues.push(`  ${colors.yellow}⚠️  Imports: ${imports} (warning > ${thresholds.IMPORTS_WARNING})${colors.reset}`);
                hasWarning = true;
            }

            // Check useState
            if (useStates > thresholds.USESTATE_CRITICAL) {
                fileIssues.push(`  ${colors.red}🔴 useState: ${useStates} (critical > ${thresholds.USESTATE_CRITICAL})${colors.reset}`);
                hasCritical = true;
            } else if (useStates > thresholds.USESTATE_WARNING) {
                fileIssues.push(`  ${colors.yellow}⚠️  useState: ${useStates} (warning > ${thresholds.USESTATE_WARNING})${colors.reset}`);
                hasWarning = true;
            }

            // Check useEffect
            if (useEffects > thresholds.USEEFFECT_CRITICAL) {
                fileIssues.push(`  ${colors.red}🔴 useEffect: ${useEffects} (critical > ${thresholds.USEEFFECT_CRITICAL})${colors.reset}`);
                hasCritical = true;
            } else if (useEffects > thresholds.USEEFFECT_WARNING) {
                fileIssues.push(`  ${colors.yellow}⚠️  useEffect: ${useEffects} (warning > ${thresholds.USEEFFECT_WARNING})${colors.reset}`);
                hasWarning = true;
            }

            // Check hooks
            if (hooks > thresholds.HOOKS_CRITICAL) {
                fileIssues.push(`  ${colors.red}🔴 Custom hooks: ${hooks} (critical > ${thresholds.HOOKS_CRITICAL})${colors.reset}`);
                hasCritical = true;
            } else if (hooks > thresholds.HOOKS_WARNING) {
                fileIssues.push(`  ${colors.yellow}⚠️  Custom hooks: ${hooks} (warning > ${thresholds.HOOKS_WARNING})${colors.reset}`);
                hasWarning = true;
            }

            if (fileIssues.length > 0) {
                console.log(`📁 ${file}`);
                fileIssues.forEach((issue) => console.log(issue));
                console.log('');
                
                if (hasCritical) criticalCount++;
                else if (hasWarning) warningCount++;
            }
        } catch (err) {
            // Skip files that can't be read
        }
    }

    // Anti-pattern checks
    console.log(`${colors.bold}ANTI-PATTERN CHECK${colors.reset}\n`);

    // Check for watch() usage
    try {
        const watchUsage = execSync(
            `grep -rn "methods\\.watch()\\|\\.watch()" --include="*.tsx" "${targetPath}" 2>/dev/null | grep -v node_modules | head -5`,
            { encoding: 'utf8' }
        ).trim();
        if (watchUsage) {
            console.log(`${colors.yellow}⚠️  Found watch() usage (prefer useWatch):${colors.reset}`);
            console.log(watchUsage);
            warningCount++;
        } else {
            console.log(`${colors.green}✅ No problematic watch() usage${colors.reset}`);
        }
    } catch {
        console.log(`${colors.green}✅ No problematic watch() usage${colors.reset}`);
    }

    // Check for 'any' type
    try {
        const anyUsage = execSync(
            `grep -rn ": any\\|:any\\|as any" --include="*.ts" --include="*.tsx" "${targetPath}" 2>/dev/null | grep -v node_modules | grep -v ".test." | head -5`,
            { encoding: 'utf8' }
        ).trim();
        if (anyUsage) {
            console.log(`${colors.yellow}⚠️  Found 'any' type usage:${colors.reset}`);
            console.log(anyUsage);
            warningCount++;
        } else {
            console.log(`${colors.green}✅ No 'any' type usage${colors.reset}`);
        }
    } catch {
        console.log(`${colors.green}✅ No 'any' type usage${colors.reset}`);
    }

    // Summary
    console.log(`
${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}

🔴 Critical issues: ${criticalCount}
⚠️  Warnings: ${warningCount}
`);

    if (criticalCount > 0) {
        console.log(`${colors.red}❌ FAILED: Critical issues must be addressed${colors.reset}`);
        process.exit(1);
    } else if (warningCount > 0) {
        console.log(`${colors.yellow}⚠️  PASSED with warnings${colors.reset}`);
    } else {
        console.log(`${colors.green}✅ PASSED: All checks passed${colors.reset}`);
    }
}

function showHelp() {
    console.log(`
${colors.bold}cursor-quality-suite v${VERSION}${colors.reset}

Code Quality & Testing Commands for Cursor IDE

${colors.bold}Usage:${colors.reset}
  npx cursor-quality-suite [command] [options]

${colors.bold}Commands:${colors.reset}
  init          Install commands (default)
  check [path]  Run code quality analysis
  status        Show current configuration
  list          List all available commands
  help          Show this help

${colors.bold}Options:${colors.reset}
  --bundle      Select bundle (minimal, standard)
  -y, --yes     Non-interactive mode

${colors.bold}Examples:${colors.reset}
  npx cursor-quality-suite                   Interactive install
  npx cursor-quality-suite check src/        Run quality check on src/
  npx cursor-quality-suite --bundle standard Install all commands
  npx cursor-quality-suite status            Check installation

${colors.bold}Quality Check Thresholds:${colors.reset}
  Lines:        Warning > 150, Critical > 300
  Imports:      Warning > 20, Critical > 35
  useState:     Warning > 4, Critical > 6
  useEffect:    Warning > 3, Critical > 5
  Custom hooks: Warning > 8, Critical > 15

${colors.dim}https://github.com/sharath317/cursor-quality-suite${colors.reset}
`);
}

const args = process.argv.slice(2);
const flags = {};
let command = null;
const skipNextArg = new Set();

args.forEach((arg, idx) => {
    if (arg === '--bundle' && args[idx + 1]) {
        skipNextArg.add(idx + 1);
    }
});

args.forEach((arg, idx) => {
    if (skipNextArg.has(idx)) {
        return;
    } else if (arg === '-y' || arg === '--yes') {
        flags.yes = true;
    } else if (arg === '--bundle' && args[idx + 1]) {
        flags.bundle = args[idx + 1];
    } else if (!arg.startsWith('-') && command === null) {
        command = arg;
    }
});

// Get target path for check command
const checkPath = command === 'check' ? (args.find((a, i) => i > args.indexOf('check') && !a.startsWith('-')) || '.') : '.';

switch (command) {
    case 'init':
    case null:
        init(flags);
        break;
    case 'check':
        runQualityCheck(checkPath);
        break;
    case 'status':
        status();
        break;
    case 'list':
        listCommands();
        break;
    case 'help':
    case '-h':
    case '--help':
        showHelp();
        break;
    default:
        log.error(`Unknown command: ${command}`);
        console.log('Run "npx cursor-quality-suite help" for usage');
        process.exit(1);
}
