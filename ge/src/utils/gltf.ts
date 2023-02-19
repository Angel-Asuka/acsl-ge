import { RenderingCore } from '../render/core.js'
import { StaticBuffer } from '../render/static-buffer.js'
import { Primitive, Indices, VertexAttribute, VertexAttributeUsage } from '../render/primitive.js';
import { Mesh } from '../render/mesh.js'
import * as b64 from './base64.js'
import { ImageTexture } from '../render/image-texture.js';

let mesh_cnt = 0;

const SIZE_OF_ACCESSOR = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
}

const VERTEX_USAGE_OF_ATTRIBUTE = {
    POSITION: VertexAttributeUsage.POSITION,
    NORMAL: VertexAttributeUsage.NORMAL,
    TANGENT: VertexAttributeUsage.TANGENT,
    COLOR_0: VertexAttributeUsage.COLOR,
    TEXCOORD_0: VertexAttributeUsage.TEXCOORD_0,
    TEXCOORD_1: VertexAttributeUsage.TEXCOORD_1,
    TEXCOORD_2: VertexAttributeUsage.TEXCOORD_2,
    TEXCOORD_3: VertexAttributeUsage.TEXCOORD_3,
    TEXCOORD_4: VertexAttributeUsage.TEXCOORD_4,
    TEXCOORD_5: VertexAttributeUsage.TEXCOORD_5,
    TEXCOORD_6: VertexAttributeUsage.TEXCOORD_6,
    TEXCOORD_7: VertexAttributeUsage.TEXCOORD_7,
    JOINTS_0: VertexAttributeUsage.JOINTS_0,
    WEIGHTS_0: VertexAttributeUsage.WEIGHTS_0,
    JOINTS_1: VertexAttributeUsage.JOINTS_1,
    WEIGHTS_1: VertexAttributeUsage.WEIGHTS_1
}

async function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = src;
    });
}


class glTF {

    static async load(core:RenderingCore, json: any){

        // 读取 buffers
        const buffers = [] as ArrayBuffer[]
        if('buffers' in json){
            for(let i = 0; i < json.buffers.length; i++){
                const buffer = json.buffers[i]
                if('uri' in buffer){
                    if(buffer.uri.startsWith('data:')){
                        const data = b64.decode(buffer.uri.split(',')[1])
                        buffers.push(data)
                    }else{
                        //TODO! LOAD FROM FILE
                    }
                }else{
                    // UNSUPPORTED
                }
            }
        }

        // 读取 images
        const images = [] as ImageTexture[]
        if('images' in json){
            for(let img of json.images){
                if('uri' in img){
                    images.push(new ImageTexture(core, await loadImage(img.uri)))
                }else if('bufferView' in img){
                    const bufferView = json.bufferViews[img.bufferView]
                    const data = buffers[bufferView.buffer].slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
                    images.push(new ImageTexture(core, await loadImage(URL.createObjectURL(new Blob([data])))))
                }
            }
        }

        // 读取 Meshes
        const meshes = [] as Mesh[]
        if('meshes' in json){
            for(let mesh of json.meshes){
                mesh_cnt++;
                const name = mesh.name || `gltf-mesh-${mesh_cnt}`;
                const primitives = [] as Primitive[]
                for(let pri of mesh.primitives){
                    const mode = pri.mode || 4;
                    const attrs = [] as any[]
                    let indexbuffer = null;
                    const attributes = pri.attributes as { [key: string]: number };
                    let bufOffset = 0
                    const bufArrays = [] as ArrayBuffer[]
                    for(let key in attributes){
                        const accessor = json.accessors[attributes[key]];
                        if('bufferView' in accessor){
                            const bufferView = json.bufferViews[accessor.bufferView];
                            const offset = bufferView.byteOffset || 0;
                            attrs.push({
                                usage: VERTEX_USAGE_OF_ATTRIBUTE[key as keyof typeof VERTEX_USAGE_OF_ATTRIBUTE],
                                location: -1,
                                byteOffset: bufOffset,
                                byteStride: bufferView.byteStride || 0,
                                byteLength: bufferView.byteLength,
                                type: accessor.componentType,
                                size: SIZE_OF_ACCESSOR[accessor.type as keyof typeof SIZE_OF_ACCESSOR],
                                normalized: accessor.normalized || false,
                            })
                            bufArrays.push(buffers[bufferView.buffer].slice(offset, offset + bufferView.byteLength))
                            bufOffset += bufferView.byteLength
                        }else{
                            //! TODO: Process sparse accessor
                        }
                    }
                    const ab = await (new Blob(bufArrays)).arrayBuffer()
                    const buffer = new StaticBuffer(core, core._context.ARRAY_BUFFER ,ab)
                    attrs.forEach(v=>v.buffer = buffer)

                    if(pri.indices){
                        const accessor = json.accessors[pri.indices];
                        const bufferView = json.bufferViews[accessor.bufferView];
                        const offset = bufferView.byteOffset || 0;
                        indexbuffer = {
                            type: accessor.componentType,
                            count: accessor.count,
                            byteOffset: 0,
                            byteLength: bufferView.byteLength,
                            buffer: new StaticBuffer(core, core._context.ELEMENT_ARRAY_BUFFER ,buffers[bufferView.buffer].slice(offset, offset + bufferView.byteLength))
                        } as Indices
                    }

                    primitives.push(new Primitive(core, mode, attrs, indexbuffer, null))

                    // TODO: 处理 material 和 targets
                    //const material = pri.material || -1;
                    //const targets = pri.targets;
                }
                meshes.push(new Mesh(name, primitives))
            }
        }
        return [meshes, images]
    }
}

export { glTF }