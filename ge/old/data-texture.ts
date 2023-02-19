import { RenderingDevice } from "./device.js"
import { Texture, TextureUsage,  TextureOptions} from "./texture.js"

// 图片纹理
export class FloatDataTexture extends Texture {

    /** @internal */ _width: number
    /** @internal */ _height: number
    /** @internal */ _data: Float32Array

    constructor(dev: RenderingDevice, width: number, height: number, data: Float32Array){
        super(dev)
        this._width = width
        this._height = height
        this._data = data
        this._onDeviceRestored()
    }

    // 内部方法，资源被渲染设备恢复时调用
    /** @internal */ _onDeviceRestored() {
        const ctx = this.device.context
        if (this._texture == null) {
            this._texture = ctx.createTexture()
            if(this._texture != null) {
                ctx.bindTexture(ctx.TEXTURE_2D, this._texture)
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
                ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this._width, this._height, 0, ctx.RGBA, ctx.FLOAT, this._data) 
                ctx.bindTexture(ctx.TEXTURE_2D, null)
            }
        }
    }

    update(){
        const ctx = this.device.context
        ctx.bindTexture(ctx.TEXTURE_2D, this._texture)
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, this._width, this._height, 0, ctx.RGBA, ctx.FLOAT, this._data) 
        ctx.bindTexture(ctx.TEXTURE_2D, null)
    }
                
    // 获取纹理用途
    get usage(): TextureUsage { return TextureUsage.FloatData }

    // 获取纹理宽度
    get width(): number { return this._width }

    // 获取纹理高度
    get height(): number { return this._height }
}