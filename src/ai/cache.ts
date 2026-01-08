import fs from 'fs';
import crypto from 'crypto';

const CACHE_FILE = '.docverify-cache.json';

export function getCachedRepair(code: string): string | null {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const cache: Record<string, string> = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    return cache[hash] || null;
}

export function saveCachedRepair(code: string, repaired: string): void {
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    let cache: Record<string, string> = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
    cache[hash] = repaired;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { flag: 'w' });
}

export function clearCache(code?: string): void {
    if (!fs.existsSync(CACHE_FILE)) return;
    if (code) {
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        let cache: Record<string, string> = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        if (cache[hash]) {
            delete cache[hash];
            fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { flag: 'w' });
        }
    } else {
        fs.unlinkSync(CACHE_FILE);
    }
}