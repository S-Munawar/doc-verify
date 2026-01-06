import { BaseRunner } from './base-runner';

export class TypeScriptRunner extends BaseRunner {
    protected image = 'denoland/deno:latest';
    protected inputFile = 'script.ts';

    getExecuteCommand(): string {
        return `deno run --allow-all ${this.inputFile}`;
    }
}
