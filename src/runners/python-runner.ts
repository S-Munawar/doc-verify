import { BaseRunner } from '@/runners/base-runner.js';

export class PythonRunner extends BaseRunner {
    protected image = 'python:3.11-alpine';
    protected inputFile = 'app.py';

    getExecuteCommand(): string {
        return `python ${this.inputFile}`;
    }
}
