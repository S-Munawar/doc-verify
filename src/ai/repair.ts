import OpenAI from 'openai';
import { getCachedRepair, saveCachedRepair } from './cache';
import { codeRepairSystemPrompt, debugPrompt } from '../ai/prompt.js';
import { fixPrompt } from '../ai/prompt.js';

// Lazy-initialized OpenAI client
let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({
            baseURL: `${process.env.OPENAI_BASE_URL}/v1`,
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _openai;
}

// Language-specific code start patterns (ordered by priority within each language)
const languagePatterns: Record<string, RegExp[]> = {
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
function extractCode(code: string, language: string): string {
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

export async function repairSnippet(index: number, originalCode: string, language: string = 'javascript'): Promise<string> {
    
    // Generate prompt with only the relevant language rules injected
    const systemPrompt = codeRepairSystemPrompt(language);
    const OPENAI_MODEL_NAME = process.env.OPENAI_MODEL_NAME!;

    try {
        // Check cache first
        const cached = getCachedRepair(originalCode);
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
        } else {
            // Remove any leading explanatory text before the actual code
            repairedCode = extractCode(repairedCode, language);
        }
        
        repairedCode = repairedCode.trim();
        saveCachedRepair(originalCode, repairedCode);
        return repairedCode;

    } catch (error) {
        return originalCode; // Fallback to original
    }
}

export async function debug(
    originalCode: string, 
    repairedCode: string, 
    errorOutput: string,
    language: string = 'javascript'
): Promise<string> {
    const prompt = debugPrompt(originalCode, repairedCode, errorOutput, language);

    const response = await getOpenAI().chat.completions.create({
        model: process.env.OPENAI_MODEL_NAME!,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: "Analyze the failure and provide debugging insights." }
        ],
        temperature: 0.3,
    });
    return response.choices[0].message.content || "No debug information available.";
}

export async function generateCleanFix(brokenCode: string, errorMsg: string, language: string = 'javascript'): Promise<string> {
    
    const prompt = fixPrompt(errorMsg, brokenCode);

    const response = await getOpenAI().chat.completions.create({
        model: `${process.env.OPENAI_MODEL_NAME!}`,
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
    } else {
        // Use language-aware extraction to remove explanatory text
        fixed = extractCode(fixed, language);
    }
    
    return fixed.trim();
}