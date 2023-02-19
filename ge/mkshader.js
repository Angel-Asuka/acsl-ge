import fs from 'node:fs';
import {Lzma} from './dist/utils/lzma.js';

// ---------- The following code was written by Niklas von Hertzen 2012 ---------
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Use a lookup table to find the index.
const lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
}

export const b64encode = (arraybuffer) => {
    let bytes = new Uint8Array(arraybuffer),
        i,
        len = bytes.length,
        base64 = '';

    for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
        base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
        base64 += chars[bytes[i + 2] & 63];
    }

    if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
    } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
    }

    return base64;
};

export const b64decode = (base64) => {
    let bufferLength = base64.length * 0.75,
        len = base64.length,
        i,
        p = 0,
        encoded1,
        encoded2,
        encoded3,
        encoded4;

    if (base64[base64.length - 1] === '=') {
        bufferLength--;
        if (base64[base64.length - 2] === '=') {
            bufferLength--;
        }
    }

    const arraybuffer = new ArrayBuffer(bufferLength),
        bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];

        bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
        bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
        bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
};
//------------ End of code written by Niklas von Hertzen 2012 ------------/

const enc = new TextEncoder();
const dec = new TextDecoder();

async function compress_source(source) {
    const s =  source.replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();
    const compressed = await Lzma.compress(enc.encode(s), 9);
    return b64encode(compressed);
}

async function uncompress_test(compressed) {
    const decoded = b64decode(compressed);
    const decompressed = await Lzma.decompress(new Uint8Array(decoded));
    if(decompressed)
        return dec.decode(decompressed.buffer);
    return null
}

const fp = fs.openSync('./src/render/shaderlib.ts', 'w');

const shader_files = fs.readdirSync('./src/render/shaders');
for(let sh of shader_files){
    const source = fs.readFileSync(`./src/render/shaders/${sh}`, 'utf8');
    const compressed = await compress_source(source);
    fs.writeSync(fp, `export const ${sh.replace('.', '_')} = '${compressed}';\r`);
}

fs.closeSync(fp);