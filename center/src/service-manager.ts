import { Core } from './core.js'
import { ServiceNode } from './service-node.js'

// 服务管理器
export class ServiceManager {
    _core: Core
    _service: string
    _providers: {[uuid:string]:ServiceNode}   // 服务提供者列表

    constructor(c:Core, service:string){
        this._core = c
        this._service = service
        this._providers = {}
    }

    // 服务提供者上线
    addProvider(n: ServiceNode){
        this._providers[n.uuid] = n
    }

    // 服务提供者下线
    removeProvider(n: ServiceNode){
        delete this._providers[n.uuid]
    }

    // 请求服务，取负载不超过 capacity 的服务提供者
    // ! TODO: 负载均衡
    query(){
        for(let k in this._providers){
            const svc = this._providers[k]
            if(svc.load < svc.capacity)
                return svc
        }
    }
}

// 服务池
export class ServicePool{
    _core:Core
    _services: {[service:string]:ServiceManager}

    constructor(core:Core){
        this._core = core
        this._services = {}
    }

    // 服务提供者上线
    addProvider(n: ServiceNode){
        if(n.service == 'app:container') return
        if(!this._services[n.service]){
            this._services[n.service] = new ServiceManager(this._core, n.service)
        }
        this._services[n.service].addProvider(n)
    }

    // 服务提供者下线
    removeProvider(n: ServiceNode){
        if(this._services[n.service]){
            this._services[n.service].removeProvider(n)
        }
    }

    // 请求服务
    query(svc:string){
        if(this._services[svc]){
            return this._services[svc].query()
        }
    }
}