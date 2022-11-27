import { RenderDevice } from "../render/device.js";
import { GameResource } from "./resource.js";

export class GraphicsResource extends GameResource {
    
    device: RenderDevice                // 渲染设备

    constructor(name: string, uri: string, dev:RenderDevice){
        super(name, uri)
        this.device = dev
    }

    // 设备丢失时调用，子类重写
    onDeviceLost(){
        // do nothing
    }

    // 设备恢复时调用，子类重写
    onDeviceRestored(){
        // do nothing
    }
    
}