//标准着色器代码库
export const StdShaders = {
    vs:{
        // 切片纹理顶点着色器， mw 是世界矩阵， ms 是切片矩阵， a_pos 是顶点坐标， a_uv 是纹理坐标，输出 t 是纹理坐标
        slice: 'attribute vec4 a_pos;attribute vec2 a_uv;uniform mat4 mw;uniform mat4 ms;varying vec2 t;void main(){gl_Position=mw*vec4(a_pos.xy*ms[0].xy+ms[0].zw,0,1);t=a_uv*ms[1].xy+ms[1].zw;}'
    },
    fs:{
        // 标准纹理采样片段着色器，使用纹理坐标 t 对 s 进行纹理采样，输出颜色
        std: 'varying mediump vec2 t;uniform sampler2D s;void main(){gl_FragColor=texture2D(s,t);}',
        // 标准颜色叠加纹理采样片段着色器，使用纹理坐标 t 对 s 进行纹理采样，输出由矩阵 mc 变换后的颜色
        stdc: 'varying mediump vec2 t;uniform lowp mat4 mc;uniform sampler2D s;void main(){gl_FragColor=mc*texture2D(s,t);}',

    }
}