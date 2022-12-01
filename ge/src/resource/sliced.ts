import { RenderingDevice } from "../render/device.js"
import { ImageTexture } from '../render/image-texture.js'
import { SliceInfo, SliceManifest ,SlicedTexture } from '../render/sliced-texture.js'
import { Resource, ResourceDeclare, ResourceType } from './resource.js'

const dec = new TextDecoder()

export class SlicedResource extends Resource {
    /** @internal */ _image: HTMLImageElement
    /** @internal */ _texture: ImageTexture | null
    /** @internal */ _sliced_texture: SlicedTexture | null
    /** @internal */ _manifest: SliceManifest

    constructor(decl:ResourceDeclare) {
        super(decl)
        this._texture = null
        this._sliced_texture = null
        const img = new Image()
        img.onload = this._onLoaded.bind(this)
        img.onerror = this._onError.bind(this)
        img.onprogress = (e) => {this._onProgress(e.loaded, e.total)}
        this._image = img
        this._manifest = {
            name: '',
            width: 1,
            height: 1,
            slices: [] as SliceInfo[]
        }
    }

    // 获取资源类型
    get type(): ResourceType { return ResourceType.Image }

    // 加载资源
    load(): void {
        //!TODO: 直接从URL读取的情况会有些不同...
        const img = this._image
        img.src = this._decl.url
    }

    // 从数据包中读取
    loadFromPackageData(data: ArrayBuffer): void {
        const view = new DataView(data)
        this._decl.type = view.getUint8(0)
        const name_len = view.getUint32(1, true)
        const image_len = view.getUint32(5, true)
        const manifest_len = view.getUint32(9, true)
        const image_begin = 13 + name_len
        const image_end = 13 + name_len + image_len
        const manifest_begin = image_end
        const manifest_end = image_end + manifest_len
        const name = dec.decode(new Uint8Array(data, 13, name_len))
        this._decl.name = name
        const blob = new Blob([data.slice(image_begin, image_end)], {type: 'image/png'})
        this._image.src = URL.createObjectURL(blob)
        const manifest = JSON.parse(dec.decode(new Uint8Array(data, manifest_begin, manifest_len)))
        this._manifest.name = manifest.name
        this._manifest.width = manifest.size[0]
        this._manifest.height = manifest.size[1]
        this._manifest.slices.length = 0
        for(let s of manifest.slices) {
            this._manifest.slices.push({
                name: s.name,
                width: s.size[0],
                height: s.size[1],
                mat:[...s.mat, 0, 0, 0, 1, 0, 0, 0, 1]
            })
        }
    }

    // 释放资源
    release(): void {
        this._image.src = ''
        if(this._texture) {
            this._texture.destroy()
            this._texture = null
        }
        if(this._sliced_texture) {
            this._sliced_texture = null
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

    // 获取切片纹理
    getSlicedTexture(dev:RenderingDevice): SlicedTexture {
        if(this._sliced_texture === null) {
            this._sliced_texture = dev.createSlicedTexture(this.getTexture(dev), this._manifest)
        }
        return this._sliced_texture
    }

}