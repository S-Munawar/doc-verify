import { BaseRunner } from '@/runners/base-runner.js';

export class CRunner extends BaseRunner {
    protected image = 'gcc:13-bookworm';
    protected inputFile = 'main.c';

    getExecuteCommand(): string {
        return `sh -c "gcc ${this.inputFile} -o main && ./main"`;
    }
}
