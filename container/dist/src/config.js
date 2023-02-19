import fs from 'node:fs';
import url from "node:url";
import path from 'node:path';
import { Utils } from '@acsl/fw';
import YAML from 'yaml';
const cmd = Utils.parseArgv({ '-c': 'ConfigureFile' }, {});
export const Configure = {
    root: path.dirname(url.fileURLToPath(import.meta.url)),
    cs: {
        url: 'ws://127.0.0.1:11800',
        id: 0,
        key: '/etc/ge-container/private.key'
    },
    srv: {
        addr: '0.0.0.0',
        port: 22100,
        url: 'ws://127.0.0.1:22100'
    },
    app: {
        path: './app/',
        config: {}
    },
    capacity: 128
};
try {
    const pth = path.dirname(cmd.ConfigureFile) + '/';
    const cfg = YAML.parse(fs.readFileSync(cmd.ConfigureFile).toString());
    Object.assign(Configure, cfg);
}
catch (e) { }
if (Configure.cs.key[0] != '/')
    Configure.cs.key = path.resolve(path.dirname(cmd.ConfigureFile) + '/' + Configure.cs.key);
if (Configure.app.path[0] != '/')
    Configure.app.path = path.resolve(path.dirname(cmd.ConfigureFile) + '/' + Configure.app.path);
try {
    Configure.cs.key = fs.readFileSync(Configure.cs.key).toString();
}
catch (e) {
    console.log('Cannot read key file: ' + Configure.cs.key);
    process.exit(1);
}
console.log('-- ACSL Container --');
console.log('Configure:');
console.log('    /   = ' + Configure.root);
console.log('    cs  = ' + Configure.cs.id + ' @ ' + Configure.cs.url);
console.log('    srv = ' + Configure.srv.addr + ':' + Configure.srv.port + ' for ' + Configure.srv.url);
console.log('    app = ' + Configure.app.path);
