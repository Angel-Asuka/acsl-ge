import fs from 'node:fs'
import path from 'node:path'
import { App, Utils } from '@acsl/fw'
import YAML from 'yaml';

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
    const cfg = YAML.parse(fs.readFileSync(cmd.ConfigureFile).toString())
    if(cfg["listen-port"]) appConfig.port = cfg["listen-port"]
    if(cfg["service-path"]) coreConfig.ServicePath = ((cfg["service-path"][0]=='.')?pth:'') + cfg["service-path"]
    if(cfg["certs-path"]) coreConfig.CertPath = ((cfg["certs-path"][0]=='.')?pth:'') + cfg["certs-path"]
    if(cfg["key"]) coreConfig.Key = ((cfg["key"][0]=='.')?pth:'') + cfg["key"]
}catch(e){}

coreConfig.CertPath = path.resolve(coreConfig.CertPath)
coreConfig.Key = path.resolve(coreConfig.Key)