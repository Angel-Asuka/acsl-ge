import fs from 'node:fs'
import path from 'node:path'
import { PackedResourceType } from './restype.js'

export function compileSlice(name:string, file:string) : Uint8Array {
    const enc = new TextEncoder()
    const name_bytes = enc.encode(name)
    const slice_data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const image = new Uint8Array(fs.readFileSync(path.join(path.dirname(file), slice_data.image)))
    const meta = enc.encode(JSON.stringify(slice_data))
    const all = new Uint8Array(1 + 4 + 4 + 4 + name_bytes.length + image.length + meta.length)
    const view = new DataView(all.buffer)
    view.setUint8(0, PackedResourceType.Slice)     // 资源类型 slice
    view.setUint32(1, name_bytes.length, true)  // 资源名字长度
    view.setUint32(5, image.length, true)  // Image数据长度
    view.setUint32(9, meta.length, true)  // 资源元数据长度
    all.set(name_bytes, 13)  // 资源名字
    all.set(image, 13 + name_bytes.length)  // 资源数据
    all.set(meta, 13 + name_bytes.length + image.length)  // 资源元数据
    return all
}