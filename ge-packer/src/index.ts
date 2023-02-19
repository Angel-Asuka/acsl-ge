import { parseArgv } from './utils.js'
import { printUsage, printVersion } from './usage.js'
import { ConvertDragonBoneSlice } from './convert/dragonbone-slice.js'
import { ConvertGLTFMesh } from './convert/gltf.js'
import * as Compiler from './compiler/compiler.js'
import path from 'path'
import fs from 'node:fs'

import { Lzma } from './lzma.js'

const cmdline = parseArgv({
    '-i':'filename',
    '--input':'filename',
    '-d':'dir',
    '--dir':'dir',
    '-o':'output',
    '--output':'output',
    '-n':'name',
    '--name':'name',
    '-e':'enc',
    '--enc':'enc',
    '--db-slice':'convert-db-slice',
    '--gltf-mesh':'convert-gltf-mesh',
    '-c': 'compress',
    '-compress': 'compress'
},{'-h':'printHelp', '-v':'printVersion'},undefined,()=>{printUsage();process.exit()})

if('printHelp' in cmdline){
    printUsage()
    process.exit()
}

if('printVersion' in cmdline){
    printVersion()
    process.exit()
}            

cmdline.filename = cmdline.filename || 'gepack.json'
cmdline.dir = cmdline.dir || '.'
cmdline.compress = cmdline.compress ?? 0;
const filepath = path.join(path.resolve(cmdline.dir), cmdline.filename)

// 转换 DragonBone 的切片贴图
if('convert-db-slice' in cmdline){
    ConvertDragonBoneSlice(cmdline['convert-db-slice'], cmdline.output, cmdline.name)
    console.log('Done.')
    process.exit()
}

if('convert-gltf-mesh' in cmdline){
    ConvertGLTFMesh(cmdline['convert-gltf-mesh'], cmdline.output, cmdline.name)
    console.log('Done.')
    process.exit()
}

/*
    .res 文件格式
    .res 是一个二进制文件，开头 0xFF 明文 .res 文件， 0x5A 表示是一个加密的 .res 文件

    + 0x00 - 资源总数
    + 0x01 - 资源 1 的偏移
    + 0x02 - 资源 2 的偏移
    ...

*/

// 没有特殊任务，开始处理打包事物
try{
    console.log(`+0 Loading ${filepath}...`);
    const ts = Date.now()
    const manifest = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const res_data = [] as Uint8Array[]
    for (let res of manifest.resources) {
        switch (res.type) {
            case 'image':
                console.log(`+${(Date.now() - ts)} Loading ${res.name} as Image...`);
                res_data.push(Compiler.compileImage(res.name, path.join(path.resolve(cmdline.dir), res.src)));
                break;
            case 'slice':
                console.log(`+${(Date.now() - ts)} Loading ${res.name} as Slice...`);
                res_data.push(Compiler.compileSlice(res.name, path.join(path.resolve(cmdline.dir), res.src)));
                break;
        }
    }
    console.log(`+${(Date.now() - ts)} Building Metadata...`);
    const resmap = new Uint8Array(2 + res_data.length * 4);
    const view = new DataView(resmap.buffer);
    for (let i = 0; i < res_data.length; i++)
        view.setUint32(2 + i * 4, res_data[i].length, true);
    view.setUint16(0, res_data.length, true);
    console.log(`+${(Date.now() - ts)} Compressing...`);
    const all = new Uint8Array(Buffer.concat([resmap, ...res_data]));
    let compressed = all
    if(cmdline.compress > 0) {
        compressed = await Lzma.compress(all, cmdline.compress);
        console.log(`+${(Date.now() - ts)} Testing...`);
        const tst = Date.now()
        const decompressed = await Lzma.decompress(compressed);
        console.log(`    decompressing took ${Date.now() - tst}ms`);
    }
    cmdline.output = cmdline.output || manifest.dist || 'gepack.res';
    const output = path.join(path.resolve(cmdline.dir), cmdline.output);
    fs.mkdirSync(path.dirname(output), { recursive: true });
    console.log(`+${(Date.now() - ts)} Writing to ${output}`);
    const fp = fs.openSync(output, 'w');
    if (cmdline.enc) {
        const enc = new TextEncoder();
        const key = enc.encode(cmdline.enc);
        for (let i = 0; i < compressed.length; i++)
            compressed[i] ^= key [i % key.length];
        fs.writeSync(fp, new Uint8Array([0xA + ((cmdline.compress > 0)?0x80:0x00)]));
    }
    else
        fs.writeSync(fp, new Uint8Array([0xF + ((cmdline.compress > 0)?0x80:0x00)]));
    fs.writeSync(fp, compressed);
    //fs.writeFileSync(output, compressed);
    fs.closeSync(fp);
    console.log(`+${(Date.now() - ts)} Done.`);
    console.log('Total time: ' + (Date.now() - ts) + 'ms');
    console.log('Data size: ' + compressed.length + ' bytes');
}catch(e){
    console.log(e)
}