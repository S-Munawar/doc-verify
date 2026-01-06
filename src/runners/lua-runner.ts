import { BaseRunner } from './base-runner';

export class LuaRunner extends BaseRunner {
    protected image = 'nickblah/lua:5.4-alpine';
    protected inputFile = 'script.lua';

    getExecuteCommand(): string {
        return `lua ${this.inputFile}`;
    }
}
