import fs from 'node:fs'
import {Service} from '../src/service.js'

const svc = new Service({
    CenterPath: 'ws://127.0.0.1:11800/ws',
    AuthId: '0',
    Key: fs.readFileSync('../../test/test.pem').toString()
})