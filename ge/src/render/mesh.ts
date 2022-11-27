import { RenderDevice } from "./device.js"
import { RenderResource } from "./resource.js"

export enum MeshPrimitiveType {
    POINTS = 0,
    LINES = 1,
    LINE_LOOP = 2,
    LINE_STRIP = 3,
    TRIANGLES = 4,
    TRIANGLE_STRIP = 5,
    TRIANGLE_FAN = 6
}

export enum MeshAttributeUsage {
    POSITION = 0,
    NORMAL = 1,
    TANGENT = 2,
    COLOR = 3,
    TEXCOORD_0 = 4,
    TEXCOORD_1 = 5,
    TEXCOORD_2 = 6,
    TEXCOORD_3 = 7,
    TEXCOORD_4 = 8,
    TEXCOORD_5 = 9,
    TEXCOORD_6 = 10,
    TEXCOORD_7 = 11,
    JOINTS_0 = 12,
    WEIGHTS_0 = 13
}

export enum MeshAttributeType {
    BYTE = WebGL2RenderingContext.BYTE,
    UNSIGNED_BYTE = WebGL2RenderingContext.UNSIGNED_BYTE,
    SHORT = WebGL2RenderingContext.SHORT,
    UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT,
    INT = WebGL2RenderingContext.INT,
    UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT,
    FLOAT = WebGL2RenderingContext.FLOAT
}

export type MeshAttribute = {
    name: string            // 属性名称
    type: number            // 属性类型
    usage: number           // 属性用途
    size: number            // 属性大小
    offset: number          // 属性偏移
}