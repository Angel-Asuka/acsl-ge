import './index.css'
import './gepack.res'
import './1.gltf'

import * as Ge from '../../dist'
const canvas = document.createElement('canvas')
canvas.width = 1024
canvas.height = 768
document.body.appendChild(canvas)

const ge = new Ge.RenderingCore(canvas)

console.log(ge)

const gltf = await(await fetch('./1.gltf')).json()

console.log(gltf)

const [meshes, images] = await Ge.glTF.load(ge, gltf)

for(let img of images){
    document.body.appendChild(img._img)
}

class ly implements Ge.IRenderingLayer{
    render(){
        for(let m of meshes)
            m.draw()
    }
}

const l = new ly()

ge.setStages([
    new Ge.StandardStage(ge, {
        layers:[l], 
        view: new Ge.Camera(ge, {
            position: [1,1,-1],
            target: [0,0.5,0],
            up: [0,1,0],
            fov: 45,
            near: 0.1,
            far: 1000
        }),
        clear_color: [0.2,0,0,1],
        clear_depth: 1,
        enable_depth: true,
    })
])

const matw = new Ge.Matrix4()
ge.setWorldMatrix(matw.data)

function doframe(){
    ge.render()
    requestAnimationFrame(doframe)
}

doframe()

let draging = false
let lastx = 0
let lasty = 0
let matLast = new Ge.Matrix4()

window.onmousedown = (e)=>{
    draging = true
    lastx = e.clientX
    lasty = e.clientY
    matLast.copy(matw)
}

window.onmousemove = (e)=>{
    if(draging){
        const dx = e.clientX - lastx
        const dy = e.clientY - lasty
        const mat = new Ge.Matrix4()
        mat.rotateY(dx/100)
        //mat.rotateX(-dy/100)
        mat.multiply(matLast)
        matw.copy(mat)
        ge.setWorldMatrix(matw.data)
    }
}

window.onmouseup = (e)=>{
    draging = false
}

/*
const g = Ge.RenderingDevice.fromCanvas(canvas)!
const c = new Ge.Core(g)
const gl = g.context

const rm = new Ge.ResourceManager()
rm.load({name:'p0', type:Ge.ResourceType.Package, url:'./gepack.res'})
await rm.wait()

const s = rm.nameOf('demon') as SlicedResource
const t = s.getSlicedTexture(g)

const layer1 = new Ge.Layer()

const camera1 = c.createCamera({
    position: [3, 2, -5],           // 摄像机位置
    target: [0, 0, 0],              // 摄像机目标
    up: [0, 1, 0],                  // 摄像机上向量
    fov: 45,                        // 摄像机视野角度
    near: 0.1,                      // 摄像机近裁剪面
    far: 1000                       // 摄像机远裁剪面
})
camera1.fov = 45
camera1.lookAt([3,2,-5], [0,0,0], [0,1,0])


const stage1 = c.createRenderingStage({
    view: camera1,
    layers: [layer1],
    target: g.defaultRenderingTarget,
    clear_color: [0.2, 0, 0, 1],
    clear_depth: 1.0,
    enable_depth: true,
})

const scene = c.createScene()
scene.addLayer(layer1)
scene.addStage(stage1)
c.setScene(scene)

c.activate()
*/