"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairSnippet = repairSnippet;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const cache_1 = require("./cache");
const prompt_js_1 = require("../ai/prompt.js");
dotenv_1.default.config();
// Configure OpenAI client to use Ollama endpoint
const openai = new openai_1.default({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY
});
// Language-specific code start patterns (ordered by priority within each language)
const languagePatterns = {
    javascript: [/\(async\s*\(/, /async\s+(?:function|\()/, /const\s+\w/, /let\s+\w/, /var\s+\w/, /function\s+\w/, /import\s+/, /export\s+/, /module\./, /require\s*\(/],
    typescript: [/\(async\s*\(/, /async\s+(?:function|\()/, /const\s+\w/, /let\s+\w/, /var\s+\w/, /function\s+\w/, /import\s+/, /export\s+/, /interface\s+/, /type\s+\w/],
    python: [/^import\s+/m, /^from\s+\w+\s+import/, /^class\s+\w/, /^def\s+\w/, /^async\s+def/, /^print\s*\(/, /^if\s+__name__/],
    go: [/^package\s+\w/m, /^import\s+/, /^func\s+\w/, /^type\s+\w/],
    java: [/^package\s+/, /^import\s+/, /^public\s+class/, /^class\s+\w/],
    rust: [/^use\s+/, /^fn\s+main/, /^fn\s+\w/, /^struct\s+/, /^impl\s+/],
    ruby: [/^require\s+['"]/, /^class\s+\w/, /^def\s+\w/, /^puts\s+/, /^print\s+/],
    php: [/<\?php/, /^class\s+\w/, /^function\s+\w/, /^\$\w+\s*=/],
    bash: [/^#!/, /^echo\s+/, /^export\s+\w/, /^\w+\s*\(\)\s*\{/],
    shell: [/^#!/, /^echo\s+/, /^export\s+\w/],
    c: [/^#include\s*</, /^int\s+main/, /^void\s+\w/],
    cpp: [/^#include\s*</, /^int\s+main/, /^class\s+\w/, /^namespace\s+/],
    perl: [/^use\s+/, /^my\s+/, /^sub\s+\w/, /^print\s+/],
    lua: [/^local\s+/, /^function\s+\w/, /^print\s*\(/],
};
// Fallback patterns if language not found
const genericPatterns = [/^\/\//m, /^\/\*/m, /^#[^!]/m];
/**
 * Extract clean code from AI response by finding the earliest code pattern
 */
function extractCode(code, language) {
    const lang = language.toLowerCase();
    const patterns = languagePatterns[lang] || languagePatterns['javascript'] || genericPatterns;
    // Find the earliest match across all patterns
    let earliestIndex = -1;
    for (const pattern of patterns) {
        const match = code.search(pattern);
        if (match >= 0 && (earliestIndex === -1 || match < earliestIndex)) {
            earliestIndex = match;
        }
    }
    // Only trim if we found a match AND it's not at the start
    if (earliestIndex > 0) {
        return code.substring(earliestIndex);
    }
    return code;
}
async function repairSnippet(originalCode, language = 'javascript') {
    // Generate prompt with only the relevant language rules injected
    const systemPrompt = (0, prompt_js_1.codeRepairSystemPrompt)(language);
    try {
        // Check cache first
        const cached = (0, cache_1.getCachedRepair)(originalCode);
        if (cached) {
            return cached;
        }
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL_NAME,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: originalCode }
            ],
            temperature: 0.1,
        });
        let repairedCode = response.choices[0].message.content || originalCode;
        // Cleanup: remove markdown code blocks if the AI added them
        const codeBlockMatch = repairedCode.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        if (codeBlockMatch) {
            repairedCode = codeBlockMatch[1];
        }
        else {
            // Remove any leading explanatory text before the actual code
            repairedCode = extractCode(repairedCode, language);
        }
        repairedCode = repairedCode.trim();
        return repairedCode;
    }
    catch (error) {
        console.error("AI Repair Failed:", error);
        return originalCode; // Fallback to original
    }
}
