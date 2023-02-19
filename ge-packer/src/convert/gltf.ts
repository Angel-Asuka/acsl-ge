import fs from 'fs';
import path from 'path';

declare type MeshData = {
    name: string,
    primitive: {
        attributes: {
            POSITION: number[],
            NORMAL: number[],
            TANGENT: number[],
            TEXCOORD_0: number[],
            TEXCOORD_1: number[],
            JOINTS_0: number[],
            WEIGHTS_0: number[],
        },
        indices: number[],
        material: number,
    }[],
    material: {
        name: string,
        pbrMetallicRoughness: {
            baseColorTexture: {
                index: number,
                texCoord: number,
            },
            metallicFactor: number,
            roughnessFactor: number,
        },
        normalTexture: {
            index: number,
            texCoord: number,
            scale: number,
        },
        occlusionTexture: {
            index: number,
            texCoord: number,
            strength: number,
        },
        emissiveTexture: {
            index: number,
            texCoord: number,
        },
        emissiveFactor: number[],
        alphaMode: string,
        alphaCutoff: number,
        doubleSided: boolean,
    }[]
}

class Mesh{

    constructor(data:any){

    }
}

export function ConvertGLTFMesh(input:string, output:string, name?:string){
    const data = fs.readFileSync(input, 'utf8')
    const json = JSON.parse(data)
    
    if(!name){
        console.log('------ meshes ------')
        const meshes = json.meshes
        for(let m of meshes){
            console.log(m.name)
        }
        console.log('--------------------')
    }

    //fs.writeFileSync(output, data2, 'utf8')
}