"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RustRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
class RustRunner extends base_runner_js_1.BaseRunner {
    image = 'rust:1.75-alpine';
    inputFile = 'main.rs';
    getExecuteCommand() {
        return `sh -c "rustc ${this.inputFile} -o main && ./main"`;
    }
}
exports.RustRunner = RustRunner;
