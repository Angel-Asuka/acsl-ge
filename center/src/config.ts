import fs from 'node:fs'
import path from 'node:path'
import { App, Utils } from '@acsl/fw'

const cmd = Utils.parseArgv({'-c': 'ConfigureFile'},{}) 

export const appConfig:App.AppConfig = {
    port: 11800
}

export const coreConfig = {
    ServicePath: '/svc',
    CertPath: '/etc/ge-center/auth/',
    Key: '/etc/ge-center/private.key'
}

try{
    const pth = path.dirname(cmd.ConfigureFile) + '/'
    const cfg = JSON.parse(fs.readFileSync(cmd.ConfigureFile).toString())
    if(cfg.ServicePath) coreConfig.ServicePath = ((cfg.ServicePath[0]=='.')?pth:'') + cfg.ServicePath
    if(cfg.CertPath) coreConfig.CertPath = ((cfg.CertPath[0]=='.')?pth:'') + cfg.CertPath
    if(cfg.Key) coreConfig.Key = ((cfg.Key[0]=='.')?pth:'') + cfg.Key
}catch(e){}

coreConfig.CertPath = path.resolve(coreConfig.CertPath)
coreConfig.Key = path.resolve(coreConfig.Key)