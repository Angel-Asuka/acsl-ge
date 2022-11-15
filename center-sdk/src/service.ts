import {CS, Crypto} from '@acsl/fw'

// 连接请求处理器
declare type ConnectingRequestProc = (data:any)=>void

// 服务配置
declare type ServiceNodeConfig = {
    center_path: string,                        // Center 访问路径
    auth_id: string,                            // 鉴权ID
    key: string,                                // 证书私钥

    service?: string,                           // 提供的服务（none表示没有,app:container表示容器）
    apps?: Array<string>,                       // 支持的应用列表
    capacity?: number,                          // 最大容量

    onConnectingRequest?: ConnectingRequestProc | null,     // 连接请求处理方法。服务不一定会接受连接，例如 GW
}

const K_SVC_CRPROC = Symbol()
const K_SVC_CCLI = Symbol()
const K_SVC_CLICON_PROC = Symbol()
const K_SVC_CLICLO_PROC = Symbol()
const K_SVC_CLIMSG_PROC = Symbol()
const K_SVC_CFG = Symbol()
const K_SVC_READY = Symbol()

export class ServiceNode{
    private [K_SVC_CRPROC]: ConnectingRequestProc
    private [K_SVC_CCLI]: CS.Client
    private [K_SVC_CFG]: ServiceNodeConfig
    private [K_SVC_READY]: boolean

    constructor(cfg:ServiceNodeConfig){
        this[K_SVC_CFG] = cfg
        if(!cfg.service) cfg.service = 'none'
        if(!cfg.apps) cfg.apps = []
        if(!cfg.capacity) cfg.capacity = 0

        this[K_SVC_CRPROC] = (data:any)=>{}
        this[K_SVC_READY] = false
        this[K_SVC_CCLI] = new CS.Client({
            url: cfg.center_path,
            on: {
                conn: this[K_SVC_CLICON_PROC].bind(this),
                close: this[K_SVC_CLICLO_PROC].bind(this),
                msg: this[K_SVC_CLIMSG_PROC].bind(this)
            }
        })
        // 尝试连接
        this[K_SVC_CCLI].open()
    }

    set onConnectingRequest(proc:ConnectingRequestProc){ this[K_SVC_CRPROC] = proc }

    // 获取 Center 客户端状态， true 为已成功连接 center，否则为 false
    get ready(){ return this[K_SVC_READY] }

    // Center 客户端连接事件
    private [K_SVC_CLICON_PROC](cli:CS.Client){
        const data = Crypto.MakeSignature('auth', this[K_SVC_CFG].key, {method:'rsa-sha256'})
        if(data){
            data.id = this[K_SVC_CFG].auth_id
            data.service = this[K_SVC_CFG].service
            data.apps = this[K_SVC_CFG].apps
            data.capacity = this[K_SVC_CFG].capacity
            cli.send(JSON.stringify({cmd:'auth', data:data}))
        }else{
            //! TODO: 签名失败的情况应当通知上层
        }
    }

    // Center 客户端断开事件
    private [K_SVC_CLICLO_PROC](cli:CS.Client){
        setTimeout((function(this:ServiceNode){this[K_SVC_CCLI].open()}).bind(this), 2000)
    }

    // Center 客户端消息事件
    private [K_SVC_CLIMSG_PROC](msg:Buffer, cli:CS.Client){
        console.log(msg)
        try{
            const data = JSON.parse(msg.toString())
            if(data.cmd == 'auth'){
                this[K_SVC_READY] = true
                console.log('Auth OK')
            }
        }catch(e){cli.close()}
    }
}