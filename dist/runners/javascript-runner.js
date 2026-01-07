"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptRunner = void 0;
const base_runner_1 = require("./base-runner");
class JavaScriptRunner extends base_runner_1.BaseRunner {
    image = 'node:18-alpine';
    inputFile = 'script.js';
    getExecuteCommand() {
        return `node ${this.inputFile}`;
    }
}
exports.JavaScriptRunner = JavaScriptRunner;
