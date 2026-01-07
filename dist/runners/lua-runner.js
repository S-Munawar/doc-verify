"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuaRunner = void 0;
const base_runner_1 = require("./base-runner");
class LuaRunner extends base_runner_1.BaseRunner {
    image = 'nickblah/lua:5.4-alpine';
    inputFile = 'script.lua';
    getExecuteCommand() {
        return `lua ${this.inputFile}`;
    }
}
exports.LuaRunner = LuaRunner;
