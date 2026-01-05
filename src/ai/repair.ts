import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Configure OpenAI client to use Ollama endpoint
const openai = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY
});

export async function repairSnippet(originalCode: string, language: string = 'javascript'): Promise<string> {
    
    const systemPrompt = `
    You are a Code Repair Agent for a documentation verification tool.
    Your goal is to make a code snippet EXECUTABLE in a standalone environment (Docker Node.js container).
    
    RULES:
    1. You must MOCK any missing variables, functions, or imports.
    2. If the code uses a library (like 'stripe' or 'react'), mock the library object. 
    3. Do NOT change the logic of the snippet itself.
    4. Do NOT output markdown formatting (like \`\`\`). Output RAW code only.
    5. If the code requires an async operation, wrap the whole thing in an IIFE: (async () => { ... })();
    
    EXAMPLE INPUT:
    const user = await db.getUser(1);
    console.log(user.name);

    EXAMPLE OUTPUT:
    (async () => {
      const db = { getUser: async (id) => ({ id, name: "Test User" }) }; // Mock added
      const user = await db.getUser(1);
      console.log(user.name);
    })();
    `;

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL_NAME!,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Language: ${language}\n\nCode:\n${originalCode}` }
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
            // Language-agnostic patterns for code start
            const codeStartPatterns = [
                // JavaScript/TypeScript
                /const\s+\w/,
                /let\s+\w/,
                /var\s+\w/,
                /function\s+\w/,
                /async\s+(?:function|\()/,
                /\(async\s*\(/,
                /import\s+/,
                /export\s+/,
                /module\./,
                /require\s*\(/,
                // Python
                /def\s+\w/,
                /class\s+\w/,
                /from\s+\w+\s+import/,
                /print\s*\(/,
                /if\s+__name__/,
                // Go
                /package\s+\w/,
                /func\s+\w/,
                /type\s+\w/,
                // Ruby
                /puts\s+/,
                /require\s+['"]/,
                // Java
                /public\s+(?:class|static|void)/,
                /private\s+/,
                /protected\s+/,
                // PHP
                /<\?php/,
                /echo\s+/,
                /\$\w+\s*=/,
                // Bash/Shell
                /^#!/,
                /echo\s+/,
                /export\s+\w/,
                // Generic
                /^\/\//m,  // Single-line comment
                /^\/\*/m,  // Multi-line comment start
                /^#[^!]/m, // Hash comment (Python, Ruby, Bash)
            ];
            
            for (const pattern of codeStartPatterns) {
                const match = repairedCode.search(pattern);
                if (match > 0) {
                    repairedCode = repairedCode.substring(match);
                    break;
                }
            }
        }

        return repairedCode.trim();

    } catch (error) {
        console.error("AI Repair Failed:", error);
        return originalCode; // Fallback to original
    }
}