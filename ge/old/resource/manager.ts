import { ResourceType, ResourceDeclare, Resource } from "./resource.js"
import { ImageResource } from "./image.js"
import { Package } from "./package.js"

export type ResourceManagerCallbackProgress = (loaded: number, total: number) => void
export type ResourceManagerCallbackError = (i:number, decl: ResourceDeclare) => 'retry' | 'ignore' | 'abort'
export type ResourceManagerCallbackComplete = () => void

declare type ResourceManagerProgressCallback = (progress: number) => void

const ResourceImplement:any = {
    [ResourceType.Package]: Package,
    [ResourceType.Image]: ImageResource,
    //[ResourceType.Sliced]: SlicedTexture,
    [ResourceType.Unknown]: Resource
}

export class ResourceManager {

    _list: Resource[]                  // 资源顺序索引表
    _index: Map<string, Resource>      // 资源名称索引表
    _loaded_count: number = 0          // 已加载资源数量
    _totalCount: number = 0            // 总资源数量
    _failure_count: number = 0         // 加载失败资源数量
    _loading: boolean = false          // 是否正在加载
    _waiting_trigger: Function | null  // 等待触发器

    _cb_progress: ResourceManagerCallbackProgress = () => {}
    _cb_error: ResourceManagerCallbackError = () => 'ignore'
    _cb_complete: ResourceManagerCallbackComplete = () => {}

    constructor(){
        this._list = []
        this._index = new Map()
        this._waiting_trigger = null
    }

    async load(decl: ResourceDeclare | ResourceDeclare[], on_progress?: ResourceManagerProgressCallback){
        if(this._loading) throw new Error('Resource manager is loading')
        if(decl.constructor !== Array){
            decl = [decl as ResourceDeclare]
        }
        this._loaded_count = 0
        this._loading = true
        this._totalCount = decl.length
        for(let d of decl){
            const resourceObject = new ResourceImplement[d.type](d)
            resourceObject._manager = this
            resourceObject._index = this._list.length
            resourceObject.load()
            this._list.push(resourceObject)
            this._index.set(d.name, resourceObject)
        }
    } 

    /**
     * 取消加载
     */
    abort() {
        this._onAbort()
    }

    /**
     * 释放所有
     */
    destroy() {
        this.abort()
    }

    /**
     * 等待资源加载完成或失败
     * 返回后应当检查 loadedCount 和 failureCount 属性
     */
    async wait() {
        if (this._loading) {
            return new Promise<void>((resolve, reject) => {
                this._waiting_trigger = resolve
            })
        }
    }

    /**
     * 通过名称获取资源
     * @param name 资源名称
     * @returns 资源对象
     */
    nameOf(name: string) {
        return this._index.get(name)
    }

    /**
     * 通过索引获取资源
     * @param index 资源索引
     * @returns 资源对象
     */
    indexOf(index: number) {
        return this._list[index]
    }

    /**
     * 获取已经处理过的资源数量（包含加载失败的资源）
     */
    get loadedCount() { return this._loaded_count }

    /**
     * 获取资源总数
     */
    get totalCount() { return this._totalCount }

    /**
     * 获取加载失败的资源数量
     */
    get failureCount() { return this._failure_count }
    
    /**
     * 判断资源管理器是否正在加载资源
     */
    get loading() { return this._loading }

    /**
     * 设置资源加载进度回调
     */
    set onProgress(cb: ResourceManagerCallbackProgress | null) { if(cb) this._cb_progress = cb }

    /**
     * 设置资源加载失败回调
     */
    set onError(cb: ResourceManagerCallbackError | null) { if(cb) this._cb_error = cb }

    /**
     * 设置资源加载完成回调
     */
    set onComplete(cb: ResourceManagerCallbackComplete | null) { if(cb) this._cb_complete = cb }

    /**
     * 将资源加入到索引中
     */
    /** @internal */ _add(resource: Resource) {
        this._totalCount++
        this._loaded_count++
        this._index.set(resource.name, resource)
    }

    /**
     * 资源加载完成
     * @param resource 资源对象
     */
    _onResourceLoaded(resource: Resource) {
        this._loaded_count++
        if(this._cb_progress) this._cb_progress(this._loaded_count, this._totalCount)
        if(this._loaded_count === this._totalCount) this._onComplete()
    }

    /**
     * 资源加载失败
     * @param resource 资源对象
     */
    _onResourceFailed(resource: Resource) {
        if(this._cb_error){
            switch(this._cb_error(resource._index, resource._decl)){
                case 'retry':
                    resource.load()
                    return
                case 'abort':
                    this._onAbort()
                    return
            }
        }
        this._loaded_count++
        this._failure_count++
        if(this._cb_progress) this._cb_progress(this._loaded_count, this._totalCount)
        if(this._loaded_count === this._totalCount) this._onComplete()
    }

    /**
     * 资源加载中断
     */
    _onAbort() {
        for (let resource of this._list) {
            resource._manager = null
            resource.release()
        }
        this._list.length = 0
        this._index.clear()
        this._loaded_count = 0
        this._failure_count = 0
        this._loading = false
        if(this._waiting_trigger) this._waiting_trigger()
        this._waiting_trigger = null
    }

    /**
     * 资源加载完成
     */
    _onComplete() {
        this._loading = false
        if(this._cb_complete) this._cb_complete()
        if(this._waiting_trigger) this._waiting_trigger()
        this._waiting_trigger = null
    }


}