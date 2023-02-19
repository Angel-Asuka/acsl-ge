import { RenderingCore } from "../core.js"
import { IMaterial, IMaterialData } from "./material.js"
import { RenderingProgram } from "../program.js"
import { Texture } from "../texture.js"
import * as ShaderLib from '../shaderlib.js'

export class StandardMaterialData implements IMaterialData {

    /** @internal */ _material: StandardMaterial
    /** @internal */ _diffuse_map: Texture | null
    /** @internal */ _specular_map: Texture | null
    /** @internal */ _emissive_map: Texture | null
    /** @internal */ _ambient_add: Float32Array
    /** @internal */ _ambient_mul: Float32Array
    /** @internal */ _diffuse_add: Float32Array
    /** @internal */ _diffuse_mul: Float32Array
    /** @internal */ _specular_add: Float32Array
    /** @internal */ _specular_mul: Float32Array
    /** @internal */ _emissive_add: Float32Array
    /** @internal */ _emissive_mul: Float32Array
    /** @internal */ _shininess: number

    constructor(material: StandardMaterial) {
        this._material = material
        this._ambient_add = new Float32Array([0.1, 0.1, 0.1, 1])
        this._ambient_mul = new Float32Array([1, 1, 1, 1])
        this._diffuse_add = new Float32Array([0.7, 0.7, 0.7, 1])
        this._diffuse_mul = new Float32Array([1, 1, 1, 1])
        this._specular_add = new Float32Array([0.25, 0.25, 0.25, 1])
        this._specular_mul = new Float32Array([1, 1, 1, 1])
        this._emissive_add = new Float32Array([0, 0, 0, 1])
        this._emissive_mul = new Float32Array([1, 1, 1, 1])
        this._shininess = 20
        this._diffuse_map = null
        this._specular_map = null
        this._emissive_map = null
    }

    getProgram(): RenderingProgram {
        return this._material._program
    }

    activate(){
        this._material.activate(this)
    }
}

export class StandardMaterial implements IMaterial {

    /** @internal */ _core: RenderingCore
    /** @internal */ _program: RenderingProgram
    /** @internal */ _loc_diffuse: WebGLUniformLocation
    /** @internal */ _loc_specular: WebGLUniformLocation
    /** @internal */ _loc_emissive: WebGLUniformLocation
    /** @internal */ _loc_ambient_add: WebGLUniformLocation
    /** @internal */ _loc_ambient_mul: WebGLUniformLocation
    /** @internal */ _loc_diffuse_add: WebGLUniformLocation
    /** @internal */ _loc_diffuse_mul: WebGLUniformLocation
    /** @internal */ _loc_specular_add: WebGLUniformLocation
    /** @internal */ _loc_specular_mul: WebGLUniformLocation
    /** @internal */ _loc_emissive_add: WebGLUniformLocation
    /** @internal */ _loc_emissive_mul: WebGLUniformLocation
    /** @internal */ _loc_shininess: WebGLUniformLocation
    /** @internal */ _loc_dirlight_dir: WebGLUniformLocation
    /** @internal */ _loc_dirlight_color: WebGLUniformLocation
    /** @internal */ _loc_point_light : {
        position:WebGLUniformLocation,
        color:WebGLUniformLocation,
        constant:WebGLUniformLocation,
        linear:WebGLUniformLocation,
        quadratic:WebGLUniformLocation
    }[]

    constructor(core: RenderingCore) {
        this._core = core
        this._program = new RenderingProgram(core, ShaderLib.std_vs, ShaderLib.std_fs, {compressed:true})
        this._loc_ambient_add = this._program.getUniformLocation("material.ambient_add")!
        this._loc_ambient_mul = this._program.getUniformLocation("material.ambient_mul")!
        this._loc_diffuse_add = this._program.getUniformLocation("material.diffuse_add")!
        this._loc_diffuse_mul = this._program.getUniformLocation("material.diffuse_mul")!
        this._loc_specular_add = this._program.getUniformLocation("material.specular_add")!
        this._loc_specular_mul = this._program.getUniformLocation("material.specular_mul")!
        this._loc_emissive_add = this._program.getUniformLocation("material.emissive_add")!
        this._loc_emissive_mul = this._program.getUniformLocation("material.emissive_mul")!
        this._loc_shininess = this._program.getUniformLocation("material.shininess")!
        this._loc_dirlight_dir = this._program.getUniformLocation("dir_light.direction")!
        this._loc_dirlight_color = this._program.getUniformLocation("dir_light.color")!
        this._loc_diffuse = this._program.getUniformLocation("material.diffuse")!
        this._loc_specular = this._program.getUniformLocation("material.specular")!
        this._loc_emissive = this._program.getUniformLocation("material.emissive")!
        this._loc_point_light = []
        for (let i = 0; i < 4; i++) {
            this._loc_point_light.push({
                position: this._program.getUniformLocation(`point_light[${i}].position`)!,
                color: this._program.getUniformLocation(`point_light[${i}].color`)!,
                constant: this._program.getUniformLocation(`point_light[${i}].constant`)!,
                linear: this._program.getUniformLocation(`point_light[${i}].linear`)!,
                quadratic: this._program.getUniformLocation(`point_light[${i}].quadratic`)!
            })
        }
    }

    createData(): StandardMaterialData {
        return new StandardMaterialData(this)
    }

    activate(data: StandardMaterialData) {
        const ctx = this._core._context
        if(this._core._current_program != this._program) {
            this._program.activate()
            ctx.uniform1i(this._loc_diffuse, 0)
            ctx.uniform1i(this._loc_specular, 1)
            ctx.uniform1i(this._loc_emissive, 2)
        }

        ctx.uniform3fv(this._loc_dirlight_color, [1, 1, 1])
        ctx.uniform3fv(this._loc_dirlight_dir, [0, -1, 1])
        ctx.uniform4fv(this._loc_ambient_add, data._ambient_add)
        ctx.uniform4fv(this._loc_ambient_mul, data._ambient_mul)
        ctx.uniform4fv(this._loc_diffuse_add, data._diffuse_add)
        ctx.uniform4fv(this._loc_diffuse_mul, data._diffuse_mul)
        ctx.uniform4fv(this._loc_specular_add, data._specular_add)
        ctx.uniform4fv(this._loc_specular_mul, data._specular_mul)
        ctx.uniform4fv(this._loc_emissive_add, data._emissive_add)
        ctx.uniform4fv(this._loc_emissive_mul, data._emissive_mul)
        ctx.uniform1f(this._loc_shininess, data._shininess)
        ctx.activeTexture(ctx.TEXTURE0)
        ctx.bindTexture(ctx.TEXTURE_2D, data._diffuse_map?data._diffuse_map._texture:null)
        ctx.activeTexture(ctx.TEXTURE1)
        ctx.bindTexture(ctx.TEXTURE_2D, data._specular_map?data._specular_map._texture:null)
        ctx.activeTexture(ctx.TEXTURE2)
        ctx.bindTexture(ctx.TEXTURE_2D, data._emissive_map?data._emissive_map._texture:null)
    }
} 