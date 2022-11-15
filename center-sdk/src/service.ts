import {CS, Crypto} from '@acsl/fw'

// 连接请求处理器
declare type ConnectingRequestProc = (data:any)=>void

// 服务类型
// None = 不提供服务； Solo = 独立服务； Container = 容器服务
declare type ServiceType = 'None' | 'Solo' | 'Container'

declare type ServiceConfig = {
    CenterPath: string,                                     // Center 访问路径
    AuthId: string,                                         // 鉴权ID
    Key: string,                                            // 证书私钥
    AcceptConnection?: false,                               // 是否接受连接
    ServiceType?: ServiceType,                              // 服务类型
    ServiceName?: string,                                   // 服务名称（Center 通过名称来索引服务）
    onConnectingRequest?: ConnectingRequestProc | null,     // 连接请求处理方法。服务不一定会接受连接，例如 GW
}

const K_SVC_CRPROC = Symbol()
const K_SVC_CCLI = Symbol()
const K_SVC_CLICON_PROC = Symbol()
const K_SVC_CLICLO_PROC = Symbol()
const K_SVC_CLIMSG_PROC = Symbol()
const K_SVC_CFG = Symbol()
const K_SVC_READY = Symbol()

export class Service{
    private [K_SVC_CRPROC]: ConnectingRequestProc
    private [K_SVC_CCLI]: CS.Client
    private [K_SVC_CFG]: ServiceConfig
    private [K_SVC_READY]: boolean

    constructor(cfg:ServiceConfig){
        this[K_SVC_CFG] = cfg
        this[K_SVC_CRPROC] = (data:any)=>{}
        this[K_SVC_READY] = false
        this[K_SVC_CCLI] = new CS.Client({
            url: cfg.CenterPath,
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

    get ready(){ return this[K_SVC_READY] }

    // Center 客户端连接事件
    private [K_SVC_CLICON_PROC](cli:CS.Client){
        const data = Crypto.MakeSignature('auth', this[K_SVC_CFG].Key, {method:'rsa-sha256'})
        if(data){
            data.id = this[K_SVC_CFG].AuthId
            cli.send(JSON.stringify({cmd:'auth', data:data}))
        }else{
            //! TODO: 签名失败的情况应当通知上层
        }
    }

    // Center 客户端断开事件
    private [K_SVC_CLICLO_PROC](cli:CS.Client){
        setTimeout((function(this:Service){this[K_SVC_CCLI].open()}).bind(this), 2000)
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