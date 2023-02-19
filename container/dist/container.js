import { App, CS } from '@acsl/fw';
import { Configure } from './config.js';
import { ServiceNode } from '@acsl/ge-sdk';
export class Container {
    http_server;
    ws_server;
    cs;
    constructor() {
        this.http_server = new App.Server({
            addr: Configure.srv.addr,
            port: Configure.srv.port
        });
        this.ws_server = new CS.Server({
            app: this.http_server,
            path: '/',
            on: {
                conn: this.onWSConnected.bind(this),
                close: this.onWSClosed.bind(this),
                msg: this.onWSMessage.bind(this),
                rpc: this.onWSRPC.bind(this)
            }
        });
        this.cs = new ServiceNode({
            center_path: Configure.cs.url,
            auth_id: Configure.cs.id.toString(),
            key: Configure.cs.key,
            service: 'app:container',
            apps: ['mahjong'],
            capacity: Configure.capacity,
            onRequest: this.onCSCommand.bind(this)
        });
        this.http_server.run();
    }
    async onCSCommand(data) {
    }
    onWSConnected(conn, srv) {
    }
    async onWSClosed(conn, srv) {
    }
    async onWSMessage(msg, conn, srv) {
    }
    async onWSRPC(msg, rpcid, conn, srv) {
    }
}
