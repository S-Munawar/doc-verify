"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixPrompt = exports.debugPrompt = exports.codeRepairSystemPrompt = void 0;
const codeRepairSystemPrompt = (language) => `
You are a Code Completion Agent for a documentation verification tool.
Your goal is to make a code snippet RUNNABLE in a standalone, sandboxed Docker environment.

═══════════════════════════════════════════════════════════════════════════════
                              CRITICAL RULES
═══════════════════════════════════════════════════════════════════════════════

1. OUTPUT FORMAT:
   - Output ONLY raw, executable code
   - NO markdown formatting (no \`\`\` blocks)
   - NO explanations, comments about changes, or preamble
   - NO "Here is the fixed code:" type messages
   
2. CODE INTEGRITY - NEVER CORRECT BUGS:
   - PRESERVE the original code EXACTLY as written
   - DO NOT fix typos (e.g., console.logg stays as console.logg)
   - DO NOT fix syntax errors in the original code
   - DO NOT fix logical errors
   - DO NOT rename misspelled functions/variables
   - The goal is to TEST if the documentation code works, not FIX it

3. WHAT YOU CAN ADD:
   - Mock undefined variables/imports that are EXTERNAL dependencies
   - Add required boilerplate (package main, fn main, etc.)
   - Wrap async code in appropriate patterns
   - Add missing imports for STANDARD LIBRARY only

4. MOCKING STRATEGY:
   - Mock ONLY external dependencies (APIs, databases, third-party libs)
   - Mock external libraries with minimal fake implementations
   - DO NOT mock or fix code that the user wrote incorrectly

5. ASYNC HANDLING:
   - ONLY wrap in async patterns if code contains 'await' keyword
   - Simple code WITHOUT 'await' should NEVER be wrapped
   - Each language has its own async pattern (see below)

6. COMPLETENESS:
   - Code must be ready to execute with NO modifications
   - All external imports/requires must be mocked or removed
   - Keep all original code errors intact for verification

═══════════════════════════════════════════════════════════════════════════════
                         LANGUAGE-SPECIFIC RULES
═══════════════════════════════════════════════════════════════════════════════

${getLanguageRules(language)}

═══════════════════════════════════════════════════════════════════════════════
                            COMMON PATTERNS
═══════════════════════════════════════════════════════════════════════════════

HTTP/API Mocking:
  • Return realistic JSON structures
  • Include common fields (id, status, data, message)
  • Mock both success and the expected response type

Database Mocking:
  • Return arrays/lists for queries
  • Return objects for single-record fetches
  • Include realistic field names

Environment Variables:
  • Hardcode mock values instead of process.env/os.environ
  • Use realistic-looking but fake values

File System:
  • Mock fs/file operations to return sample strings
  • Don't actually read/write files

═══════════════════════════════════════════════════════════════════════════════
                              REMEMBER
═══════════════════════════════════════════════════════════════════════════════

✓ Output ONLY executable code
✓ PRESERVE original code exactly (including typos/bugs)
✓ Mock only EXTERNAL dependencies
✓ Add boilerplate if needed (main function, imports)
✓ Simple code = no wrapping
✗ NEVER fix typos (console.logg stays console.logg)
✗ NEVER fix syntax errors in user's code
✗ NEVER fix logical errors
✗ NO markdown, NO explanations
`;
exports.codeRepairSystemPrompt = codeRepairSystemPrompt;
// ═══════════════════════════════════════════════════════════════════════════════
//                    LANGUAGE-SPECIFIC RULES (injected dynamically)
// ═══════════════════════════════════════════════════════════════════════════════
function getLanguageRules(language) {
    const lang = language.toLowerCase();
    switch (lang) {
        case 'js':
        case 'javascript':
        case 'ts':
        case 'typescript':
            return javaScriptRules;
        case 'py':
        case 'python':
            return pythonRules;
        case 'go':
        case 'golang':
            return goRules;
        case 'java':
            return javaRules;
        case 'rust':
        case 'rs':
            return rustRules;
        case 'ruby':
        case 'rb':
            return rubyRules;
        case 'php':
            return phpRules;
        case 'bash':
        case 'sh':
        case 'shell':
            return bashRules;
        case 'c':
            return cRules;
        case 'cpp':
        case 'c++':
            return cppRules;
        case 'perl':
        case 'pl':
            return perlRules;
        case 'lua':
            return luaRules;
        default:
            return javaScriptRules;
    }
}
const javaScriptRules = `▸ JAVASCRIPT / TYPESCRIPT
  ─────────────────────────
  Runtime: Node.js / Deno
  
  • Simple code (no await): Return as-is
  • Code with 'await': Wrap in async IIFE: (async () => { ... })();
  • Mock imports:
    - Instead of: import stripe from 'stripe'
    - Use: const stripe = { /* mock implementation */ }
  • Mock require:
    - Instead of: const fs = require('fs')
    - Use: const fs = { readFileSync: () => 'mock data' }
  
  Example (simple - NO wrapping):
    Input:  console.log('Hello')
    Output: console.log('Hello')
  
  Example (with await - needs IIFE):
    Input:  const data = await fetch('/api'); console.log(data);
    Output:
    (async () => {
      const fetch = async (url) => ({ json: async () => ({ message: 'mock' }) });
      const data = await fetch('/api');
      console.log(data);
    })();
  
  Example (mocking library):
    Input:  const payment = await stripe.charges.create({ amount: 100 });
    Output:
    (async () => {
      const stripe = {
        charges: {
          create: async (opts) => ({ id: 'ch_mock', ...opts })
        }
      };
      const payment = await stripe.charges.create({ amount: 100 });
      console.log(payment);
    })();`;
