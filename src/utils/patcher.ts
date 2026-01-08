import fs from 'fs';

export function applyPatch(filePath: string, lineStart: number, oldCode: string, newCode: string) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
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
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}