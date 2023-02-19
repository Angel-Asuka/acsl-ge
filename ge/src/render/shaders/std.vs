// 标准 3D 材质顶点着色器
attribute vec4 a_pos;               // 顶点位置
attribute vec3 a_normal;            // 顶点法线
attribute vec2 a_uv;                // 顶点纹理坐标

uniform mat4 mw;                    // 世界矩阵
uniform mat4 mpv;                   // 视图投影矩阵

varying vec2 t;                     // 顶点纹理坐标
varying vec3 n;                     // 顶点法线
varying vec3 p;                     // 顶点位置

void main(){
    gl_Position = mpv * mw * a_pos;
    t = a_uv;
    n = (mw * vec4(a_normal,0)).xyz;
    p = (mw * a_pos).xyz;
}