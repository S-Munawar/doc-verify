#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { extractSnippets } from './parser/extracts.js';
import { runner } from './engine/runner.js';
import { repairSnippet } from './ai/repair.js'; // Import the AI Agent

dotenv.config();

const program = new Command();

program
  .name('doc-verify')
  .description('CLI to test documentation code snippets')
  .version('0.0.1');

program
  .command('run')
  .argument('<file>', 'path to the markdown file to test')
  .option('-l, --lang <language>', 'language to filter (e.g. js, py)')
  .action(async (file, options) => {
    console.log(chalk.blue(`\n🔍 Parsing file: ${file}`));
    
    try {
        // 1. Extract
        const allSnippets = extractSnippets(file);
        
        // 2. Filter (if user specified --lang)
        const targetSnippets = options.lang 
            ? allSnippets.filter(s => s.language === options.lang)
            : allSnippets;

        if (targetSnippets.length === 0) {
            console.log(chalk.yellow('No code snippets found matching your criteria.'));
            return;
        }

        console.log(chalk.green(`✓ Found ${targetSnippets.length} snippets.\n`));

        console.log(chalk.white.blue(`--- Repairing Snippets ---\n`));
        const repairedSnippets = await Promise.all(targetSnippets.map(async (snippet, index) => {
            const executableCode = await repairSnippet(snippet.code, snippet.language); // AI REPAIR HERE
            return { index, snippet, executableCode };
        }));

        console.log(chalk.white.blue(`\n--- Running Repaired Snippets ---\n`));
        for (const { index, snippet, executableCode } of repairedSnippets) {
            console.log(chalk.blue(`\n💻 Running snippet #${index + 1} (Language: ${snippet.language})`));
            const result = await runner(executableCode, snippet.language);
            if (result.success) {
                console.log(chalk.green('✅ Success! Output:\n'), chalk.white(result.output));
            } else {
                console.log(chalk.red('❌ Error during execution:\n'), chalk.red(result.error || 'Unknown error'));
            }
        }
        
    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
    }
    finally {
        console.log(chalk.blue('🏁 Done.\n'));
        // Delete all images created during the run

        // (In a real implementation, we might want to be more selective here)
    }
  });

program.parse();