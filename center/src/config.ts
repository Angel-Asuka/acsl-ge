import fs from 'node:fs'
import { App, Utils } from '@acsl/fw'

const cmd = Utils.parseArgv({'-c': 'ConfigureFile'},{}) 

export const appConfig:App.AppConfig = {
    port: 11800
}

export const coreConfig = {
    ServicePath: '/ws',
    CertPath: '/etc/ge-center/auth/',
    Key: '/etc/ge-center/private.key'
}