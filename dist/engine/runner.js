"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runner = runner;
const index_js_1 = require("@/runners/index.js");
/**
 * Runs a code snippet inside a secure Docker container.
 * Supports multiple languages through the modular runner architecture.
 */
async function runner(code, language) {
    const languageRunner = (0, index_js_1.getRunner)(language);
    if (!languageRunner) {
        return { success: false, output: '', error: `Unsupported language: ${language}` };
    }
    return await languageRunner.run(code);
}
