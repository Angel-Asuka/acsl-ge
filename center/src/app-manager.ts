import { AppInstanceType, AppInstance } from './app-instance.js'
import { Core } from './core.js'
import { ServiceNode } from './service-node.js'

// 应用实例管理器
export class AppManager{
    _core: Core
    _appid: string
    _providers: {[uuid:string]:ServiceNode}             // 服务提供者列表
    _common_instances: {[uuid:string]:AppInstance}      // 通用实例

    constructor(core:Core, appid:string){
        this._core = core
        this._appid = appid
        this._providers = {}
        this._common_instances = {}
    }

    /**
     * 请求一个通用实例
     */
    async requestCommonInstance(data:any){
        // 尝试加入现有的实例
        for(let iid in this._common_instances){
            const result = await this._common_instances[iid].node.joinInstance(iid, data)
            if(result) return result
        }
        // 现有的实例都加入不成功，尝试构造一个新的
        for(let uuid in this._providers){
            const provider = this._providers[uuid]
            const inst = await provider.createInstance(this._appid, AppInstanceType.Common, {})
            if(inst){
                this._common_instances[inst.uuid] = inst
                const result = await inst.node.joinInstance(inst.uuid, data)
                if(result) return result
            }
        }
        return null
    }

    addProvider(n: ServiceNode){
        this._providers[n.uuid] = n
    }

    removeProvider(n: ServiceNode){
        for(let iid in n.instances){
            const inst = n.instances[iid]
            if(inst.appid === this._appid){
                if(inst.type === AppInstanceType.Common){
                    delete this._common_instances[iid]
                }
            }
        }
        delete this._providers[n.uuid]
    }

}

export class AppPool{
    _core:Core
    _apps: {[appid:string]:AppManager}

    constructor(core:Core){
        this._core = core
        this._apps = {}
    }

    query(appid:string){
        return this._apps[appid]
    }

    addProvider(n: ServiceNode){
        for(let a in n.apps){
            if(!this._apps[a]){
                this._apps[a] = new AppManager(this._core, a)
            }
            this._apps[a].addProvider(n)
        }
    }

    removeProvider(n: ServiceNode){
        for(let a in n.apps){
            if(this._apps[a]){
                this._apps[a].removeProvider(n)
            }
        }
    }

}