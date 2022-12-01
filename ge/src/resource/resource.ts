import { ImageResource } from "./image.js"
import { ResourceManager } from "./manager.js"

export enum ResourceType {  // 资源类型
    Package = 0,                // 包
    Image = 1,                  // 图片
    Sliced = 2,                 // 切片纹理
    Unknown = 999,              // 未知
}

export type ResourceDeclare = {
    name: string
    type: ResourceType
    url: string
    key?: string
}

// 资源加载进度回调
export type ResourceProgressCallback = (loaded: number, total: number, res: Resource) => void

// 资源加载完成回调
export type ResourceLoadedCallback = (res: Resource) => void

// 资源加载失败回调
export type ResourceErrorCallback = (res: Resource) => void

function _empty_func() { }

// 游戏资源基类
export class Resource {

    _decl: ResourceDeclare                                      // 资源声明
    _finish_trigger: (b:boolean)=>void                          // 资源加载完成触发器
    _manager: ResourceManager | null                            // 资源管理器
    _index: number = -1                                         // 资源在资源管理器中的索引
    _ready: boolean = false

    onprogress: ResourceProgressCallback | null                 // 加载进度回调
    onloaded: ResourceLoadedCallback | null                     // 加载完成回调
    onerror: ResourceErrorCallback | null                       // 加载失败回调

    constructor(decl: ResourceDeclare){
        this._decl = decl
        this.onprogress = null
        this.onloaded = null
        this.onerror = null
        this._manager = null
        this._finish_trigger = _empty_func
    }

    // 获取资源名称
    get name(): string { return this._decl.name }

    // 设置资源名称
    set name(name: string){ this._decl.name = name }

    // 获取资源类型, 子类重写
    get type(): ResourceType { return ResourceType.Unknown }

    // 加载资源, 子类重写
    load(): void {}

    // 释放资源, 子类重写
    release(): void {}

    // 获取资源是否已加载, 子类重写
    get loaded(): boolean { return this._ready }

    // 等待资源加载完成或着失败
    async wait(): Promise<boolean>{
        if(this.loaded) return true
        return new Promise<boolean>((resolve, reject) => { this._finish_trigger = resolve })
    }

    /** @internal */ _onProgress(loaded: number, total: number){
        if(this.onprogress) this.onprogress(loaded, total, this)
    }

    /** @internal */ _onLoaded(){
        this._ready = true
        if(this.onloaded) this.onloaded(this)
        this._finish_trigger(true)
        if(this._manager) this._manager._onResourceLoaded(this)
    }

    /** @internal */ _onError(){
        if(this.onerror) this.onerror(this)
        this._finish_trigger(false)
        if(this._manager) this._manager._onResourceFailed(this)
    }
}