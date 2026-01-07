"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonRunner = void 0;
const base_runner_1 = require("./base-runner");
class PythonRunner extends base_runner_1.BaseRunner {
    image = 'python:3.11-alpine';
    inputFile = 'app.py';
    getExecuteCommand() {
        return `python ${this.inputFile}`;
    }
}
exports.PythonRunner = PythonRunner;
