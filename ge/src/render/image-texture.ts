import { RenderingDevice } from "./device.js"
import { Texture, TextureUsage,  TextureOptions} from "./texture.js"

// 图片纹理
export class ImageTexture extends Texture {

    /** @internal */ _img: HTMLImageElement               // 图片资源

    constructor(dev: RenderingDevice, img: HTMLImageElement, options?: TextureOptions) {
        super(dev, options)
        this._img = img
        this._onDeviceRestored()
    }

    // 内部方法，资源被渲染设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        const ctx = this.device.context
        const { format, dataType } = this.options
        if (this._texture == null) {
            this._texture = ctx.createTexture()
            if(this._texture != null) {
                ctx.bindTexture(ctx.TEXTURE_2D, this._texture)
                ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, this.options.flipY ? 1 : 0)
                console.log(this._img)
                ctx.texImage2D(ctx.TEXTURE_2D, 0, format, format, dataType, this._img)
                console.log('???', format, dataType)
                this._applyOptions()
                ctx.bindTexture(ctx.TEXTURE_2D, null)
            }
        }
    }
                
    // 获取纹理用途
    get usage(): TextureUsage { return TextureUsage.Static }

    // 获取纹理宽度
    get width(): number { return this._img.width }

    // 获取纹理高度
    get height(): number { return this._img.height }
}