import { BaseRunner, RunResult } from './base-runner';
import { JavaScriptRunner } from './javascript-runner';
import { TypeScriptRunner } from './typescript-runner';
import { PythonRunner } from './python-runner';
import { GoRunner } from './go-runner';
import { RubyRunner } from './ruby-runner';
import { JavaRunner } from './java-runner';
import { PhpRunner } from './php-runner';
import { BashRunner } from './bash-runner';
import { RustRunner } from './rust-runner';
import { CRunner } from './c-runner';
import { CppRunner } from './cpp-runner';
import { PerlRunner } from './perl-runner';
import { LuaRunner } from './lua-runner';

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
