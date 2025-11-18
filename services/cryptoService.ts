import { HashAlgorithm } from '../types';

const workerCode = `
/*
 * This is a straightforward implementation of MD5 in JavaScript.
 * It is designed to work with ArrayBuffer inputs, which is what the File API provides.
 * The implementation follows the algorithm described in RFC 1321.
 */
function calculateMD5FromArrayBuffer(buf) {
    const K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
        0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
        0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
        0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
        0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
        0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
    ];

    const S = [
        7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
        9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
        16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
        15, 21,
    ];

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    const str = new Uint8Array(buf);
    const len = str.length;

    const n_words = (((len + 8) >>> 6) + 1) * 16;
    const words = new Int32Array(n_words);

    for (let i = 0; i < len; i++) {
        words[i >>> 2] |= str[i] << ((i % 4) * 8);
    }
    words[len >>> 2] |= 0x80 << ((len % 4) * 8);
    words[n_words - 2] = len * 8;

    for (let i = 0; i < n_words; i += 16) {
        let A = a, B = b, C = c, D = d;

        for (let j = 0; j < 64; j++) {
            let F, g;
            if (j < 16) {
                F = (B & C) | (~B & D);
                g = j;
            } else if (j < 32) {
                F = (D & B) | (~D & C);
                g = (1 + 5 * j) % 16;
            } else if (j < 48) {
                F = B ^ C ^ D;
                g = (5 + 3 * j) % 16;
            } else {
                F = C ^ (B | ~D);
                g = (7 * j) % 16;
            }
            const tmp = D;
            D = C;
            C = B;
            const rot = A + F + K[j] + words[i + g];
            B = B + ((rot << S[j]) | (rot >>> (32 - S[j])));
            A = tmp;
        }

        a = (a + A) | 0;
        b = (b + B) | 0;
        c = (c + C) | 0;
        d = (d + D) | 0;
    }

    const toHex = (n) => ('00' + (n & 0xff).toString(16)).slice(-2);
    let result = '';
    for (const val of [a, b, c, d]) {
        for (let i = 0; i < 4; i++) {
            result += toHex(val >> (i * 8));
        }
    }
    return result;
}

self.onmessage = async (e) => {
    const { file, algorithm } = e.data;

    if (!file || !algorithm) {
        self.postMessage({ error: 'Invalid arguments received by worker.' });
        return;
    }

    try {
        const buffer = await file.arrayBuffer();
        let hash;

        if (algorithm === 'MD5') {
            hash = calculateMD5FromArrayBuffer(buffer);
        } else {
            const hashBuffer = await self.crypto.subtle.digest(algorithm, buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        
        self.postMessage({ hash });

    } catch (error) {
        self.postMessage({ error: error.message || 'An unknown error occurred in the hash worker.' });
    }
};
`;

/**
 * Calculates the cryptographic hash of a file using a Web Worker
 * to avoid blocking the main thread, making the UI responsive for large files.
 * @param file The file to hash.
 * @param algorithm The hashing algorithm to use.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export const calculateFileHash = (file: File, algorithm: HashAlgorithm): Promise<string> => {
    const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    return new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
            if (e.data.error) {
                reject(new Error(e.data.error));
            } else {
                resolve(e.data.hash);
            }
            // Clean up the worker and blob URL
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };

        worker.onerror = (e) => {
            reject(new Error(`Worker error: ${e.message}`));
            // Clean up the worker and blob URL
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };

        // Send the file and algorithm to the worker to start hashing.
        // The File object is transferable, so it's efficiently sent to the worker.
        worker.postMessage({ file, algorithm });
    });
};
