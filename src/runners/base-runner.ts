import Docker from 'dockerode';
import { Writable } from 'stream';
import { NETWORK_SHIM } from '../engine/mocks/network-shim';
import { TIMEOUT } from 'dns';

const docker = new Docker();

export interface RunResult {
    success: boolean;
    output: string;
    error?: string;
}

/**
 * Helper class to capture stream output into a string
 */
class OutputStream extends Writable {
    private data: string[] = [];

    _write(chunk: any, encoding: string, callback: () => void) {
        this.data.push(chunk.toString());
        callback();
    }

    getOutput(): string {
        return this.data.join('');
    }
}

/**
 * Abstract base class for all language runners.
 * Contains common Docker execution logic.
 */
export abstract class BaseRunner {
    protected abstract image: string;
    protected abstract inputFile: string;

    /**
     * Returns the command to execute the code file.
     * Override in subclasses for language-specific execution.
     */
    abstract getExecuteCommand(): string;

    /**
     * Optional preprocessing of code before execution.
     * Override in subclasses if needed (e.g., wrapping code).
     */
    preprocessCode(code: string): string {
        const finalCode = NETWORK_SHIM + '\n' + code;
        return finalCode;
    }

    /**
     * Runs the code snippet inside a secure Docker container.
     */
    async run(code: string): Promise<RunResult> {
        try {
            await this.ensureImage(this.image);

            // Preprocess the code if needed
            const processedCode = this.preprocessCode(code);

            // Base64 encode the code to avoid shell escaping issues.
            const b64Code = Buffer.from(processedCode).toString('base64');
            const execCmd = this.getExecuteCommand();
            const command = `echo "${b64Code}" | base64 -d > ${this.inputFile} && ${execCmd}`;

            // Create output stream to capture stdout/stderr
            const outputStream = new OutputStream();

            // Run the container
            const [data, container] = await docker.run(
                this.image,
                ['sh', '-c', command],
                outputStream,
                {
                    Tty: false,
                    Entrypoint: [], // Override entrypoint for images like Deno
                    HostConfig: {
                        AutoRemove: true,
                        Memory: 128 * 1024 * 1024, // 128MB RAM limit
                        NetworkMode: 'none' // Disable network (sandbox)
                    }
                }
            );

            const exitCode = data.StatusCode;
            const output = outputStream.getOutput();

            if (exitCode !== 0) {
                return { success: false, output, error: `Exited with code ${exitCode}` };
            }

            return { success: true, output };

        } catch (err: any) {
            return { success: false, output: '', error: err.message };
        }
    }

    /**
     * Pulls the Docker image if it doesn't exist locally.
     */
    private async ensureImage(imageName: string): Promise<void> {
        const images = await docker.listImages();
        const exists = images.some(img => img.RepoTags?.includes(imageName));

        if (exists) return;

        console.log(`⬇️  Pulling Docker image ${imageName}... (this happens once)`);

        await new Promise((resolve, reject) => {
            docker.pull(imageName, (err: any, stream: any) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(err: any, output: any) {
                    if (err) return reject(err);
                    resolve(output);
                }
                function onProgress(event: any) {
                    while (event) {
                        console.log(".");
                        break;
                    }
                }
            });
        });

        console.log('✅ Image downloaded.');
    }
}
