"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRunner = void 0;
const base_runner_1 = require("./base-runner");
class CRunner extends base_runner_1.BaseRunner {
    image = 'gcc:13-bookworm';
    inputFile = 'main.c';
    getExecuteCommand() {
        return `sh -c "gcc ${this.inputFile} -o main && ./main"`;
    }
}
exports.CRunner = CRunner;
