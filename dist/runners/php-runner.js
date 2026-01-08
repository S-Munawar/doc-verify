"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhpRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
class PhpRunner extends base_runner_js_1.BaseRunner {
    image = 'php:8.2-cli-alpine';
    inputFile = 'script.php';
    getExecuteCommand() {
        return `php ${this.inputFile}`;
    }
}
exports.PhpRunner = PhpRunner;
