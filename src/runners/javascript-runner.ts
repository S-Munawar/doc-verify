import { BaseRunner } from '@/runners/base-runner.js';
import { NETWORK_SHIM } from '@/engine/mocks/network-shim.js';

export class JavaScriptRunner extends BaseRunner {
    protected image = 'node:18-alpine';
    protected inputFile = 'script.js';

    getExecuteCommand(): string {
        return `node ${this.inputFile}`;
    }

    preprocessCode(code: string): string {
        return NETWORK_SHIM + '\n' + code;
    }
}
