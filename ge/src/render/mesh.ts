import { Primitive } from './primitive.js';

export class Mesh {

    /** @internal */ _name: string
    /** @internal */ _primitives: Primitive[]

    constructor(name: string, primitives: Primitive[]) {
        this._name = name
        this._primitives = primitives
    }

    draw(){
        for (const primitive of this._primitives) {
            primitive.draw()
        }
    }
}