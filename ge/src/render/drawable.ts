import { RenderingDevice } from "./device.js"

export class Drawable {
    
    /** @internal */ _device: RenderingDevice               // 渲染设备

    constructor(device: RenderingDevice) {
        this._device = device
    }

    // 绘制, 子类重写
    draw() {}
}