export interface IView {
    update():void                                       // 更新视口
    getViewProjMatrix(): Float32Array                   // 获取视图投影矩阵
    getViewMatrix(): Float32Array                       // 获取视图矩阵
    activate():void                                     // 激活视口
}