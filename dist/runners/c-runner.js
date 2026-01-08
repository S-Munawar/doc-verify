"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
class CRunner extends base_runner_js_1.BaseRunner {
    image = 'gcc:13-bookworm';
    inputFile = 'main.c';
    getExecuteCommand() {
        return `sh -c "gcc ${this.inputFile} -o main && ./main"`;
    }
}
exports.CRunner = CRunner;
