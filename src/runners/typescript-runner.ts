import { BaseRunner } from '@/runners/base-runner.js';
import { NETWORK_SHIM } from '@/engine/mocks/network-shim.js';

export class TypeScriptRunner extends BaseRunner {
    protected image = 'denoland/deno:latest';
    protected inputFile = 'script.ts';

    getExecuteCommand(): string {
        return `deno run --allow-all ${this.inputFile}`;
    }

    preprocessCode(code: string): string {
        return NETWORK_SHIM + '\n' + code;
    }
}
