import { Resource, ResourceDeclare, ResourceType } from './resource.js'
import {Lzma} from '../utils/lzma.js'
import { ImageResource } from './image.js'
import { SlicedResource } from './sliced.js'

const enc = new TextEncoder()
const dec = new TextDecoder()

export class Package extends Resource {

    /** @internal */ _resources: Resource[] = []

    constructor(decl: ResourceDeclare) {
        super(decl)
    }

    load(): void {
        console.log(this._decl)
        const xhr = new XMLHttpRequest()
        xhr.open('GET', this._decl.url)
        xhr.responseType = 'arraybuffer'
        xhr.onload = async () => {
            const data = new Uint8Array(xhr.response)
            if(data[0] === 0x0A || data[0] === 0x80) {
                if(this._decl.key){
                    const key = enc.encode(this._decl.key)
                    const key_len = key.length
                    for(let i = 1;  i < data.length; i++) {
                        data[i] ^= key[i % key_len]
                    }
                }
            }
            if(data[0] & 0x80) {
                Lzma.decompress(data.subarray(1)).then((res) => {
                    console.log(res)
                })
            } else {
                this._parse(data.buffer.slice(1))
            }
        }
        xhr.onerror = () => {
            console.log('error')
        }
        xhr.onprogress = (e) => {
            this._onProgress(e.loaded, e.total)
        }
        xhr.send()
    }

    /**
     * 内部方法，解析数据包
     */
    /** @internal */ private async _parse(data: ArrayBuffer) {
        const view = new DataView(data)
        const count = view.getUint16(0, true)
        let offset = 2 + count * 4
        for(let i = 0; i < count; i++) {
            const type = view.getUint8(offset) as ResourceType
            switch(type) {
                case ResourceType.Image:
                    const img = new ImageResource({name:'', type:ResourceType.Image, url:''})
                    img.loadFromPackageData(data.slice(offset))
                    await img.wait()
                    this._resources.push(img)
                    this._manager?._add(img)
                    break
                case ResourceType.Sliced:
                    const sli = new SlicedResource({name:'', type:ResourceType.Sliced, url:''})
                    sli.loadFromPackageData(data.slice(offset))
                    await sli.wait()
                    this._resources.push(sli)
                    this._manager?._add(sli)
                    break
                default:
                    console.log(`unknown type ${type}`)
            }
            offset += view.getUint32(2 + i * 4, true)
        }
        this._onLoaded()
    }
}