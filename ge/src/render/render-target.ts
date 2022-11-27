 export type RenderTargetOptions = {
    width?: number                  // 宽度 默认为 512
    height?: number                 // 高度 默认为 512
    colorFormat?: number            // 颜色缓冲区格式 默认为 gl.RGBA
    depthFormat?: number            // 深度缓冲区格式 默认为 0, 0 表示不开启深度缓冲区, gl.DEPTH_COMPONENT16 或其他值表示开启深度缓冲区
    stencilFormat?: number          // 模板缓冲区格式 默认为 0, 0 表示不开启模板缓冲区, gl.STENCIL_INDEX8 或其他值表示开启模板缓冲区
    wrapS?: number                  // 水平方向纹理环绕模式 默认为 gl.CLAMP_TO_EDGE
    wrapT?: number                  // 垂直方向纹理环绕模式 默认为 gl.CLAMP_TO_EDGE
    colorType?: number              // 颜色缓冲区类型 默认为 gl.UNSIGNED_BYTE
    colorAttachment?: number        // 颜色缓冲区附着点 默认为 gl.COLOR_ATTACHMENT0
    depthAttachment?: number        // 深度缓冲区附着点 默认为 gl.DEPTH_ATTACHMENT
    stencilAttachment?: number      // 模板缓冲区附着点 默认为 gl.STENCIL_ATTACHMENT
    minFilter?: number              // 纹理最小过滤模式 默认为 gl.LINEAR
    magFilter?: number              // 纹理最大过滤模式 默认为 gl.LINEAR

    anisotropic?: number            // 各向异性过滤级别 默认为 1
    mipmapBase?: number             // 多级渐远纹理基数 默认为 0, 0 表示不开启多级渐远纹理
    mipmaps?: number                // 多级渐远纹理数量 默认为 1, -1 表示自动计算
    mipmapMax?: number              // 多级渐远纹理最大级别 默认为 -1, -1 表示自动计算

    colorInternalFormat?: number    // 颜色缓冲区内部格式 默认为 gl.RGBA8
    samples?: number                // 多重采样级别 默认为 0, 0 表示不开启多重采样
}

const kContext = Symbol()
const kFrameBuffer = Symbol()
const kColorBuffer = Symbol()
const kDepthBuffer = Symbol()
const kOptions = Symbol()

export class RenderTarget{
    [kContext]:WebGL2RenderingContext
    [kFrameBuffer]:WebGLFramebuffer | null
    [kColorBuffer]:WebGLTexture | null
    [kDepthBuffer]:WebGLRenderbuffer | null
    [kOptions]: {
        width: number
        height: number
        colorFormat: number
        depthFormat: number
        stencilFormat: number
        wrapS: number
        wrapT: number
        colorType: number
        colorAttachment: number
        depthAttachment: number
        stencilAttachment: number
        minFilter: number
        magFilter: number
        anisotropic: number
        mipmapBase: number
        mipmaps: number
        mipmapMax: number
        colorInternalFormat: number
        samples: number
    }

    private constructor(ctx:WebGL2RenderingContext){
        this[kContext] = ctx
        this[kFrameBuffer] = null
        this[kColorBuffer] = null
        this[kDepthBuffer] = null
        this[kOptions] = {
            width: 512,
            height: 512,
            colorFormat: ctx.RGBA,
            depthFormat: 0,
            stencilFormat: 0,
            wrapS: ctx.CLAMP_TO_EDGE,
            wrapT: ctx.CLAMP_TO_EDGE,
            colorType: ctx.UNSIGNED_BYTE,
            colorAttachment: ctx.COLOR_ATTACHMENT0,
            depthAttachment: ctx.DEPTH_ATTACHMENT,
            stencilAttachment: ctx.STENCIL_ATTACHMENT,
            minFilter: ctx.LINEAR,
            magFilter: ctx.LINEAR,
            anisotropic: 1,
            mipmapBase: 0,
            mipmaps: 1,
            mipmapMax: -1,
            colorInternalFormat: ctx.RGBA8,
            samples: 0
        }
    }

