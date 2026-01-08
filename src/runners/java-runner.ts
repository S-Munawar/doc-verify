import { BaseRunner } from '@/runners/base-runner.js';

export class JavaRunner extends BaseRunner {
    protected image = 'eclipse-temurin:17-alpine';
    protected inputFile = 'Main.java';

    getExecuteCommand(): string {
        return `sh -c "javac ${this.inputFile} && java Main"`;
    }
}
