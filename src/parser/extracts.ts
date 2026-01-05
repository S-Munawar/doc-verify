import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { Node } from 'unist';
import type { Code } from 'mdast';  // Import the official type

// Define what a "Snippet" looks like
export interface Snippet {
    language: string;
    code: string;
    line: number;
}
// example: { language: 'js', code: 'console.log("Hello World");', line: 10 }

export function extractSnippets(filePath: string): Snippet[] {
    // 1. Read the file
    let fileContent: string;
    try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        throw new Error(`Could not read file: ${filePath}`);
    }

    const snippets: Snippet[] = [];

    // 2. Parse Markdown into an AST (Tree)
    const tree = unified()
        .use(remarkParse)
        .parse(fileContent);
    // unified() creates a processor
    // .use(remarkParse) adds the markdown parser plugin
    // .parse(fileContent) parses the markdown content into an AST

    // 3. Walk the tree and find 'code' nodes
    visit(tree, 'code', (node: Code) => {
        // We push the snippet to our array
        snippets.push({
            language: node.lang || 'text', // Default to 'text' if no lang specified
            code: node.value,
            line: node.position?.start.line || 0,
        });
    });

    return snippets;
}