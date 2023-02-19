import { ServiceNode } from './service-node.js'

export enum AppInstanceType {
    Common = 'common',              // 通用实例
    Private = 'private',            // 私有实例
    Static = 'static',              // 静态实例
}

// 应用实例
export class AppInstance {
    uuid:   string          // 应用实例ID
    appid:  string          // 应用ID
    type:   AppInstanceType // 实例类型
    node:   ServiceNode     // 所属节点
    load:   number          // 负载
    capacity: number        // 容量

    constructor(n: ServiceNode, type:AppInstanceType, data: any) {
        this.uuid = data.uuid
        this.appid = data.appid
        this.type = type
        this.node = n
        this.load = 0
        this.capacity = data.capacity || 1
    }
       
}