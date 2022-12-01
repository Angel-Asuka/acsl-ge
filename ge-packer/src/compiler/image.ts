// Image 类型资源编译器
import fs from 'node:fs'
import { PackedResourceType } from './restype.js'

export function compileImage(name:string, file:string) : Uint8Array {
    const enc = new TextEncoder()
    const image = new Uint8Array(fs.readFileSync(file))
    const name_bytes = enc.encode(name)
    const all = new Uint8Array(1 + 4 + 4 + name_bytes.length + image.length)
    const view = new DataView(all.buffer)
    view.setUint8(0, PackedResourceType.Image)     // 资源类型 image
    view.setUint32(1, name_bytes.length, true)  // 资源名字长度
    view.setUint32(5, image.length, true)  // 资源数据长度
    all.set(name_bytes, 9)  // 资源名字
    all.set(image, 9 + name_bytes.length)  // 资源数据
    return all
}