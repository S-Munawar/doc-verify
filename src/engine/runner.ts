import { getRunner, RunResult } from '@/runners/index.js';

export type { RunResult };

/**
 * Runs a code snippet inside a secure Docker container.
 * Supports multiple languages through the modular runner architecture.
 */
export async function runner(code: string, language: string): Promise<RunResult> {
    const languageRunner = getRunner(language);
    
    if (!languageRunner) {
        return { success: false, output: '', error: `Unsupported language: ${language}` };
    }
    
    return await languageRunner.run(code);
}

