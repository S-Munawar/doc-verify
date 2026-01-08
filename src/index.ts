#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { Command } from 'commander';
import chalk from 'chalk';
import { extractSnippets } from '@/parser/extracts.js';
import { runner } from '@/engine/runner.js';
import { debug, repairSnippet, generateCleanFix } from '@/ai/repair.js';
import { select } from '@inquirer/prompts';
import { clearCache } from '@/ai/cache.js';
import { updateBadge } from '@/utils/badge.js';
import { applyPatch } from '@/utils/patcher.js';

// ─────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────

const ui = {
    brand: chalk.bold.cyan,
    success: chalk.green,
    error: chalk.red,
    warn: chalk.yellow,
    info: chalk.blue,
    dim: chalk.dim,
    bold: chalk.bold,
    
    header: (text: string) => console.log(`\n${chalk.bold.cyan('›')} ${chalk.bold(text)}`),
    step: (num: number, lang: string) => chalk.dim(`[${num}]`) + chalk.cyan(` ${lang}`),
    divider: () => console.log(chalk.dim('─'.repeat(50))),
    
    pass: () => chalk.bgGreen.black(' PASS '),
    fail: () => chalk.bgRed.white(' FAIL '),
};

const program = new Command();

program
  .name('doc-verify')
  .description('Verify documentation code snippets')
  .version('0.0.1');

program
  .command('run')
  .argument('<file>', 'markdown file to verify')
  .option('-l, --lang <language>', 'filter by language')
  .action(async (file, options) => {
    console.log();
    console.log(ui.brand('  doc-verify'));
    ui.divider();
    console.log(ui.dim(`  File: ${file}`));
    if (options.lang) console.log(ui.dim(`  Filter: ${options.lang}`));
    
    let shouldRestart = true;
    
    while (shouldRestart) {
        shouldRestart = false;
        
        try {
            const allSnippets = extractSnippets(file);
            const targetSnippets = options.lang 
                ? allSnippets.filter(s => s.language === options.lang)
                : allSnippets;

            if (targetSnippets.length === 0) {
                console.log(ui.warn('\n  No snippets found.\n'));
                return;
            }

            console.log(ui.dim(`  Snippets: ${targetSnippets.length}\n`));

            // Repair phase - run in parallel but collect results silently
            ui.header('Preparing');
            process.stdout.write(ui.dim('  Repairing snippets... '));
            
            const repairedSnippets = await Promise.all(
                targetSnippets.map(async (snippet, index) => {
                    const executableCode = await repairSnippet(index + 1, snippet.code, snippet.language);
                    return { index, snippet, executableCode };
                })
            );
            console.log(ui.success('done'));

            // Execute phase
            ui.header('Running');
            let passed = 0;
            let failed = 0;
            
            snippetLoop:
            for (let i = 0; i < repairedSnippets.length; i++) {
                const { index, snippet } = repairedSnippets[i];
                let executableCode = repairedSnippets[i].executableCode;
                
                let shouldContinue = true;
                while (shouldContinue) {
                    process.stdout.write(ui.dim(`  ${index + 1}. ${snippet.language} `));
                    const result = await runner(executableCode, snippet.language);
                    
                    if (result.success) {
                        console.log(ui.pass());
                        if (result.output?.trim()) {
                            console.log(ui.dim(`     ${result.output.trim().split('\n').join('\n     ')}`));
                        }
                        passed++;
                        shouldContinue = false;
                    } else {
                        console.log(ui.fail());
                        console.log(ui.error(`     ${result.error}`));
                        failed++;
                        
                        const action = await select({
                            message: 'Action',
                            choices: [
                                { name: 'Auto-fix', value: 'fix' },
                                { name: 'Details', value: 'details' },
                                { name: 'Retry', value: 'retry' },
                                { name: 'Clear cache', value: 'clear' },
                                { name: 'Skip', value: 'skip' },
                                { name: 'Exit', value: 'exit' }
                            ]
                        });
                        
                        switch (action) {
                            case 'fix':
                                console.log(ui.dim('\n  Generating fix...'));
                                const cleanCode = await generateCleanFix(snippet.code, result.error || 'Unknown Error', snippet.language);
                                ui.divider();
                                console.log(cleanCode);
                                ui.divider();
                                const confirm = await select({
                                    message: 'Apply fix?',
                                    choices: [{name: 'Yes', value: true}, {name: 'No', value: false}]
                                });
                                if (confirm) {
                                    applyPatch(file, snippet.line, snippet.code, cleanCode);
                                    console.log(ui.success('  Applied.\n'));
                                    shouldRestart = true;
                                    break snippetLoop;
                                }
                                break;
                                
                            case 'details':
                                console.log(ui.dim('\n  ── Original ──'));
                                console.log(snippet.code);
                                console.log(ui.dim('\n  ── Repaired ──'));
                                console.log(executableCode);
                                console.log(ui.dim('\n  ── Error ──'));
                                console.log(result.output || result.error);
                                const nextAction = await select({
                                    message: 'Action',
                                    choices: [
                                        { name: 'Debug with AI', value: 'debug' },
                                        { name: 'Back', value: 'back' },
                                    ]
                                });
                                if (nextAction === 'debug') {
                                    console.log(ui.dim('\n  Analyzing...\n'));
                                    const errorOutput = result.output || result.error || 'Unknown error';
                                    const debugInfo = await debug(snippet.code, executableCode, errorOutput, snippet.language);
                                    console.log(debugInfo);
                                }
                                break;
                                
                            case 'retry':
                                shouldRestart = true;
                                break snippetLoop;
                            
                            case 'clear':
                                clearCache(snippet.code);
                                console.log(ui.dim('  Cache cleared.'));
                                shouldRestart = true;
                                break snippetLoop;
                                
                            case 'skip':
                                shouldContinue = false;
                                break;
                                
                            case 'exit':
                                process.exit(0);
                        }
                    }
                }
            }
            
            // Summary
            if (!shouldRestart) {
                ui.divider();
                if (failed === 0) {
                    updateBadge(file);
                    console.log(ui.success(`  ✓ ${passed} passed`));
                } else {
                    console.log(`  ${ui.success(`${passed} passed`)} ${ui.error(`${failed} failed`)}`);
                }
                console.log();
            }
            
        } catch (err: any) {
            console.error(ui.error(`\n  Error: ${err.message}\n`));
            shouldRestart = false;
        }
    }
  });

program
  .command('clear')
  .description('Clear cache')
  .action(() => {
    clearCache();
    console.log(ui.success('  Cache cleared.\n'));
  });

program.parse();
