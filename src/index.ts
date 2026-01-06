#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { extractSnippets } from './parser/extracts.js';
import { runner } from './engine/runner.js';
import { repairSnippet } from './ai/repair.js';
import { select } from '@inquirer/prompts';

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

        // 3. Repair all snippets in parallel
        console.log(chalk.blue.bold(`--- Repairing Snippets ---\n`));
        const repairedSnippets = await Promise.all(
            targetSnippets.map(async (snippet, index) => {
                console.log(chalk.yellow(`🤖 Repairing #${index + 1} [${snippet.language}]...`));
                const executableCode = await repairSnippet(snippet.code, snippet.language);
                return { index, snippet, executableCode };
            })
        );

        // 4. Execute snippets with interactive error handling
        console.log(chalk.blue.bold(`\n--- Running Repaired Snippets ---\n`));
        
        for (let i = 0; i < repairedSnippets.length; i++) {
            const { index, snippet } = repairedSnippets[i];
            let executableCode = repairedSnippets[i].executableCode;
            
            let shouldContinue = true;
            while (shouldContinue) {
                console.log(chalk.blue(`\n💻 Running snippet #${index + 1} [${snippet.language}]`));
                const result = await runner(executableCode, snippet.language);
                
                if (result.success) {
                    console.log(chalk.green('✅ Success!'));
                    console.log(chalk.gray('Output:\n'), result.output);
                    shouldContinue = false; // Move to next snippet
                } else {
                    console.log(chalk.red('❌ Failed!'));
                    console.log(chalk.red('Error:'), result.error);
                    
                    const action = await select({
                        message: `What do you want to do?`,
                        choices: [
                            { name: '🔍 View Details', value: 'details' },
                            { name: '🔄 Retry with AI', value: 'retry' },
                            { name: '⏭️  Skip', value: 'skip' },
                            { name: '🚪 Exit', value: 'exit' }
                        ]
                    });
                    
                    switch (action) {
                        case 'details':
                            console.log(chalk.cyan('\n📝 Original Code:'));
                            console.log(snippet.code);
                            console.log(chalk.cyan('\n📝 Repaired Code:'));
                            console.log(executableCode);
                            console.log(chalk.cyan('\n📝 Error Output:'));
                            console.log(result.output || result.error);
                            break;
                            
                        case 'retry':
                            console.log(chalk.yellow('\n🤖 Re-invoking AI repair...'));
                            executableCode = await repairSnippet(snippet.code, snippet.language);
                            // Loop continues, will run again
                            break;
                            
                        case 'skip':
                            console.log(chalk.yellow('Skipping...'));
                            shouldContinue = false;
                            break;
                            
                        case 'exit':
                            console.log(chalk.blue('👋 Exiting.'));
                            process.exit(0);
                    }
                }
            }
        }
        
    } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
    } finally {
        console.log(chalk.blue('\n🏁 Done.\n'));
    }
  });

program.parse();