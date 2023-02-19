import { Crypto, CS } from '@acsl/fw'
import { Core } from './core.js'
import { AppInstanceType, AppInstance } from './app-instance.js'

// 节点提供的应用服务的配置
declare type AppConfigure = {
    commonInstance: boolean         // 是否提供通用实例功能
    privateInstance: boolean        // 是否提供私有实例功能
    staticInstance: boolean         // 是否提供静态实例功能
    [key:string]:any                // 其他配置信息
}

// 应用服务配置列表，即能够提供的应用服务列表
declare type AppConfigureList = {[appid:string]:AppConfigure}

const InstanceTypeKey = {
    [AppInstanceType.Common]: 'commonInstance',
    [AppInstanceType.Private]: 'privateInstance',
    [AppInstanceType.Static]: 'staticInstance'
}

// 服务节点
export class ServiceNode {
    uuid: string                // 节点ID
    service: string             // 服务ID
    apps: AppConfigureList      // 能够提供的应用服务列表
    capacity: number            // 容量
    load: number                // 负载
    conn: CS.Conn               // 对应的连接对象

    instances: {[iid:string]:AppInstance} = {}    // 该节点上的实例列表

    _core: Core

    private constructor(core:Core, c:CS.Conn, data:any){
        this._core = core
        this.uuid = Crypto.uuidHex()        // 节点上线总是获得一个新的ID
        this.service = data.service
        this.apps = data.apps || {}
        this.capacity = data.capacity
        this.load = 0
        this.conn = c
        console.log(this.apps)
    }

    async rpc(func: string, data:any){
        return this.conn.rpc(JSON.stringify({func:func, data:data}))
    }

    async request(data:any){
        return this.rpc('ReqSvc', data)
    }

    /**
     * 加入实例
     * @param iid 实例ID
     * @param data 
     * @returns 成功返回由节点返回的数据，失败返回null
     */
    async joinInstance(iid: string, data:any):Promise<any|null>{
        const inst = this.instances[iid]
        if(inst && inst.load < inst.capacity){
            inst.load++
            const result = this.rpc('Join', {iid:iid, data:data})
            if(result){
                return result
            }
            inst.load--
        }
        return null
    }

    /**
     * 创建新的应用实例
     * @param appid 应用ID
     * @param options 选项
     * @returns 如果创建成功，返回实例对象，否则返回null
     */
    async createInstance(appid: string, type:AppInstanceType, options:any):Promise<AppInstance|null> {
        const cfg = this.apps[appid]
        console.log(cfg)
        if(cfg && cfg[InstanceTypeKey[type]] === true && this.load < this.capacity){
            this.load++
            const result = await this.rpc('Create', {appid:appid, options:{...options, type:type}})
            if(result){
                const inst = new AppInstance(this, type, result)
                this.instances[inst.uuid] = inst
                return inst
            }
            this.load--
        }
        return null
    }

    static create(core:Core, c:CS.Conn, data:any){
        return new ServiceNode(core, c, data)
    }

}