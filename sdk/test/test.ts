import fs from 'node:fs'
import {ServiceNode} from '../src/service.js'

const svc = new ServiceNode({
    center_path: 'ws://127.0.0.1:11800/ws',
    auth_id: '0',
    key: fs.readFileSync('../../test/test.pem').toString(),
    service: 'app:container',
    apps: ['ox2'],
    capacity: 1024
})