"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPatch = applyPatch;
const fs_1 = __importDefault(require("fs"));
function applyPatch(filePath, lineStart, oldCode, newCode) {
    const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    // The Parser gives us the line number where the "```javascript" starts.
    // The actual code usually starts on lineStart + 1.
    // We need to count how many lines the OLD code took up
    const oldLinesCount = oldCode.split('\n').length;
    // Replace the lines
    // Note: lineStart is 1-based index from parser, array is 0-based.
    // We assume the code block content starts 1 line after the opening ```
    const startIdx = lineStart;
    // Remove old lines
    lines.splice(startIdx, oldLinesCount, ...newCode.split('\n'));
    // Write back
    fs_1.default.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}
