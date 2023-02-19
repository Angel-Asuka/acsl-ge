import fs from 'node:fs';
import { Configure } from "./config.js";
export class App {
    constructor() {
    }
    static async load(fn) {
        console.log(fn);
        try {
            const module = await import(fn + '/index.js');
            console.log(module);
        }
        catch (e) {
            console.log(e);
        }
    }
}
export class AppManager {
    _apps;
    _appInfos;
    constructor() {
        this._apps = {};
        this._appInfos = {};
    }
    async loadModule(fn) {
        try {
            return await import(fn + '/index.js');
        }
        catch (e) {
            console.log(e);
        }
    }
    async load() {
        for (let d of fs.readdirSync(Configure.app.path)) {
            const app = await this.loadModule(Configure.app.path + '/' + d);
            if (app && app['getAppId'] && app['createInstance']) {
                const appid = app['getAppId']();
                const cfg = Configure.app.config[appid];
                this._appInfos[appid] = {
                    commonInstance: cfg?.commonInstance ?? true,
                    privateInstance: cfg?.privateInstance ?? false,
                    staticInstance: cfg?.staticInstance ?? false
                };
                this._apps[app['getAppId']()] = app;
            }
        }
    }
}
