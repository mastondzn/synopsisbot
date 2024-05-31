import type { Buffer } from 'node:buffer';
import { type Hash, createHash } from 'node:crypto';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

// construct a string from the modification date, the filename and the filesize
async function hashFile(path: string, hash: Hash) {
    const statInfo = await stat(path);
    const fileInfo = `${path}:${statInfo.size}:${statInfo.mtimeMs}`;
    hash.update(fileInfo);
}

/**
 * Creates hash of given files/folders. Used to conditionally deploy custom
 * resources depending if source files have changed
 */
export async function computeMetaHash(target: string): Promise<Buffer>;
export async function computeMetaHash(target: string, inputHash: Hash): Promise<null>;
export async function computeMetaHash(target: string, inputHash?: Hash): Promise<Buffer | null> {
    const hash = inputHash ?? createHash('sha256');

    // check if its a file
    const statInfo = await stat(target);
    if (statInfo.isFile()) {
        await hashFile(target, hash);
        if (!inputHash) return hash.digest();
        return null;
    }

    const info = await readdir(target, { withFileTypes: true });

    // sort the directory entries to ensure consistent hash
    for (const item of info.sort((a, b) => a.name.localeCompare(b.name))) {
        const fullPath = join(target, item.name);
        if (item.isFile()) {
            await hashFile(fullPath, hash);
        } else if (item.isDirectory()) {
            // recursively walk sub-folders
            await computeMetaHash(fullPath, hash);
        }
    }
    // if not being called recursively, get the digest and return it as the hash result
    if (!inputHash) {
        return hash.digest();
    }

    return null;
}
