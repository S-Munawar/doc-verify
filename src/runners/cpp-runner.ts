import { BaseRunner } from './base-runner';

export class CppRunner extends BaseRunner {
    protected image = 'gcc:13-bookworm';
    protected inputFile = 'main.cpp';

    getExecuteCommand(): string {
        return `sh -c "g++ ${this.inputFile} -o main && ./main"`;
    }
}
