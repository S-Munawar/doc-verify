import { BaseRunner } from './base-runner';

export class JavaRunner extends BaseRunner {
    protected image = 'eclipse-temurin:17-alpine';
    protected inputFile = 'Main.java';

    getExecuteCommand(): string {
        return `sh -c "javac ${this.inputFile} && java Main"`;
    }
}
