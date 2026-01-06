import { BaseRunner } from './base-runner';

export class JavaScriptRunner extends BaseRunner {
    protected image = 'node:18-alpine';
    protected inputFile = 'script.js';

    getExecuteCommand(): string {
        return `node ${this.inputFile}`;
    }
}
