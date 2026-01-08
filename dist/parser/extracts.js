"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSnippets = extractSnippets;
const fs_1 = __importDefault(require("fs"));
const unified_1 = require("unified");
const remark_parse_1 = __importDefault(require("remark-parse"));
const unist_util_visit_1 = require("unist-util-visit");
// example: { language: 'js', code: 'console.log("Hello World");', line: 10 }
function extractSnippets(filePath) {
    // 1. Read the file
    let fileContent;
    try {
        fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
    }
    catch (error) {
        throw new Error(`Could not read file: ${filePath}`);
    }
    const snippets = [];
    // 2. Parse Markdown into an AST (Tree). AST = Abstract Syntax Tree
    const tree = (0, unified_1.unified)()
        .use(remark_parse_1.default)
        .parse(fileContent);
    // unified() creates a processor to which we can add plugins
    // .use(remarkParse) adds the markdown parser plugin
    // .parse(fileContent) parses the markdown content into an AST
    // 3. Walk the tree and find 'code' nodes
    (0, unist_util_visit_1.visit)(tree, 'code', (node) => {
        // We push the snippet to our array
        snippets.push({
            language: node.lang || 'text', // Default to 'text' if no lang specified
            code: node.value,
            line: node.position?.start.line || 0,
        });
    });
    return snippets;
}
