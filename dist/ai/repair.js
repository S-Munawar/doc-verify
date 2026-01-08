"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairSnippet = repairSnippet;
exports.debug = debug;
exports.generateCleanFix = generateCleanFix;
const openai_1 = __importDefault(require("openai"));
const cache_js_1 = require("@/ai/cache.js");
const prompt_js_1 = require("@/ai/prompt.js");
// Lazy-initialized OpenAI client
let _openai = null;
function getOpenAI() {
    if (!_openai) {
        _openai = new openai_1.default({
            baseURL: `${process.env.OPENAI_BASE_URL}/v1`,
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _openai;
}
// Language-specific code start patterns (ordered by priority within each language)
const languagePatterns = {
    javascript: [/\(async\s*\(/, /async\s+(?:function|\()/, /const\s+\w/, /let\s+\w/, /var\s+\w/, /function\s+\w/, /import\s+/, /export\s+/, /module\./, /require\s*\(/],
    typescript: [/\(async\s*\(/, /async\s+(?:function|\()/, /const\s+\w/, /let\s+\w/, /var\s+\w/, /function\s+\w/, /import\s+/, /export\s+/, /interface\s+/, /type\s+\w/],
    python: [/^import\s+/m, /^from\s+\w+\s+import/m, /^class\s+\w/m, /^def\s+\w/m, /^async\s+def/m, /^print\s*\(/m, /^if\s+__name__/m],
    go: [/^package\s+\w/m, /^import\s+/m, /^func\s+\w/m, /^type\s+\w/m],
    java: [/^package\s+/m, /^import\s+/m, /^public\s+class/m, /^class\s+\w/m],
    rust: [/^use\s+/m, /^fn\s+main/m, /^fn\s+\w/m, /^struct\s+/m, /^impl\s+/m],
    ruby: [/^require\s+['"]/m, /^class\s+\w/m, /^def\s+\w/m, /^puts\s+/m, /^print\s+/m],
    php: [/<\?php/, /^class\s+\w/m, /^function\s+\w/m, /^\$\w+\s*=/m],
    bash: [/^#!/m, /^echo\s+/m, /^export\s+\w/m, /^\w+\s*\(\)\s*\{/m],
    shell: [/^#!/m, /^echo\s+/m, /^export\s+\w/m],
    c: [/^#include\s*</m, /^int\s+main/m, /^void\s+\w/m],
    cpp: [/^#include\s*</m, /^int\s+main/m, /^class\s+\w/m, /^namespace\s+/m],
    perl: [/^use\s+/m, /^my\s+/m, /^sub\s+\w/m, /^print\s+/m],
    lua: [/^local\s+/m, /^function\s+\w/m, /^print\s*\(/m],
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
async function repairSnippet(index, originalCode, language = 'javascript') {
    // Generate prompt with only the relevant language rules injected
    const systemPrompt = (0, prompt_js_1.codeRepairSystemPrompt)(language);
    const OPENAI_MODEL_NAME = process.env.OPENAI_MODEL_NAME;
    try {
        // Check cache first
        const cached = (0, cache_js_1.getCachedRepair)(originalCode);
        if (cached) {
            return cached;
        }
        const response = await getOpenAI().chat.completions.create({
            model: OPENAI_MODEL_NAME,
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
        (0, cache_js_1.saveCachedRepair)(originalCode, repairedCode);
        return repairedCode;
    }
    catch (error) {
        return originalCode; // Fallback to original
    }
}
async function debug(originalCode, repairedCode, errorOutput, language = 'javascript') {
    const prompt = (0, prompt_js_1.debugPrompt)(originalCode, repairedCode, errorOutput, language);
    const response = await getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL_NAME,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: "Analyze the failure and provide debugging insights." }
        ],
        temperature: 0.3,
    });
    return response.choices[0].message.content || "No debug information available.";
}
async function generateCleanFix(brokenCode, errorMsg, language = 'javascript') {
    const prompt = (0, prompt_js_1.fixPrompt)(errorMsg, brokenCode);
    const response = await getOpenAI().chat.completions.create({
        model: `${process.env.OPENAI_MODEL_NAME}`,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: brokenCode }
        ],
        temperature: 0.1,
    });
    let fixed = response.choices[0].message.content || brokenCode;
    // Strip markdown code blocks if present
    const codeBlockMatch = fixed.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    if (codeBlockMatch) {
        fixed = codeBlockMatch[1];
    }
    else {
        // Use language-aware extraction to remove explanatory text
        fixed = extractCode(fixed, language);
    }
    return fixed.trim();
}
