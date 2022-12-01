const version = '1.0'

export function printUsage(){
    console.log(`Usage: acsl-ge-packer [options]`)

    console.log(`Options:`)
    console.log(`  -h, --help               Print this help message`)
    console.log(`  -v, --version            Print version`)
    console.log(`  -c, --compress           Compression level (0-9) 0 Default`)
    console.log(`  -i, --input {file}       Input file`)
    console.log(`  -d, --dir {path}         Working directory`)
    console.log(`  -o, --output {file}      Output file`)
    console.log(`  -n, --name {name}        Override the name field in the input file`)
    console.log(`  -e, --enc {key}          Set encryption key`)
    console.log(`  --db-slice {file}        Convert DragonBone's slice file`)
}

export function printVersion(){
    console.log(`acsl-ge-packer v${version}`)
}