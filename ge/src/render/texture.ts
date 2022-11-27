import { RenderDevice } from "./device.js"
import { RenderResource } from "./resource.js"

// 纹理用途
export enum TextureUsage {
    Unknown = 0,        // 未知
    Static = 1,         // 静态，来自图片
    Dynamic = 2,        // 动态，来自渲染目标
    RenderTarget = 3,   // 渲染目标，用于渲染
}

// 纹理选项
export type TextureOptions = {
    format?: number                     // 纹理格式, 默认为 gl.RGBA
    dataType: number                    // 纹理数据类型, 默认 gl.UNSIGNED_BYTE
    minFilter?: number                  // 纹理过滤器, 默认 gl.LINEAR
    magFilter?: number                  // 纹理过滤器, 默认 gl.LINEAR
    wrapS?: number                      // 纹理环绕模式, 默认 gl.CLAMP_TO_EDGE
    wrapT?: number                      // 纹理环绕模式, 默认 gl.CLAMP_TO_EDGE
    anisotropic?: number                // 各向异性过滤级别 默认为 1
}

// 纹理基类
export class Texture extends RenderResource{
    /** @internal */ ___texture: WebGLTexture | null        // 纹理对象
    options: {                                              // 纹理选项
        format: number
        dataType: number
        minFilter: number
        magFilter: number
        wrapS: number
        wrapT: number
        anisotropic: number
    }

    constructor(device: RenderDevice, options?: TextureOptions) {
        super(device)
        this.___texture = null
        this.options = {
            format: options?.format || device.context.RGBA,
            dataType: options?.dataType || device.context.UNSIGNED_BYTE,
            minFilter: options?.minFilter || device.context.LINEAR,
            magFilter: options?.magFilter || device.context.LINEAR,
            wrapS: options?.wrapS || device.context.CLAMP_TO_EDGE,
            wrapT: options?.wrapT || device.context.CLAMP_TO_EDGE,
            anisotropic: options?.anisotropic || 1
        }
    }

    // 绑定到指定的纹理单元
    bind(unit: number) {
        const { context } = this.device
        context.activeTexture(context.TEXTURE0 + unit)
        context.bindTexture(context.TEXTURE_2D, this.___texture)
    }

    // 获取纹理用途，子类重写
    get usage(): TextureUsage { return TextureUsage.Unknown }

    // 获取纹理宽度，子类重写
    get width(): number { return 0 }

    // 获取纹理高度，子类重写
    get height(): number { return 0 }

    // 获取纹理是否就绪
    get ready(): boolean { return this.___texture !== null }

    // 内部方法，应用纹理设置
    /** @internal */ ___applyOptions() {
        const { context } = this.device
        const { format, dataType, minFilter, magFilter, wrapS, wrapT, anisotropic} = this.options
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, minFilter)
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, magFilter)
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, wrapS)
        context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, wrapT)
        if(anisotropic > 1){
            const ext = context.getExtension('EXT_texture_filter_anisotropic')
            if(ext){
                context.texParameterf(context.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropic)
            }
        }
    }

    // 内部方法，设备丢失时调用
    /** @internal */ ___onDeviceLost() {
        if (this.___texture) {
            this.device.context.deleteTexture(this.___texture)
            this.___texture = null
        }
    }
}