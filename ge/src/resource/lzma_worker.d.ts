declare type LzmaProgressCallback = (percent: number) => void;
declare type LzmaFinishCallback = (result: Uint8Array, error: string) => void;

declare interface LzmaWorker {
    compress(data: Uint8Array, level: number, finish: LzmaFinishCallback, progress?: LzmaProgressCallback): void;
    decompress(data: Uint8Array, finish: LzmaFinishCallback, progress?: LzmaProgressCallback): void;
}

export const LZMA: LzmaWorker;