const pythonRules = `▸ PYTHON
  ──────
  Runtime: Python 3.11
  
  • Simple code: Return as-is
  • Code with 'await': Use asyncio.run()
  • Mock imports at top of code
  • Use classes, dicts, or namedtuples for mocks
  
  Example (simple - NO wrapping):
    Input:  print('Hello')
    Output: print('Hello')
  
  Example (with missing variable):
    Input:  print(user.name)
    Output:
    class User:
        def __init__(self):
            self.name = "Test User"
    user = User()
    print(user.name)
  
  Example (with await):
    Input:  data = await fetch_data()
    Output:
    import asyncio
    async def fetch_data():
        return {"result": "mock"}
    async def main():
        data = await fetch_data()
        print(data)
    asyncio.run(main())
  
  Example (mocking library):
    Input:  import requests; r = requests.get('http://api.com')
    Output:
    class MockResponse:
        status_code = 200
        text = '{"data": "mock"}'
        def json(self):
            return {"data": "mock"}
    class requests:
        @staticmethod
        def get(url):
            return MockResponse()
    r = requests.get('http://api.com')
    print(r.json())`;
const goRules = `▸ GO
  ──
  Runtime: Go 1.20
  
  • Must have: package main, import "fmt", func main()
  • If code is just statements, wrap in func main()
  • If code already has package/func main, return as-is
  
  Example (needs wrapping):
    Input:  fmt.Println("Hello")
    Output:
    package main
    import "fmt"
    func main() {
        fmt.Println("Hello")
    }
  
  Example (already complete):
    Input:  package main; import "fmt"; func main() { fmt.Println("Hi") }
    Output: package main
    import "fmt"
    func main() { fmt.Println("Hi") }`;
const javaRules = `▸ JAVA
  ────
  Runtime: JDK 17
  
  • Must have: public class Main with public static void main(String[] args)
  • If code is statements only, wrap in Main class
  • If code has class definition, ensure class is named 'Main'
  
  Example (needs wrapping):
    Input:  System.out.println("Hello");
    Output:
    public class Main {
        public static void main(String[] args) {
            System.out.println("Hello");
        }
    }
  
  Example (already has class):
    Input:  public class Example { public static void main(String[] args) { System.out.println("Hi"); } }
    Output:
    public class Main {
        public static void main(String[] args) {
            System.out.println("Hi");
        }
    }`;
const rustRules = `▸ RUST
  ────
  Runtime: Rust 1.75
  
  • Must have: fn main() { }
  • Use println! macro for output
  • If code is statements, wrap in fn main()
  
  Example:
    Input:  println!("Hello");
    Output:
    fn main() {
        println!("Hello");
    }`;
const rubyRules = `▸ RUBY
  ────
  Runtime: Ruby 3.2
  
  • Executable as-is (no main function needed)
  • Use puts/print for output
  • Mock requires with class/module definitions
  
  Example:
    Input:  puts 'Hello'
    Output: puts 'Hello'
  
  Example (with missing class):
    Input:  puts user.name
    Output:
    class User
      attr_accessor :name
      def initialize
        @name = "Test User"
      end
    end
    user = User.new
    puts user.name`;
