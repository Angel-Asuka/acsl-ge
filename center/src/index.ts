#!/usr/bin/env node

import url from "node:url"
import path from "node:path"
import * as Configure from "./config.js"
import { Core } from "./core.js"

const root_path = path.dirname(url.fileURLToPath(import.meta.url))
Configure.appConfig.root = root_path
new Core(Configure.appConfig, Configure.coreConfig)
console.log('CSCore started')