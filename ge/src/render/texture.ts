import { RenderingCore } from "./core.js"
import { RenderingResource } from "./resource.js"

// 纹理用途
export enum TextureUsage {
    Unknown = 0,        // 未知
    Static = 1,         // 静态，来自图片
    Dynamic = 2,        // 动态，来自渲染目标
    RenderTarget = 3,   // 渲染目标，用于渲染
    FloatData = 4,      // 浮点数据，用于计算
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
    flipY?: boolean                     // 纹理是否翻转, 默认为 false
}

// 纹理基类
export class Texture extends RenderingResource{
    /** @internal */ _texture: WebGLTexture | null        // 纹理对象
    options: {                                              // 纹理选项
        format: number
        dataType: number
        minFilter: number
        magFilter: number
        wrapS: number
        wrapT: number
        anisotropic: number
        flipY: boolean
    }

    constructor(core: RenderingCore, options?: TextureOptions) {
        super(core)
        const { _context } = this._core
        this._texture = null
        this.options = {
            format: options?.format || _context.RGBA,
            dataType: options?.dataType || _context.UNSIGNED_BYTE,
            minFilter: options?.minFilter || _context.LINEAR,
            magFilter: options?.magFilter || _context.LINEAR,
            wrapS: options?.wrapS || _context.CLAMP_TO_EDGE,
            wrapT: options?.wrapT || _context.CLAMP_TO_EDGE,
            anisotropic: options?.anisotropic || 1,
            flipY: options?.flipY !== undefined ? options?.flipY : false
        }
    }

    // 绑定到指定的纹理单元
    bind(unit: number) {
        const { _context } = this._core
        _context.activeTexture(_context.TEXTURE0 + unit)
        _context.bindTexture(_context.TEXTURE_2D, this._texture)
    }

    // 获取纹理用途，子类重写
    get usage(): TextureUsage { return TextureUsage.Unknown }

    // 获取纹理宽度，子类重写
    get width(): number { return 0 }

    // 获取纹理高度，子类重写
    get height(): number { return 0 }

    // 获取纹理是否就绪
    get ready(): boolean { return this._texture !== null }

    // 内部方法，应用纹理设置
    /** @internal */ _applyOptions() {
        const { _context } = this._core
        const { format, dataType, minFilter, magFilter, wrapS, wrapT, anisotropic} = this.options
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, minFilter)
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, magFilter)
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, wrapS)
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, wrapT)
        if(anisotropic > 1){
            const ext = _context.getExtension('EXT_texture_filter_anisotropic')
            if(ext){
                _context.texParameterf(_context.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropic)
            }
        }
    }

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {
        if (this._texture) {
            this._core._context.deleteTexture(this._texture)
            this._texture = null
        }
    }
}