    // 恢复
    restore(){
        const { [kContext]: ctx, [kOptions]: options } = this
        const { width, height, colorFormat, depthFormat, stencilFormat, wrapS, wrapT, colorType, colorAttachment, depthAttachment, stencilAttachment, minFilter, magFilter, anisotropic, mipmapBase, mipmaps, mipmapMax, colorInternalFormat, samples} = options
        const frameBuffer = ctx.createFramebuffer()
        const colorBuffer = ctx.createTexture()
        const depthBuffer = depthFormat ? ctx.createRenderbuffer() : null
        const stencilBuffer = stencilFormat ? ctx.createRenderbuffer() : null
        if(!frameBuffer || !colorBuffer || (depthFormat && !depthBuffer) || (stencilFormat && !stencilBuffer)){
            throw new Error('create render target failed')
        }
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, frameBuffer)
        ctx.bindTexture(ctx.TEXTURE_2D, colorBuffer)
        ctx.texImage2D(ctx.TEXTURE_2D, 0, colorInternalFormat, width, height, 0, colorFormat, colorType, null)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, wrapS)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, wrapT)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, minFilter)
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, magFilter)
        if(anisotropic > 1){
            const ext = ctx.getExtension('EXT_texture_filter_anisotropic')
            if(ext){
                ctx.texParameterf(ctx.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, anisotropic!)
            }
        }
        if(mipmapBase > 0){
            const max = mipmapMax > 0 ? mipmapMax : Math.floor(Math.log2(Math.max(width, height)))
            const count = mipmaps > 0 ? mipmaps : max - mipmapBase + 1
            for(let i = 0; i < count; i++){
                ctx.texImage2D(ctx.TEXTURE_2D, i, colorInternalFormat, width >> (i + mipmapBase), height >> (i + mipmapBase), 0, colorFormat, colorType, null)
            }
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_BASE_LEVEL, mipmapBase)
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAX_LEVEL, max)
        }
        ctx.framebufferTexture2D(ctx.FRAMEBUFFER, colorAttachment, ctx.TEXTURE_2D, colorBuffer, 0)
        if(depthFormat){
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, depthBuffer)
            ctx.renderbufferStorage(ctx.RENDERBUFFER, depthFormat, width, height)
            ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, depthAttachment, ctx.RENDERBUFFER, depthBuffer)
        }
        if(stencilFormat){
            ctx.bindRenderbuffer(ctx.RENDERBUFFER, stencilBuffer)
            ctx.renderbufferStorage(ctx.RENDERBUFFER, stencilFormat, width, height)
            ctx.framebufferRenderbuffer(ctx.FRAMEBUFFER, stencilAttachment, ctx.RENDERBUFFER, stencilBuffer)
        }
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
        ctx.bindTexture(ctx.TEXTURE_2D, null)
        ctx.bindRenderbuffer(ctx.RENDERBUFFER, null)
        this[kFrameBuffer] = frameBuffer
        this[kColorBuffer] = colorBuffer
        this[kDepthBuffer] = depthBuffer
    }

    // 销毁
    reset(){
        const ctx = this[kContext]
        if(this[kFrameBuffer]){
            ctx.deleteFramebuffer(this[kFrameBuffer])
            this[kFrameBuffer] = null
        }
        if(this[kColorBuffer]){
            ctx.deleteTexture(this[kColorBuffer])
            this[kColorBuffer] = null
        }
        if(this[kDepthBuffer]){
            ctx.deleteRenderbuffer(this[kDepthBuffer])
            this[kDepthBuffer] = null
        }
    }

    // 绑定
    activate(){
        const ctx = this[kContext]
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, this[kFrameBuffer])
    }

    // 解绑
    inactivate(){
        const ctx = this[kContext]
        ctx.bindFramebuffer(ctx.FRAMEBUFFER, null)
    }

    // 获取颜色纹理
    getColorTexture(){
        return this[kColorBuffer]
    }

    // 获取深度纹理
    getDepthTexture(){
        return this[kDepthBuffer]
    }

    // 获取宽度
    get width(){
        return this[kOptions].width
    }

    // 获取高度
    get height(){
        return this[kOptions].height
    }

    // 获取颜色格式
    get colorFormat(){
        return this[kOptions].colorFormat
    }

    // 获取深度格式
    get depthFormat(){
        return this[kOptions].depthFormat
    }

    // 获取模板格式
    get stencilFormat(){
        return this[kOptions].stencilFormat
    }

    // 获取颜色类型
    get colorType(){
        return this[kOptions].colorType
    }

    // 获取颜色附件
    get colorAttachment(){
        return this[kOptions].colorAttachment
    }

    // 获取深度附件
    get depthAttachment(){
        return this[kOptions].depthAttachment
    }

    // 获取模板附件
    get stencilAttachment(){
        return this[kOptions].stencilAttachment
    }

    // 获取颜色内部格式
    get colorInternalFormat(){
        return this[kOptions].colorInternalFormat
    }

    // 获取颜色包装模式
    get wrapS(){
        return this[kOptions].wrapS
    }

    // 获取颜色包装模式
    get wrapT(){
        return this[kOptions].wrapT
    }

    // 获取颜色缩小过滤模式
    get minFilter(){
        return this[kOptions].minFilter
    }

    // 获取颜色放大过滤模式
    get magFilter(){
        return this[kOptions].magFilter
    }
    
    // 获取颜色各向异性过滤模式
    get anisotropic(){
        return this[kOptions].anisotropic
    }

    // 获取颜色基础mipmap
    get mipmapBase(){
        return this[kOptions].mipmapBase
    }

    // 获取颜色最大mipmap
    get mipmapMax(){
        return this[kOptions].mipmapMax
    }

    // 获取颜色mipmap数量
    get mipmaps(){
        return this[kOptions].mipmaps
    }

    static create(ctx:WebGL2RenderingContext, options?: Partial<RenderTargetOptions>){
        const target = new RenderTarget(ctx)
        target[kOptions] = Object.assign(target[kOptions], options)
        target.restore()
        return target
    }
}