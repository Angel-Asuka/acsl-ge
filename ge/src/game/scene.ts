// 场景对象
export class Scene {
    constructor() {
    }
}

// 场景管理器
export class SceneManager {
    // 场景列表
    scenes: Scene[]

    constructor() {
        this.scenes = []
    }

    // 添加场景
    addScene(scene: Scene) {
        this.scenes.push(scene)
    }

    // 删除场景
    removeScene(scene: Scene) {
        this.scenes = this.scenes.filter((item) => {
            return item !== scene
        })
    }
}