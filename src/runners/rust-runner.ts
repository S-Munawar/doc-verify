import { BaseRunner } from '@/runners/base-runner.js';

export class RustRunner extends BaseRunner {
    protected image = 'rust:1.75-alpine';
    protected inputFile = 'main.rs';

    getExecuteCommand(): string {
        return `sh -c "rustc ${this.inputFile} -o main && ./main"`;
    }
}
