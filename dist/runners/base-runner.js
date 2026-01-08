"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRunner = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const stream_1 = require("stream");
const docker = new dockerode_1.default();
/**
 * Helper class to capture stream output into a string
 */
class OutputStream extends stream_1.Writable {
    data = [];
    _write(chunk, encoding, callback) {
        // Docker multiplex stream has 8-byte headers; strip control characters
        let text = chunk.toString();
        // Remove Docker stream header bytes and control characters
        text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
        this.data.push(text);
        callback();
    }
    getOutput() {
        return this.data.join('').trim();
    }
}
/**
 * Abstract base class for all language runners.
 * Contains common Docker execution logic.
 */
class BaseRunner {
    /**
     * Optional preprocessing of code before execution.
     * Override in subclasses if needed (e.g., wrapping code).
     */
    preprocessCode(code) {
        return code;
    }
    /**
     * Runs the code snippet inside a secure Docker container.
     */
    async run(code) {
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
            const [data, container] = await docker.run(this.image, ['sh', '-c', command], outputStream, {
                Tty: false,
                Entrypoint: [], // Override entrypoint for images like Deno
                HostConfig: {
                    AutoRemove: true,
                    Memory: 128 * 1024 * 1024, // 128MB RAM limit
                    NetworkMode: 'none' // Disable network (sandbox)
                }
            });
            const exitCode = data.StatusCode;
            const output = outputStream.getOutput();
            if (exitCode !== 0) {
                return { success: false, output, error: `Exited with code ${exitCode}` };
            }
            return { success: true, output };
        }
        catch (err) {
            return { success: false, output: '', error: err.message };
        }
    }
    /**
     * Pulls the Docker image if it doesn't exist locally.
     */
    async ensureImage(imageName) {
        const images = await docker.listImages();
        const exists = images.some(img => img.RepoTags?.includes(imageName));
        if (exists)
            return;
        await new Promise((resolve, reject) => {
            docker.pull(imageName, (err, stream) => {
                if (err)
                    return reject(err);
                docker.modem.followProgress(stream, onFinished);
                function onFinished(err, output) {
                    if (err)
                        return reject(err);
                    resolve(output);
                }
            });
        });
    }
}
exports.BaseRunner = BaseRunner;
