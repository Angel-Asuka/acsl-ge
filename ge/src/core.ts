import {RenderingDevice} from './render/device.js'

const kRender = Symbol()
const kOnFrame = Symbol()
const kRunning = Symbol()
const kFrameCallBack = Symbol()

declare type FrameCallBackFunction = ()=>void

export class Core {

    /** @internal */ private [kRender]:RenderingDevice
    /** @internal */ private [kRunning]:boolean
    /** @internal */ private [kFrameCallBack]:FrameCallBackFunction

    constructor(g:RenderingDevice){
        this[kRunning] = false
        this[kRender] = g
        this[kFrameCallBack] = ()=>{}
    }

    activate(){
        this[kRunning] = true
        this[kOnFrame]()
    }

    deactivate(){
        this[kRunning] = false
    }

    get running() { return this[kRunning] }

    get onFrame() { return this[kFrameCallBack] }
    
    set onFrame(v:FrameCallBackFunction) { this[kFrameCallBack] = v }

    [kOnFrame](){
        this[kFrameCallBack]()
        if(this[kRunning]) requestAnimationFrame(this[kOnFrame].bind(this))
    }

    get g() { return this[kRender] }
}