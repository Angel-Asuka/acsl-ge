import { RenderingDevice } from "../render/device.js"
import { ImageTexture } from '../render/image-texture.js'
import { Resource, ResourceDeclare, ResourceType } from './resource.js'

const dec = new TextDecoder()

export class ImageResource extends Resource {
    /** @internal */ _image: HTMLImageElement
    /** @internal */ _texture: ImageTexture | null

    constructor(decl:ResourceDeclare) {
        super(decl)
        this._texture = null
        const img = new Image()
        img.onload = this._onLoaded.bind(this)
        img.onerror = this._onError.bind(this)
        img.onprogress = (e) => {this._onProgress(e.loaded, e.total)}
        this._image = img
    }

    // 获取资源类型
    get type(): ResourceType { return ResourceType.Image }

    // 加载资源
    load(): void {
        const img = this._image
        img.src = this._decl.url
    }

    // 从数据包中读取
    loadFromPackageData(data: ArrayBuffer): void {
        const view = new DataView(data)
        this._decl.type = view.getUint8(0)
        const name_len = view.getUint32(1, true)
        const data_len = view.getUint32(5, true)
        const data_begin = 9 + name_len
        const data_end = data_begin + data_len
        const name = dec.decode(new Uint8Array(data, 9, name_len))
        this._decl.name = name
        const blob = new Blob([data.slice(data_begin, data_end)], {type: 'image/png'})
        this._image.src = URL.createObjectURL(blob)
    }

    // 释放资源
    release(): void {
        this._image.src = ''
        if(this._texture) {
            this._texture.destroy()
            this._texture = null
        }
    }

    // 获取资源图片
    get image(): HTMLImageElement | null { return this._image }

    // 获取资源纹理
    getTexture(dev:RenderingDevice): ImageTexture {
        if(this._texture === null) {
            this._texture = dev.createTextureFromImage(this._image)
        }
        return this._texture
    }

}