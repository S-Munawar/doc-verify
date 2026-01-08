import { BaseRunner, RunResult } from '@/runners/base-runner.js';
import { JavaScriptRunner } from '@/runners/javascript-runner.js';
import { TypeScriptRunner } from '@/runners/typescript-runner.js';
import { PythonRunner } from '@/runners/python-runner.js';
import { GoRunner } from '@/runners/go-runner.js';
import { RubyRunner } from '@/runners/ruby-runner.js';
import { JavaRunner } from '@/runners/java-runner.js';
import { PhpRunner } from '@/runners/php-runner.js';
import { BashRunner } from '@/runners/bash-runner.js';
import { RustRunner } from '@/runners/rust-runner.js';
import { CRunner } from '@/runners/c-runner.js';
import { CppRunner } from '@/runners/cpp-runner.js';
import { PerlRunner } from '@/runners/perl-runner.js';
import { LuaRunner } from '@/runners/lua-runner.js';

// Re-export types
export { BaseRunner, RunResult };

/**
 * Map of language names/aliases to runner factory functions.
 */
const runnerMap = new Map<string, () => BaseRunner>([
    // JavaScript
    ['js', () => new JavaScriptRunner()],
    ['javascript', () => new JavaScriptRunner()],
    
    // TypeScript
    ['ts', () => new TypeScriptRunner()],
    ['typescript', () => new TypeScriptRunner()],
    
    // Python
    ['py', () => new PythonRunner()],
    ['python', () => new PythonRunner()],
    
    // Go
    ['go', () => new GoRunner()],
    ['golang', () => new GoRunner()],
    
    // Ruby
    ['rb', () => new RubyRunner()],
    ['ruby', () => new RubyRunner()],
    
    // Java
    ['java', () => new JavaRunner()],
    
    // PHP
    ['php', () => new PhpRunner()],
    
    // Bash/Shell
    ['bash', () => new BashRunner()],
    ['sh', () => new BashRunner()],
    ['shell', () => new BashRunner()],
    
    // Rust
    ['rust', () => new RustRunner()],
    ['rs', () => new RustRunner()],
    
    // C
    ['c', () => new CRunner()],
    
    // C++
    ['cpp', () => new CppRunner()],
    ['c++', () => new CppRunner()],
    
    // Perl
    ['perl', () => new PerlRunner()],
    ['pl', () => new PerlRunner()],
    
    // Lua
    ['lua', () => new LuaRunner()],
]);

/**
 * Gets a runner instance for the specified language.
 * Returns null if the language is not supported.
 */
export function getRunner(language: string): BaseRunner | null {
    const factory = runnerMap.get(language.toLowerCase());
    return factory ? factory() : null; // Return null if language not supported or else instantiate the runner
}

/**
 * Returns a list of all supported language identifiers.
 */
export function getSupportedLanguages(): string[] {
    return Array.from(runnerMap.keys());
}

/**
 * Returns a list of unique supported languages (without aliases).
 */
export function getUniqueLanguages(): string[] {
    return [
        'javascript',
        'typescript',
        'python',
        'go',
        'ruby',
        'java',
        'php',
        'bash',
        'rust',
        'c',
        'cpp',
        'perl',
        'lua',
    ];
}
