import { App, CS, Utils } from "@acsl/fw"
import CertDB from './certdb.js'
import { ServiceNode } from "./service-node.js"
import { AppPool } from "./app-manager.js"
import { ServicePool } from "./service-manager.js"

// 核心
export class Core{

    private http_server: App.Server                     // HTTP服务
    private ws_server: CS.Server                        // WebSocket服务
    private cert_db: CertDB
    private auth_timer: Utils.TimeWheel

    _nodes: {[uuid:string]:ServiceNode} = {}    // 服务节点
    _apps: AppPool                              // 应用池
    _services: ServicePool                      // 服务池
    
    constructor(app_conf:App.AppConfig, conf:any){
        this._apps = new AppPool(this)
        this._services = new ServicePool(this)
        this.cert_db = new CertDB(conf.Key, conf.CertPath)
        this.http_server = new App.Server(app_conf)
        this.ws_server = new CS.Server({
            app: this.http_server, 
            path: conf.ServicePath,
            on: {
                conn: this.OnWSConnected.bind(this),
                close: this.OnWSClosed.bind(this),
                msg: this.OnWSMessage.bind(this),
                rpc: this.OnWSRpc.bind(this)
            }
        })
        this.auth_timer = new Utils.TimeWheel(1000, 5, this.OnAuthTimeout.bind(this))
        this.auth_timer.start()
        this.http_server.run()
    }

    /**
     * 寻找一个提供指定服务的节点，并向其发起一个Rpc调用
     * @param data {svc:服务名称, ...}
     */
    private async OnRpcReqSvc(data:any, conn:CS.Conn){
        if(data && data['svc']){
            const srv = this._services.query(data['svc'])
            if(srv) return srv.request(data)
        }
    }

    private async OnRpcReqComInst(data:any, conn:CS.Conn){
        if(data){
            const app = this._apps.query(data['appid'])
            if(app){
                return app.requestCommonInstance(data['data'])
            }
        }
    }

    // 客户端超时处理
    private OnAuthTimeout(idx: Utils.TimeWhellItem, obj:CS.Conn, tw: Utils.TimeWheel){
        obj.close()
    }

    // 客户端连接事件
    private OnWSConnected(conn: CS.Conn, srv: CS.Server){
        // 客户端必须在一定时间内执行身份验证，否则直接断开
        conn.auth_timout_id = this.auth_timer.join(conn)
    }

    // 客户端关闭事件
    private OnWSClosed(conn: CS.Conn, srv: CS.Server){
        this.auth_timer.remove(conn.auth_timout_id)
        if(conn.svc){
            this.removeNode(conn.svc)
        }
    }

    // 客户端消息事件
    private OnWSMessage(msg: Buffer, conn: CS.Conn, srv: CS.Server){
        const data = Utils.parseJson(msg.toString())
        const d = data['data']
        if(data && 'cmd' in data){
            if(conn.auth_info){
                // 已经通过身份验证的客户端，直接进行命令路由
                const func = `OnCmd${data.cmd}`
                if(typeof this[func] == 'function'){
                    this[func](data, conn)
                        return
                }
            } else if(data['cmd'] == 'auth' && d && d['id'] != null && d['nonce'] && d['ts'] && d['sign']){
                // 未通过身份验证的客户端，进行身份验证
                const cfg = this.cert_db.verify(d['id'], 'auth', d)
                if(cfg != null){
                    conn.auth_info = cfg
                    const replay = this.cert_db.sign('auth')    //签一个回复包
                    if(d['service'] && d['service'] == cfg.service){
                        // 构造服务节点对象，应用注册将由服务节点对象自行完成
                        const node = ServiceNode.create(this, conn, d)
                        conn.svc = node
                        this.addNode(node)
                    }
                    console.log(`Client connected from ${conn.clientAddress}`)
                    this.auth_timer.remove(conn.auth_timout_id)
                    replay.status = 'OK'
                    conn.send(Buffer.from(JSON.stringify({cmd:'auth',data:replay})))
                    return
                }
            }
        }
        conn.close()
    }

    // 客户端远程过程调用事件
    // 将消息解析为JSON对象，然后路由到具体的处理函数
    private async OnWSRpc(msg:Buffer, rpcid:number, conn:CS.Conn, srv:CS.Server){
        try{
            const param = JSON.parse(msg.toString())
            const func = `OnRpc${param.func}`
            if(typeof this[func] == 'function'){
                const ret = await this[func](param.data, rpcid, conn)
                conn.endRpc(ret, rpcid)
                return
            }
        }catch(e){
            console.log(e)
        }
        conn.endRpc(null, rpcid)
    }

    // 添加服务节点
    addNode(n: ServiceNode){
        this._nodes[n.uuid] = n
        this._apps.addProvider(n)
        this._services.addProvider(n)
    }

    // 删除服务节点
    removeNode(n: ServiceNode){
        this._apps.removeProvider(n)
        this._services.removeProvider(n)
        delete this._nodes[n.uuid]
    }

    [k:string]:any
}