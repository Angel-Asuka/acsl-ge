import { RenderDevice } from "./device.js"
import { Texture, TextureUsage,  TextureOptions} from "./texture.js"

// 图片纹理
export class ImageTexture extends Texture {

    /** @internal */ ___img: HTMLImageElement               // 图片资源

    constructor(dev: RenderDevice, img: HTMLImageElement, options?: TextureOptions) {
        super(dev, options)
        this.___img = img
        this.___onDeviceRestored()
    }

    // 内部方法，资源被渲染设备恢复时调用
    /** @internal */ ___onDeviceRestored() {
        const ctx = this.device.context
        const { format, dataType } = this.options
        if (this.___texture == null) {
            this.___texture = ctx.createTexture()
            if(this.___texture != null) {
                ctx.bindTexture(ctx.TEXTURE_2D, this.___texture)
                ctx.texImage2D(ctx.TEXTURE_2D, 0, format, format, dataType, this.___img)
                this.___applyOptions()
                ctx.bindTexture(ctx.TEXTURE_2D, null)
            }
        }
    }
                
    // 获取纹理用途
    get usage(): TextureUsage { return TextureUsage.Static }

    // 获取纹理宽度
    get width(): number { return this.___img.width }

    // 获取纹理高度
    get height(): number { return this.___img.height }
}