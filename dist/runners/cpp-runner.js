"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CppRunner = void 0;
const base_runner_1 = require("./base-runner");
class CppRunner extends base_runner_1.BaseRunner {
    image = 'gcc:13-bookworm';
    inputFile = 'main.cpp';
    getExecuteCommand() {
        return `sh -c "g++ ${this.inputFile} -o main && ./main"`;
    }
}
exports.CppRunner = CppRunner;
