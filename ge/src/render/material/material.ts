import { RenderingProgram } from "../program.js"

export interface IMaterialData{
    getProgram(): RenderingProgram
    activate(): void
}

export interface IMaterial{
    
}