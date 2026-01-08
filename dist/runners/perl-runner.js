"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerlRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
class PerlRunner extends base_runner_js_1.BaseRunner {
    image = 'perl:5.38-slim';
    inputFile = 'script.pl';
    getExecuteCommand() {
        return `perl ${this.inputFile}`;
    }
}
exports.PerlRunner = PerlRunner;
