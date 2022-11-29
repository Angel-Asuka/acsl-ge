import './index.css'
import './thor.jpg'
import './teapot.obj'

import * as Ge from '../../dist'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.appendChild(canvas)

const g = Ge.RenderingDevice.fromCanvas(canvas)!
const c = new Ge.Core(g)

const enc = new TextEncoder()
const dec = new TextDecoder()
const val = enc.encode(Ge.StdShaders.vs.slice)
const cmp = await Ge.Package.compress(val)

console.log(val)
console.log(cmp)

console.log(val.byteLength)
console.log(cmp.byteLength)
console.log(dec.decode(await Ge.Package.decompress(cmp)))