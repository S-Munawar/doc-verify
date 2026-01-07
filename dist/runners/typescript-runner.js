"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptRunner = void 0;
const base_runner_1 = require("./base-runner");
class TypeScriptRunner extends base_runner_1.BaseRunner {
    image = 'denoland/deno:latest';
    inputFile = 'script.ts';
    getExecuteCommand() {
        return `deno run --allow-all ${this.inputFile}`;
    }
}
exports.TypeScriptRunner = TypeScriptRunner;
