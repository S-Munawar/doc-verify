"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaRunner = void 0;
const base_runner_1 = require("./base-runner");
class JavaRunner extends base_runner_1.BaseRunner {
    image = 'eclipse-temurin:17-alpine';
    inputFile = 'Main.java';
    getExecuteCommand() {
        return `sh -c "javac ${this.inputFile} && java Main"`;
    }
}
exports.JavaRunner = JavaRunner;
