import { RenderingDevice, SliceManifest, Texture, SlicedTexture } from '../index.js'

export const Dragonbone = {

    loadSlice(device: RenderingDevice, text: string, texture: Texture): SlicedTexture | null {
        try{
            const json = JSON.parse(text)
            const manifest: SliceManifest = {
                name: json.name,
                width: json.width,
                height: json.height,
                slices: []
            }
            for (let slice of json.SubTexture) {
                manifest.slices.push({
                    name: slice.name,
                    x: slice.x,
                    y: slice.y,
                    width: slice.width,
                    height: slice.height,
                    frameX: slice.frameX || 0,
                    frameY: slice.frameY || 0,
                    frameWidth: slice.frameWidth || slice.width,
                    frameHeight: slice.frameHeight || slice.height
                })
            }
            return new SlicedTexture(device, texture, manifest)
        }catch(e){
            console.log(e)
        }
        return null
    }

}