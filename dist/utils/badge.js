"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBadge = updateBadge;
const fs_1 = __importDefault(require("fs"));
function updateBadge(filePath) {
    if (!fs_1.default.existsSync(filePath))
        return;
    let content = fs_1.default.readFileSync(filePath, 'utf-8');
    // 1. Get today's date (e.g., "Jan_07")
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(/ /g, '_');
    const badgeImage = `![Verified](https://img.shields.io/badge/Docs_Verified-${dateStr}-2ea44f)`;
    const fullBadgeLine = `${badgeImage}`;
    const badgeRegex = /!\[Verified\]\(https:\/\/img\.shields\.io\/badge\/Docs_Verified-[^)]+-2ea44f\)/;
    if (badgeRegex.test(content)) {
        // Replace existing badge
        content = content.replace(badgeRegex, fullBadgeLine);
    }
    else {
        // ➕ Add badge at top
        content = `${fullBadgeLine}\n\n${content}`;
    }
    fs_1.default.writeFileSync(filePath, content, 'utf-8');
}
