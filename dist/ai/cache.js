"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedRepair = getCachedRepair;
exports.saveCachedRepair = saveCachedRepair;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const CACHE_FILE = '.docverify-cache.json';
function getCachedRepair(code) {
    if (!fs_1.default.existsSync(CACHE_FILE))
        return null;
    const cache = JSON.parse(fs_1.default.readFileSync(CACHE_FILE, 'utf-8'));
    const hash = crypto_1.default.createHash('sha256').update(code).digest('hex');
    const cached = cache[hash] || null;
    console.log('Cache lookup. Found:', cached ? 'Yes' : 'No');
    return cached;
}
function saveCachedRepair(code, repaired) {
    const hash = crypto_1.default.createHash('sha256').update(code).digest('hex');
    let cache = {};
    if (fs_1.default.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs_1.default.readFileSync(CACHE_FILE, 'utf-8'));
    }
    cache[hash] = repaired;
    fs_1.default.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { flag: 'w' });
    console.log('Saved repair to cache with hash.');
}
