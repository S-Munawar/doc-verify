import Docker from 'dockerode';
import { Writable } from 'stream';

const docker = new Docker();

interface RunResult {
    success: boolean;
    output: string;
    error?: string;
}

/**
 * Runs a JavaScript code snippet inside a secure Node.js Docker container.
 */
export async function runner(code: string, language: string): Promise<RunResult> {
    // const IMAGE = 'node:18-alpine';

    let IMAGE: string;
    let INPUT_FILE: string;
    let EXEC_CMD: string;
    switch (language) 
    {
        case 'js':
        case 'javascript':
            IMAGE = 'node:18-alpine';
            INPUT_FILE = 'script.js';
            EXEC_CMD = `node ${INPUT_FILE}`;
            break;
        case 'ts':
        case 'typescript':
            IMAGE = 'denoland/deno:latest';
            INPUT_FILE = 'script.ts';
            EXEC_CMD = `deno run --allow-all ${INPUT_FILE}`;
            break;
        case 'python':
        case 'py':
            IMAGE = 'python:3.11-alpine';
            INPUT_FILE = 'app.py';
            EXEC_CMD = `python ${INPUT_FILE}`;
            break;
        case 'go':
        case 'golang':
            IMAGE = 'golang:1.20-alpine';
            INPUT_FILE = 'main.go';
            EXEC_CMD = `go run ${INPUT_FILE}`;
            break;
        default:
            return { success: false, output: '', error: `Unsupported language: ${language}` };
    }

    try {
        await ensureImage(IMAGE);
        // 1. Prepare the payload
        // We Base64 encode the code to avoid shell escaping hell when passing it via command line
        const b64Code = Buffer.from(code).toString('base64');
        const command = `echo "${b64Code}" | base64 -d > ${INPUT_FILE} && ${EXEC_CMD}`; // Decode and run

        // 2. Create the Container
        // We use a Writable stream to capture stdout/stderr from the container. stdout: & stderr:
        const outputStream = new WritableStream();
        
        
        // This helper from dockerode handles pulling, creating, starting, and attaching
        // It returns the result of the run.
        const [data, container] = await docker.run(
            IMAGE,
            ['sh', '-c', command],
            outputStream,
            {
                Tty: false, // Turn off TTY for easier output capture.
                Entrypoint: [], // Override entrypoint for images like Deno that have custom entrypoints
                HostConfig: {
                    AutoRemove: true, // Delete container after finish
                    Memory: 128 * 1024 * 1024, // Limit to 128MB RAM
                    NetworkMode: 'none' // Disable internet access (Sandbox!)
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
 * HELPER: Pulls the docker image if it doesn't exist locally
 */
async function ensureImage(imageName: string) {
    // Check if image exists locally
    const images = await docker.listImages();
    const exists = images.some(img => img.RepoTags?.includes(imageName));

    if (exists) return;

    console.log(`⬇️  Pulling Docker image ${imageName}... (this happens once)`);
    
    // Pull the image
    await new Promise((resolve, reject) => {
        docker.pull(imageName, (err: any, stream: any) => {
            if (err) return reject(err);
            // Dockerode returns a stream we must follow to completion
            docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err: any, output: any) {
                if (err) return reject(err);
                resolve(output);
            }
            function onProgress(event: any) {
                // Optional: print loading bars
            }
        });
    });
    console.log('✅ Image downloaded.');
}

/**
 * Helper class to capture stream output into a string
 */
class WritableStream extends Writable {
    private data: string[] = [];

    _write(chunk: any, encoding: string, callback: () => void) {
        this.data.push(chunk.toString());
        callback();
    }

    getOutput(): string {
        return this.data.join('');
    }
}

