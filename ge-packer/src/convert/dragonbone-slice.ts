import fs from 'fs';
import path from 'path';

export function ConvertDragonBoneSlice(input:string, output:string, name?:string){
    const data = fs.readFileSync(input, 'utf8')
    const json = JSON.parse(data)
    const texture = json['SubTexture']
    const mw = json.width
    const mh = json.height
    if(mw == null || mh == null){
        console.log('Invalid DragonBone slice file, missing width or height')
    }
    const src_ext = json.imagePath.split('.').pop()
    const new_image = output.substring(0, output.lastIndexOf('.')) + '.' + src_ext
    // 复制图片
    fs.copyFileSync(path.dirname(input) + '/' + json.imagePath, new_image)

    const out = {name:name??json.name, image: path.basename(new_image), size:[json.width, json.height], slices:[] as any[]}
    for(let v of texture){
        const name = v['name']
        const x = v['x']
        const y = v['y']
        const w = v['width']
        const h = v['height']
        const fx = v['frameX']??0
        const fy = v['frameY']??0
        const fw = v['frameWidth']??w
        const fh = v['frameHeight']??h
        out.slices.push({
            name: name,
            size: [fw, fh],
            mat: [
                fw/w,   fh/h,   -fx/w,   -fy/h,
                 w/mw,   h/mh,    x/mw,    y/mh,
            ]
        })
    }
    const data2 = JSON.stringify(out, null, 4)
    fs.writeFileSync(output, data2, 'utf8')
}