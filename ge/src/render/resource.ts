// 渲染资源对象，所有与渲染相关的资源都继承自该类。
// 该类在渲染设备对象中注册，当渲染设备销毁时，该类会自动销毁；当渲染设备丢失时，该类会自动释放；当渲染设备恢复时，该类会自动恢复。

import { RenderDevice } from './device.js';

export class RenderResource {
    /** @internal */ ___device: RenderDevice;
    /** @internal */ ___index_of_device_resources: number = -1;          // 该资源在渲染设备中的索引

    constructor(device: RenderDevice) {
        this.___device = device;
        this.___device.___addResource(this);
    }
    
    // 销毁资源
    destroy() {
        this.___onResourceDestroyed();
        this.___device.___dropResource(this);
    }

    // 获取渲染设备
    get device(): RenderDevice { return this.___device }

    // 获取资源是否就绪，子类重写
    get ready(): boolean { return false }

    // 内部方法，销毁时调用，子类重写
    /** @internal */ ___onResourceDestroyed() {
        this.___onDeviceLost();
    }

    // 内部方法，设备丢失时调用，子类重写
    /** @internal */ ___onDeviceLost() {
        // do nothing
    }

    // 内部方法，设备恢复时调用，子类重写
    /** @internal */ ___onDeviceRestored() {
        // do nothing
    }
}