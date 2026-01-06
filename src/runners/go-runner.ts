import { BaseRunner } from './base-runner';

export class GoRunner extends BaseRunner {
    protected image = 'golang:1.20-alpine';
    protected inputFile = 'main.go';

    getExecuteCommand(): string {
        return `go run ${this.inputFile}`;
    }
}
