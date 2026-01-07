"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runner = runner;
const runners_1 = require("../runners");
/**
 * Runs a code snippet inside a secure Docker container.
 * Supports multiple languages through the modular runner architecture.
 */
async function runner(code, language) {
    const languageRunner = (0, runners_1.getRunner)(language);
    if (!languageRunner) {
        return { success: false, output: '', error: `Unsupported language: ${language}` };
    }
    return await languageRunner.run(code);
}
