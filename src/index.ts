#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { extractSnippets } from './parser/extracts.js';
import { runner } from './engine/runner.js';

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

        // 3. Display found snippets (Preview)
        targetSnippets.forEach((snippet, index) => {
            console.log(chalk.gray(`--- Snippet #${index + 1} (Line ${snippet.line}) [${snippet.language}] ---`));
            console.log(snippet.code);
            console.log('\n');
        });

        // Loop through and run them
        for (const [index, snippet] of targetSnippets.entries()) {
            console.log(chalk.white.bold(`--- Running Snippet #${index + 1} (Line ${snippet.line}) [${snippet.language}] ---`));
            
            // EXECUTE HERE
            const result = await runner(snippet.code, snippet.language);

            if (result.success) {
                console.log(chalk.green('PASS ✅'));
                console.log(chalk.gray('Output:'));
                console.log(result.output);
            } else {
                console.log(chalk.red('FAIL ❌'));
                console.log(chalk.red(`Error: ${result.error}`));
                console.log(chalk.gray('Output trace:'));
                console.log(result.output);
            }
            console.log('\n');
        }

    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
    }
  });

program.parse();