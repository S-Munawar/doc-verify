import { BaseRunner } from '@/runners/base-runner.js';

export class RubyRunner extends BaseRunner {
    protected image = 'ruby:3.2-alpine';
    protected inputFile = 'script.rb';

    getExecuteCommand(): string {
        return `ruby ${this.inputFile}`;
    }
}
