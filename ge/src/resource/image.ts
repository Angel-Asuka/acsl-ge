import { RenderingDevice } from "../render/device.js"
import { ImageTexture } from '../render/image-texture.js'
import { Resource, ResourceType } from './resource.js'

export class ImageResource extends Resource {
    /** @internal */ _image: HTMLImageElement
    /** @internal */ _texture: ImageTexture | null

    constructor(name: string, url: string) {
        super(name, url)
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
        img.src = this.url
    }

    // 释放资源
    release(): void {
        this._image.src = ''
        if(this._texture) {
            this._texture.destroy()
            this._texture = null
        }
    }

    // 获取资源是否已加载
    get loaded(): boolean { return this._image !== null }

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
