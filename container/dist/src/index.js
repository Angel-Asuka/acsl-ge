#!/usr/bin/env node
import { Container } from "./container.js";
import { AppManager } from "./app-loader.js";
const apps = new AppManager();
await apps.load();
new Container(apps);
