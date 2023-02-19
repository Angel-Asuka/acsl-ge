import fs from 'node:fs'
import { Configure } from "./config.js"

export declare type AppInfo = {
    commonInstance: boolean         // 是否提供通用实例功能
    privateInstance: boolean        // 是否提供私有实例功能
    staticInstance: boolean         // 是否提供静态实例功能
}

export class App {
    private constructor(){

    }

    static async load(fn:string){
        console.log(fn)
        try{
            const module = await import(fn + '/index.js')
            console.log(module)
        }catch(e){
            console.log(e)
        }
    }
}

export class AppManager {
    _apps: { [appid:string]: App}
    _appInfos: { [appid:string]: AppInfo}

    constructor(){
        this._apps = {}
        this._appInfos = {}
    }

    async loadModule(fn:string){
        try{
            return await import(fn + '/index.js')
        }catch(e){
            console.log(e)
        }
    }

    async load(){
        for(let d of fs.readdirSync(Configure.app.path)){
            const app = await this.loadModule(Configure.app.path + '/' + d) as any
            if(app && app['getAppId'] && app['createInstance']){
                const appid = app['getAppId']()
                const cfg = Configure.app.config[appid]
                this._appInfos[appid] = {
                    commonInstance: cfg?.commonInstance ?? true,
                    privateInstance: cfg?.privateInstance ?? false,
                    staticInstance: cfg?.staticInstance ?? false                        
                }
                this._apps[app['getAppId']()] = app
            }
        }
    }
}