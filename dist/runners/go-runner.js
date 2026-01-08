"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
class GoRunner extends base_runner_js_1.BaseRunner {
    image = 'golang:1.20-alpine';
    inputFile = 'main.go';
    getExecuteCommand() {
        return `go run ${this.inputFile}`;
    }
}
exports.GoRunner = GoRunner;
