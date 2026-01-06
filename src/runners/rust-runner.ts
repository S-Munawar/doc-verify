import { BaseRunner } from './base-runner';

export class RustRunner extends BaseRunner {
    protected image = 'rust:1.75-alpine';
    protected inputFile = 'main.rs';

    getExecuteCommand(): string {
        return `sh -c "rustc ${this.inputFile} -o main && ./main"`;
    }
}
