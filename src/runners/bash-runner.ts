import { BaseRunner } from '@/runners/base-runner.js';

export class BashRunner extends BaseRunner {
    protected image = 'alpine:latest';
    protected inputFile = 'script.sh';

    getExecuteCommand(): string {
        return `sh ${this.inputFile}`;
    }
}
