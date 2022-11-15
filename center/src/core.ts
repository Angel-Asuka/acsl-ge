import { App, CS, Utils, Crypto} from '@acsl/fw'
import CertDB from './certdb.js'

declare type AppInstance = {
    uuid: string,
    app:  string,
    node: ServiceNode
}

// 服务节点
declare type ServiceNode = {
    uuid: string,               // 节点ID
    service: string,            // 服务ID
    apps: Array<string>,        // 能够提供的应用服务列表
    capacity: number,           // 容量
    load: number,               // 负载
    instances:{[uuid:string]:AppInstance},   // 由该节点构造的应用实例对象
    conn: CS.Conn               // 对应的连接对象
}

// 应用数据
declare type AppInfo = {
    node_pool: {[uuid:string]:ServiceNode},
    instances: {[uuid:string]:AppInstance}
}

export class Core{
    private http_server: App.Server
    private ws_server: CS.Server
    private cert_db: CertDB
    private auth_timer: Utils.TimeWheel

    private node_map:{[uuid:string]:ServiceNode}                    // 服务结点总表
    private app_map:{[appid:string]:AppInfo}                        // 应用总表
    private svc_map:{[appid:string]:{[uuid:string]:ServiceNode}}    // 独立服务表
    
    constructor(app_conf:App.AppConfig, conf:any){
        this.node_map = {}
        this.app_map = {}
        this.svc_map = {}

        this.cert_db = new CertDB(conf.Key, conf.CertPath)
        this.http_server = new App.Server(app_conf)
        this.ws_server = new CS.Server({
            app: this.http_server, 
            path: conf.ServicePath,
            on: {
                conn: this.OnWSConnected.bind(this),
                close: this.OnWSClosed.bind(this),
                msg: this.OnWSMessage.bind(this)
            }
        })
        this.auth_timer = new Utils.TimeWheel(1000, 5, this.onAuthTimeout.bind(this))
        this.auth_timer.start()
        this.http_server.run()
    }

    // 客户端超时处理
    private onAuthTimeout(idx: Utils.TimeWhellItem, obj:CS.Conn, tw: Utils.TimeWheel){
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
        const svc:ServiceNode = conn.svc
        if(svc){
            if(svc.service == 'app:container'){
                for(let i in svc.instances){
                    if( svc.instances[i].app in this.app_map && i in this.app_map[svc.instances[i].app].instances){
                        delete this.app_map[svc.instances[i].app].instances[i]  
                    }
                }
                for(let a of svc.apps){
                    if(a in this.app_map && svc.uuid in this.app_map[a].node_pool)
                        delete this.app_map[a].node_pool[svc.uuid]
                }
            }else{
                if(svc.service in this.svc_map && svc.uuid in this.svc_map[svc.service]){
                        delete this.svc_map[svc.service][svc.uuid]
                }
            }
            if(svc.uuid in this.node_map)
                delete this.node_map[svc.uuid]
        }
    }

    // 客户端消息事件
    private OnWSMessage(msg: Buffer, conn: CS.Conn, srv: CS.Server){
        const data = Utils.parseJson(msg.toString())
        if(data && 'cmd' in data){
            if(conn.auth_info){
                //! TODO: Process ...
                // 根据 cmd 来进行处理路由
                return
            } else if(data.cmd == 'auth' && 'data' in data && 'id' in data.data && 'nonce' in data.data && 'ts' in data.data && 'sign' in data.data){
                const cfg = this.cert_db.verify(data.data.id, 'auth', data.data)
                if(cfg != null){
                    conn.auth_info = {
                        cfg: cfg
                    }
                    const replay = this.cert_db.sign('auth')
                    if(replay){
                        if('service' in data.data && data.data.service != 'none'){
                            if(!data.data.apps) data.data.apps = []
                            if(!data.data.capacity) data.data.capacity = 0
                            const svc:ServiceNode = {
                                uuid: Crypto.uuidHex(),
                                service: data.data.service,
                                apps: data.data.apps,
                                capacity: data.data.capacity,
                                load: 0,
                                instances: {},
                                conn: conn
                            }
                            conn.svc = svc
                            this.node_map[svc.uuid] = svc
                            if(svc.service == 'app:container'){
                                for(let a of svc.apps){
                                    if(!(a in this.app_map))
                                        this.app_map[a] = {node_pool:{},instances:{}}
                                    this.app_map[a].node_pool[svc.uuid] = svc
                                }
                            }else{
                                if(!(svc.service in this.svc_map))
                                    this.svc_map[svc.service] = {}
                                this.svc_map[svc.service][svc.uuid] = svc
                            }
                        }
                        this.auth_timer.remove(conn.auth_timout_id)
                        replay.status = 'OK'
                        conn.send(Buffer.from(JSON.stringify({cmd:'auth',data:replay})))
                        return
                    }
                }
            }
        }
        conn.close()
    }
    
}