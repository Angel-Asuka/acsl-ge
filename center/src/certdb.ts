import fs from 'node:fs'
import path from 'node:path'
import {Crypto} from '@acsl/fw'

declare type Cert = {
    id:string,
    cert:string,
    cfg:any
}

declare type SignData = {
    nonce:string,
    ts:number,
    sign:string
}

export default class CertDB {
    private path:string
    private certs:{[key:string]:Cert}
    private mykey:string
    constructor(key:string, certs:string){
        this.path = certs
        this.certs = {}
        if(this.path.length == 0) this.path = './'
        if(this.path[this.path.length-1]!='/') this.path += '/'
        try{
            this.mykey = fs.readFileSync(key).toString()
        }catch(e){
            this.mykey = ''
            console.log(`Can not load private key from ${key}`)

        }
    }

    fetch(id:string){
        if(id in this.certs)
            return this.certs[id]
        try{
            const crt:Cert = {
                id: id,
                cert: fs.readFileSync(`${this.path}${id}.pem`).toString(),
                cfg: JSON.parse(fs.readFileSync(`${this.path}${id}.json`).toString())
            }
            this.certs[id] = crt
            return crt
        }catch(e){}
    }

    verify(id:string, data:string, sign:SignData){
        const crt = this.fetch(id)
        if(!crt) return null
        if(Crypto.VerifySignature(data, crt.cert, sign, {method:'rsa-sha256'}))
            return crt.cfg
        return null        
    }

    sign(data:string){
        return Crypto.MakeSignature(data, this.mykey, {method:'rsa-sha256'})
    }
}