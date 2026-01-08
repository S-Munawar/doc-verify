import fs from 'fs';
import chalk from 'chalk';

export function updateBadge(filePath: string) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Get today's date (e.g., "Jan_07")
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(/ /g, '_');
    

    const badgeImage = `![Verified](https://img.shields.io/badge/Docs_Verified-${dateStr}-2ea44f)`;
    const fullBadgeLine = `${badgeImage}`;

    const badgeRegex = /!\[Verified\]\(https:\/\/img\.shields\.io\/badge\/Docs_Verified-[^)]+-2ea44f\)/


    if (badgeRegex.test(content)) {
    // Replace existing badge
    content = content.replace(badgeRegex, fullBadgeLine);
    } else {
        // ➕ Add badge at top
        content = `${fullBadgeLine}\n\n${content}`;
    }

    fs.writeFileSync(filePath, content, 'utf-8');
}