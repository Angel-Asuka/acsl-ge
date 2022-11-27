export enum GameResourceType {  // 资源类型
    Unknown = 0,                // 未知
    Image = 1,                  // 图片
}

const kName = Symbol()              // 资源名称
const kUri = Symbol()               // 资源地址

// 资源加载进度回调
export type GameResourceProgressCallback = (loaded: number, total: number, res: GameResource) => void

// 资源加载完成回调
export type GameResourceLoadedCallback = (res: GameResource) => void

// 资源加载失败回调
export type GameResourceErrorCallback = (res: GameResource) => void

// 游戏资源基类
export class GameResource {
    
    [kName]: string                                                 // 资源名称
    [kUri]: string                                                  // 资源地址

    onprogress: GameResourceProgressCallback | null                 // 加载进度回调
    onloaded: GameResourceLoadedCallback | null                     // 加载完成回调
    onerror: GameResourceErrorCallback | null                       // 加载失败回调

    constructor(name: string, uri: string){
        this[kName] = name
        this[kUri] = uri
        this.onprogress = null
        this.onloaded = null
        this.onerror = null
    }

    // 获取资源名称
    get name(): string { return this[kName] }

    // 设置资源名称
    set name(name: string){ this[kName] = name }

    // 获取资源类型, 子类重写
    get type(): GameResourceType { return GameResourceType.Unknown }

    // 获取资源地址
    get url(): string { return this[kUri] }

    // 设置资源地址
    set url(url: string) { this[kUri] = url }

    // 加载资源, 子类重写
    load(): void {}

    // 释放资源, 子类重写
    release(): void {}

    // 获取资源是否已加载, 子类重写
    get loaded(): boolean { return false }
}
