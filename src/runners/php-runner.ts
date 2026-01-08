import { BaseRunner } from '@/runners/base-runner.js';

export class PhpRunner extends BaseRunner {
    protected image = 'php:8.2-cli-alpine';
    protected inputFile = 'script.php';

    getExecuteCommand(): string {
        return `php ${this.inputFile}`;
    }
}
