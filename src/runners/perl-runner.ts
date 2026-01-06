import { BaseRunner } from './base-runner';

export class PerlRunner extends BaseRunner {
    protected image = 'perl:5.38-slim';
    protected inputFile = 'script.pl';

    getExecuteCommand(): string {
        return `perl ${this.inputFile}`;
    }
}
