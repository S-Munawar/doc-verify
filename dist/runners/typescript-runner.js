"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptRunner = void 0;
const base_runner_js_1 = require("@/runners/base-runner.js");
const network_shim_js_1 = require("@/engine/mocks/network-shim.js");
class TypeScriptRunner extends base_runner_js_1.BaseRunner {
    image = 'denoland/deno:latest';
    inputFile = 'script.ts';
    getExecuteCommand() {
        return `deno run --allow-all ${this.inputFile}`;
    }
    preprocessCode(code) {
        return network_shim_js_1.NETWORK_SHIM + '\n' + code;
    }
}
exports.TypeScriptRunner = TypeScriptRunner;
