import * as FW from '@acsl/fw'
import { Configure } from './config.js'
import { ServiceNode } from '@acsl/ge-sdk'
import { AppManager } from './app-loader.js'

export class Container {

    private http_server: FW.App.Server
    private ws_server: FW.CS.Server
    private cs: ServiceNode
    private apps: AppManager

    constructor(apps: AppManager) {
        this.apps = apps

        this.http_server = new FW.App.Server({
            addr: Configure.srv.addr, 
            port: Configure.srv.port
        })
        this.ws_server = new FW.CS.Server({
            app: this.http_server,
            path: '/',
            on: {
                conn: this.onWSConnected.bind(this),
                close: this.onWSClosed.bind(this),
                msg: this.onWSMessage.bind(this),
                rpc: this.onWSRPC.bind(this)
            }
        })
        this.cs = new ServiceNode({
            center_path: Configure.cs.url,
            auth_id: Configure.cs.id.toString(),
            key: Configure.cs.key,
            service: 'app:container',
            apps: this.apps._appInfos,
            capacity: Configure.capacity,
            onRequest: this.onCSCommand.bind(this)
        })
        this.http_server.run()
    }

    // CS 命令事件
    private async onCSCommand(data:any){
    }

    // 客户端连接事件
    private onWSConnected(conn: FW.CS.Conn, srv: FW.CS.Server){

    }

    // 客户端关闭事件
    private async onWSClosed(conn: FW.CS.Conn, srv: FW.CS.Server){

    }

    // 客户端消息事件
    private async onWSMessage(msg: Buffer, conn: FW.CS.Conn, srv: FW.CS.Server){

    }

    // 客户端 RPC 事件
    private async onWSRPC(msg: Buffer, rpcid: number, conn: FW.CS.Conn, srv: FW.CS.Server) {

    }
}