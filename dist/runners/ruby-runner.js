"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubyRunner = void 0;
const base_runner_1 = require("./base-runner");
class RubyRunner extends base_runner_1.BaseRunner {
    image = 'ruby:3.2-alpine';
    inputFile = 'script.rb';
    getExecuteCommand() {
        return `ruby ${this.inputFile}`;
    }
}
exports.RubyRunner = RubyRunner;
