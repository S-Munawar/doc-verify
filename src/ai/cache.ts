import fs from 'fs';
import crypto from 'crypto';

const CACHE_FILE = '.docverify-cache.json';

export function getCachedRepair(code: string): string | null {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const cache: Record<string, string> = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const cached = cache[hash] || null;
    console.log('Cache lookup. Found:', cached ? 'Yes' : 'No');
    return cached;
}

export function saveCachedRepair(code: string, repaired: string, index: number = 0): void {
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    let cache: Record<string, string> = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
    cache[hash] = repaired;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { flag: 'w' });
    console.log(`Saved repair to cache with hash. Snippet #${index}`);
}

export function clearCache(code?: string, index?: number): void {
    if (!fs.existsSync(CACHE_FILE)) {
        console.log('Cache file does not exist. Nothing to clear.');
        return;
    };
    if (code) {
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        let cache: Record<string, string> = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        if (cache[hash]) {
            delete cache[hash];
            fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), { flag: 'w' });
            console.log('Cleared cache entry for the given code snippet.');
        } else {
            console.log('No cache entry found for the given code snippet.');
        }
    } 
    else {
        fs.unlinkSync(CACHE_FILE);
        console.log('Cleared entire cache.');
    }
}