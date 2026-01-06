import { BaseRunner } from './base-runner';

export class BashRunner extends BaseRunner {
    protected image = 'alpine:latest';
    protected inputFile = 'script.sh';

    getExecuteCommand(): string {
        return `sh ${this.inputFile}`;
    }
}
