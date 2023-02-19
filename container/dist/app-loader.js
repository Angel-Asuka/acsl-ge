export class App {
    constructor() {
    }
    static async load(fn) {
        const module = await import(fn);
        console.log(module);
    }
}
