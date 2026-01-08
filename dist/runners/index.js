"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRunner = void 0;
exports.getRunner = getRunner;
exports.getSupportedLanguages = getSupportedLanguages;
exports.getUniqueLanguages = getUniqueLanguages;
const base_runner_js_1 = require("@/runners/base-runner.js");
Object.defineProperty(exports, "BaseRunner", { enumerable: true, get: function () { return base_runner_js_1.BaseRunner; } });
const javascript_runner_js_1 = require("@/runners/javascript-runner.js");
const typescript_runner_js_1 = require("@/runners/typescript-runner.js");
const python_runner_js_1 = require("@/runners/python-runner.js");
const go_runner_js_1 = require("@/runners/go-runner.js");
const ruby_runner_js_1 = require("@/runners/ruby-runner.js");
const java_runner_js_1 = require("@/runners/java-runner.js");
const php_runner_js_1 = require("@/runners/php-runner.js");
const bash_runner_js_1 = require("@/runners/bash-runner.js");
const rust_runner_js_1 = require("@/runners/rust-runner.js");
const c_runner_js_1 = require("@/runners/c-runner.js");
const cpp_runner_js_1 = require("@/runners/cpp-runner.js");
const perl_runner_js_1 = require("@/runners/perl-runner.js");
const lua_runner_js_1 = require("@/runners/lua-runner.js");
/**
 * Map of language names/aliases to runner factory functions.
 */
const runnerMap = new Map([
    // JavaScript
    ['js', () => new javascript_runner_js_1.JavaScriptRunner()],
    ['javascript', () => new javascript_runner_js_1.JavaScriptRunner()],
    // TypeScript
    ['ts', () => new typescript_runner_js_1.TypeScriptRunner()],
    ['typescript', () => new typescript_runner_js_1.TypeScriptRunner()],
    // Python
    ['py', () => new python_runner_js_1.PythonRunner()],
    ['python', () => new python_runner_js_1.PythonRunner()],
    // Go
    ['go', () => new go_runner_js_1.GoRunner()],
    ['golang', () => new go_runner_js_1.GoRunner()],
    // Ruby
    ['rb', () => new ruby_runner_js_1.RubyRunner()],
    ['ruby', () => new ruby_runner_js_1.RubyRunner()],
    // Java
    ['java', () => new java_runner_js_1.JavaRunner()],
    // PHP
    ['php', () => new php_runner_js_1.PhpRunner()],
    // Bash/Shell
    ['bash', () => new bash_runner_js_1.BashRunner()],
    ['sh', () => new bash_runner_js_1.BashRunner()],
    ['shell', () => new bash_runner_js_1.BashRunner()],
    // Rust
    ['rust', () => new rust_runner_js_1.RustRunner()],
    ['rs', () => new rust_runner_js_1.RustRunner()],
    // C
    ['c', () => new c_runner_js_1.CRunner()],
    // C++
    ['cpp', () => new cpp_runner_js_1.CppRunner()],
    ['c++', () => new cpp_runner_js_1.CppRunner()],
    // Perl
    ['perl', () => new perl_runner_js_1.PerlRunner()],
    ['pl', () => new perl_runner_js_1.PerlRunner()],
    // Lua
    ['lua', () => new lua_runner_js_1.LuaRunner()],
]);
/**
 * Gets a runner instance for the specified language.
 * Returns null if the language is not supported.
 */
function getRunner(language) {
    const factory = runnerMap.get(language.toLowerCase());
    return factory ? factory() : null; // Return null if language not supported or else instantiate the runner
}
/**
 * Returns a list of all supported language identifiers.
 */
function getSupportedLanguages() {
    return Array.from(runnerMap.keys());
}
/**
 * Returns a list of unique supported languages (without aliases).
 */
function getUniqueLanguages() {
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
