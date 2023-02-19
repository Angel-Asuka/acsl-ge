import { Scene } from './game/scene.js'
import { RenderingCore } from './render/index.js'

import {Layer} from './game/layer.js'
import {RenderingStage, RenderingStageOptions} from './game/rendering-stage.js'
import {Camera, CameraDeclaration} from './game/camera.js'

declare type FrameCallBackFunction = ()=>void

export class Core {

    /** @internal */ private _renderer:RenderingCore              // 渲染核心
    /** @internal */ private _running:boolean                   // 是否运行中
    /** @internal */ private _cbFrame:FrameCallBackFunction     // 帧处理回调函数
    /** @internal */ private _current_scene:Scene | null        // 当前场景

    constructor(g:RenderingCore){
        this._running = false
        this._renderer = g
        this._current_scene = null
        this._cbFrame = ()=>{}
    }

    createScene(){ return new Scene(this) }
    createRenderingStage(options?:RenderingStageOptions){ return new RenderingStage(this, options) }
    createCamera(decl?:CameraDeclaration){ return new Camera(this, decl) }

    /**
     * 启动游戏
     */
    activate(){
        this._running = true
        this._onFrame()
    }

    /**
     * 停止游戏
     */
    deactivate(){
        this._running = false
    }

    /**
     * 是否运行中
     */
    get running() { return this._running }

    /**
     * 设置当前场景
     */
    setScene(scene:Scene){
        this._current_scene = scene
    }

    /**
     * 获取当前场景
     * @returns 场景
     */
    getScene():Scene | null {
        return this._current_scene
    }

    /**
     * 获取帧处理回调函数
     */
    get onFrame() { return this._cbFrame }
    
    /**
     * 设置帧处理回调函数
     */
    set onFrame(v:FrameCallBackFunction) { this._cbFrame = v }

    /**
     * 获取渲染设备
     */
    get device() { return this._renderer }

    /**
     * 帧处理
     */
    /** @internal */ _onFrame(){
        const ts = Date.now()
        this._cbFrame()
        if(this._current_scene){
            this._current_scene.update(ts)
            // 下面执行渲染流程
            this._current_scene.draw()
        }
        if(this._running) requestAnimationFrame(this._onFrame.bind(this))
    }

}