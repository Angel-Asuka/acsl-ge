import { RenderingCore } from "./core.js"

class RenderingResource {

    /** @internal */ _core: RenderingCore
    /** @internal */ _resourceIdx: number

    constructor(core: RenderingCore) {
        this._core = core
        this._resourceIdx = core._addResource(this)
    }

    destroy() {
        this._core._removeResource(this._resourceIdx)
        this._onDeviceDestroyed()
    }

    // 内部方法，设备销毁时调用
    /** @internal */ _onDeviceDestroyed() { this._onDeviceLost()}

    // 内部方法，设备丢失时调用
    /** @internal */ _onDeviceLost() {}

    // 内部方法，设备恢复时调用
    /** @internal */ _onDeviceRestored() {}
}

export { RenderingResource }