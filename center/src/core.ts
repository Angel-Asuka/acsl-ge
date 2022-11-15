import { App, CS, Utils } from '@acsl/fw'
import CertDB from './certdb.js'

export class Core{
    private HttpServer: App.Server
    private WSServer: CS.Server
    private CertDB: CertDB
    private AuthTimer: Utils.TimeWheel
    
    constructor(app_conf:App.AppConfig, conf:any){
        this.CertDB = new CertDB(conf.Key, conf.CertPath)
        this.HttpServer = new App.Server(app_conf)
        this.WSServer = new CS.Server({
            app: this.HttpServer, 
            path: conf.ServicePath,
            on: {
                conn: this.OnWSConnected.bind(this),
                close: this.OnWSClosed.bind(this),
                msg: this.OnWSMessage.bind(this)
            }
        })
        this.AuthTimer = new Utils.TimeWheel(1000, 5, this.onAuthTimeout.bind(this))
        this.AuthTimer.start()
        this.HttpServer.run()
    }

    // 客户端超时处理
    private onAuthTimeout(idx: Utils.TimeWhellItem, obj:CS.Conn, tw: Utils.TimeWheel){
        obj.close()
    }

    // 客户端连接事件
    private OnWSConnected(conn: CS.Conn, srv: CS.Server){
        // 客户端必须在一定时间内执行身份验证，否则直接断开
        conn.auth_timout_id = this.AuthTimer.join(conn)
    }

    // 客户端关闭事件
    private OnWSClosed(conn: CS.Conn, srv: CS.Server){
        this.AuthTimer.remove(conn.auth_timout_id)
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
                const cfg = this.CertDB.verify(data.data.id, 'auth', data.data)
                if(cfg != null){
                    conn.auth_info = {
                        cfg: cfg
                    }
                    const replay = this.CertDB.sign('auth')
                    if(replay){
                        this.AuthTimer.remove(conn.auth_timout_id)
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