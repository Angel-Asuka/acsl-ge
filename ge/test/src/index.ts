import './index.css'
import './gepack.res'

import * as Ge from '../../dist'
import { ImageResource, SlicedResource, SlicedTexture } from '../../dist'

const canvas = document.createElement('canvas')
canvas.width = 640
canvas.height = 480
document.body.appendChild(canvas)

const g = Ge.RenderingDevice.fromCanvas(canvas)!
const c = new Ge.Core(g)
const gl = g.context

const rm = new Ge.ResourceManager()
rm.load({name:'p0', type:Ge.ResourceType.Package, url:'./gepack.res'})
await rm.wait()

const s = rm.nameOf('demon') as SlicedResource
const t = s.getSlicedTexture(g)

const mat_proj = new Ge.Matrix4()

let i = 0

c.onFrame = () => {
    gl.clearColor(0.3, 0, 0, 1)
    gl.clearDepth(1)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    g.stdProgramSlice.activate()
    t.texture.bind(0)
    mat_proj.identity() 
    mat_proj.from2D(10, 10, 86.5*4, 56.5*4, 640, 480)
    g.stdProgramSlice.setUniformByName('mw', mat_proj.data)

    t.drawSlice(Math.floor(i) % t.count)
    i += 0.5
}

c.activate()