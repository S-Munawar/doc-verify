"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BashRunner = void 0;
const base_runner_1 = require("./base-runner");
class BashRunner extends base_runner_1.BaseRunner {
    image = 'alpine:latest';
    inputFile = 'script.sh';
    getExecuteCommand() {
        return `sh ${this.inputFile}`;
    }
}
exports.BashRunner = BashRunner;