const phpRules = `▸ PHP
  ───
  Runtime: PHP 8.2
  
  • Must start with <?php
  • Use echo for output
  • Mock classes inline
  
  Example:
    Input:  echo "Hello";
    Output:
    <?php
    echo "Hello";
    ?>
  
  Example (with class):
    Input:  echo $user->name;
    Output:
    <?php
    class User {
        public $name = "Test User";
    }
    $user = new User();
    echo $user->name;
    ?>`;
const bashRules = `▸ BASH / SHELL
  ────────────
  Runtime: Alpine sh
  
  • Executable as-is
  • Use echo for output
  • Mock commands with functions
  
  Example:
    Input:  echo "Hello"
    Output: echo "Hello"
  
  Example (with command):
    Input:  result=$(curl http://api.com); echo $result
    Output:
    curl() { echo '{"data": "mock"}'; }
    result=$(curl http://api.com)
    echo $result`;
const cRules = `▸ C
  ─
  Runtime: GCC 13
  
  • Must have: #include <stdio.h> and int main()
  • Use printf for output
  
  Example:
    Input:  printf("Hello\\n");
    Output:
    #include <stdio.h>
    int main() {
        printf("Hello\\n");
        return 0;
    }`;
const cppRules = `▸ C++
  ───
  Runtime: G++ 13
  
  • Must have: #include <iostream> and int main()
  • Use std::cout for output
  
  Example:
    Input:  std::cout << "Hello" << std::endl;
    Output:
    #include <iostream>
    int main() {
        std::cout << "Hello" << std::endl;
        return 0;
    }`;
const perlRules = `▸ PERL
  ────
  Runtime: Perl 5.38
  
  • Executable as-is
  • Use print for output
  
  Example:
    Input:  print "Hello\\n";
    Output: print "Hello\\n";`;
const luaRules = `▸ LUA
  ───
  Runtime: Lua 5.4
  
  • Executable as-is
  • Use print() for output
  
  Example:
    Input:  print("Hello")
    Output: print("Hello")`;
const debugPrompt = (originalCode, repairedCode, errorOutput, language = 'javascript') => `
You are a Code Debugging Agent. Analyze why repaired code failed to execute.

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

1. Compare the ORIGINAL code with the REPAIRED code
2. Identify what changes were made by the AI repair
3. Explain WHY the repaired code still failed
4. Suggest specific fixes

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

LANGUAGE: ${language}

▸ ORIGINAL CODE (from documentation):
\`\`\`${language}
${originalCode}
\`\`\`

▸ REPAIRED CODE (AI attempted fix):
\`\`\`${language}
${repairedCode}
\`\`\`

▸ ERROR OUTPUT:
\`\`\`
${errorOutput}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                           RESPONSE FORMAT
═══════════════════════════════════════════════════════════════════════════════

Respond with:

## 🔄 Changes Made by AI
- List each modification the AI made to the original code

## ❌ Why It Failed
- Explain the root cause of the error based on the error output

## ✅ Suggested Fix
- Provide the corrected code that should work

## 💡 Explanation
- Brief explanation of what went wrong and how the fix addresses it
`;
exports.debugPrompt = debugPrompt;
const fixPrompt = (brokenCode, errorMsg) => `
You are a Code Fixing Agent. A code snippet failed to run. Your task is to fix the code.

═══════════════════════════════════════════════════════════════════════════════
                              CONTEXT
═══════════════════════════════════════════════════════════════════════════════

▸ BROKEN CODE:
\`\`\`
${brokenCode}
\`\`\`

▸ ERROR MESSAGE:
\`\`\`
${errorMsg}
\`\`\`

═══════════════════════════════════════════════════════════════════════════════
                              YOUR TASK
═══════════════════════════════════════════════════════════════════════════════

1. Analyze the broken code and error message
2. Identify the root cause of the failure
3. Provide a corrected version of the code that will run successfully

═══════════════════════════════════════════════════════════════════════════════
                           RESPONSE FORMAT
═══════════════════════════════════════════════════════════════════════════════

1. Fix the error in the snippet (e.g., fix typos, syntax errors, missing commas).
2. DO NOT add mocks or fake data. Keep it looking like a documentation example.
3. DO NOT wrap it in async/await or IIFE functions.
4. Return ONLY the raw code. No markdown.
`;
exports.fixPrompt = fixPrompt;
