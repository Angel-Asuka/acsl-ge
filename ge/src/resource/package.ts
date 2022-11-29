import {LZMA} from './lzma_worker.js'

export class Package {
    constructor(){

    }

    static compress(data: Uint8Array, level?: number, on_progress?:(p:number)=>void): Promise<Uint8Array> {
        return new Promise((resolve) => {LZMA.compress(data, level??9, (result:Uint8Array, err:any) => {resolve(result)},on_progress)})
    }

    static decompress(data: Uint8Array, on_progress?:(p:number)=>void): Promise<Uint8Array> {
        return new Promise((resolve) => {LZMA.decompress(data, (result:Uint8Array, err:any) => {resolve(result)}, on_progress)})
    }
}