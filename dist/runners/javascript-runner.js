"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
const network_shim_js_1 = require("@/engine/mocks/network-shim.js");
class JavaScriptRunner extends base_runner_js_1.BaseRunner {
    image = 'node:18-alpine';
    inputFile = 'script.js';
    getExecuteCommand() {
        return `node ${this.inputFile}`;
    }
    preprocessCode(code) {
        return network_shim_js_1.NETWORK_SHIM + '\n' + code;
    }
}
exports.JavaScriptRunner = JavaScriptRunner;
