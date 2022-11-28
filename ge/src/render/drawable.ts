import { RenderingDevice } from "./device.js"

export class Drawable {
    
    /** @internal */ _device: RenderingDevice               // 渲染设备

    constructor(device: RenderingDevice) {
        this._device = device
    }

    // 绘制, 子类重写
    draw() {}
}

// 1. 基本几何体
// 1.1 立方体
// 1.2 圆柱体
// 1.3 圆锥体
// 1.4 球体
// 1.5 圆环
// 1.6 圆
// 1.7 多边形
// 1.8 多面体
// 1.9 多面体网格
// 1.10 多面体网格精灵
// 1.11 多面体网格粒子系统
// 1.12 多面体网格节点


// 输入半径、细分数， 生成一个球体的顶点数据
// 顶点数据包括： 顶点坐标， 顶点法线， 顶点纹理坐标
/*
function generateSphere(r:number, subdiv:number) {
    const vertices = [] as number[]
    const normals = [] as number[]
    const uvs = [] as number[]
    const indices = [] as number[]

    // 生成顶点数据
    for (let i=0; i<=subdiv; i++) {
        let v = i / subdiv;
        let phi = v * Math.PI;
        for (let j=0; j<=subdiv; j++) {
            let u = j / subdiv;
            let theta = u * 2 * Math.PI;
            let x = Math.cos(theta) * Math.sin(phi);
            let y = Math.cos(phi);
            let z = Math.sin(theta) * Math.sin(phi);
            vertices.push(x*r, y*r, z*r);
            normals.push(x, y, z);
            uvs.push(u, v);
        }
    }

    // 生成索引数据
    for (let i=0; i<subdiv; i++) {
        for (let j=0; j<subdiv; j++) {
            let a = i * (subdiv+1) + j;
            let b = i * (subdiv+1) + j + 1;
            let c = (i+1) * (subdiv+1) + j;
            let d = (i+1) * (subdiv+1) + j + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    return {
        vertices: vertices,
        normals: normals,
        uvs: uvs,
        indices: indices
    }
}*/