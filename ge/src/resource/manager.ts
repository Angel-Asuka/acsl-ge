import { ResourceType, Resource } from "./resource.js"
import { ImageResource } from "./image.js"

export type ResourceManifestRecord = {
    name: string
    uri: string
    type: ResourceType
}

export const ResourceImplement = {
    [ResourceType.Unknown]: Resource,
    [ResourceType.Image]: ImageResource
}

export type ResourceManifest = ResourceManifestRecord[]

export type ResourceManagerCallbackProgress = (loaded: number, total: number) => void
export type ResourceManagerCallbackError = (i:number, res: Resource) => 'retry' | 'ignore' | 'abort'
export type ResourceManagerCallbackComplete = () => void

export class ResourceManager {
    /** @internal */ _manifest: ResourceManifest        // 资源清单
    /** @internal */ _list: Resource[]                  // 资源顺序索引表
    /** @internal */ _index: Map<string, Resource>      // 资源名称索引表
    /** @internal */ _loaded_count: number              // 已加载资源数量
    /** @internal */ _totalCount: number = 0            // 总资源数量
    /** @internal */ _failure_count: number             // 加载失败资源数量
    /** @internal */ _loading: boolean                  // 是否正在加载
    /** @internal */ _waiting_trigger: Function | null  // 等待触发器

    /** @internal */ _cb_progress: ResourceManagerCallbackProgress | null = null
    /** @internal */ _cb_error: ResourceManagerCallbackError | null = null
    /** @internal */ _cb_complete: ResourceManagerCallbackComplete | null = null

    constructor(manifest: ResourceManifest) {
        this._manifest = manifest
        this._list = []
        this._index = new Map()
        this._loaded_count = 0
        this._failure_count = 0
        this._waiting_trigger = null
        this._loading = false
        this._totalCount = manifest.length
    }

    /**
     * 加载资源
     */
    load() {
        this._loaded_count = 0
        this._loading = true
        for (let record of this._manifest) {
            const resourceObject = new ResourceImplement[record.type](record.name, record.uri)
            resourceObject._manager = this
            resourceObject._index = this._list.length
            resourceObject.load()
            this._list.push(resourceObject)
            this._index.set(record.name, resourceObject)
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
    set onProgress(cb: ResourceManagerCallbackProgress | null) { this._cb_progress = cb }

    /**
     * 设置资源加载失败回调
     */
    set onError(cb: ResourceManagerCallbackError | null) { this._cb_error = cb }

    /**
     * 设置资源加载完成回调
     */
    set onComplete(cb: ResourceManagerCallbackComplete | null) { this._cb_complete = cb }


    /** @internal */ _onResourceLoaded(resource: Resource) {
        this._loaded_count++
        if(this._cb_progress) this._cb_progress(this._loaded_count, this._totalCount)
        if(this._loaded_count === this._totalCount) this._onComplete()
    }

    /** @internal */ _onResourceFailed(resource: Resource) {
        if(this._cb_error){
            switch(this._cb_error(resource._index, resource)){
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

    /** @internal */ _onAbort() {
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

    /** @internal */ _onComplete() {
        this._loading = false
        if(this._cb_complete) this._cb_complete()
        if(this._waiting_trigger) this._waiting_trigger()
        this._waiting_trigger = null
    }   

}