import twgl from 'twgl.js';
import {gl} from 'gl.js';

function getGl() {
    return gl;
}

getGl();

function createTextures(opts) {
    return new Promise(function(resolve, reject) {
        twgl.createTextures(gl, opts, function(errors, textures, images) {
            resolve({errors, textures, images});
        });
    });
}

class Loader {
    constructor(opts) {
        this.cache = new Map();
        this.textureCache = new Map();
        this.programCache = new Map();
        this.errors = {
            programs: new Map(),
            textures: new Map(),
            paths: new Map()
        }
        this.loading = null;
        this.load(opts);
    }

    load({basePath, raiseOnFailure, paths, textures, programs} = {basePath: '', raiseOnFailure: true}) {
        const loadPromise = new Promise(async (resolve, reject) => {
            if (paths) {
                await this.loadPaths(paths, basePath, raiseOnFailure);
            }

            if (textures) {
                let {errors, textures: tex, images} = await createTextures(textures);
                if (errors) {
                    console.log(errors);
                }
                Object.keys(tex).forEach((key) => {
                    this.textureCache.set(key, tex[key]);
                });
            }

            if (programs) {
                for (let programName of programs) {
                    if (this.programCache.has(programName)) {
                        console.log(`Warning: attempted to load already loaded program '${programName}'`);
                        continue;
                    }
                    const vsName = `${basePath}${programName}.vert`;
                    const fsName = `${basePath}${programName}.frag`;
                    await this.loadPaths([vsName, fsName], '', raiseOnFailure);
                    this.programCache.set(programName, twgl.createProgramInfo(gl, [this.get(vsName), this.get(fsName)]));
                }
            }

            resolve(this);
        });

        this.loading = this.loading ? this.loading.then(res => loadPromise) : loadPromise;

        return this.loading;
    }

    get(path) {
        return this.cache.get(path);
    }

    getTexture(name) {
        return this.textureCache.get(name);
    }

    getProgram(name) {
        return this.programCache.get(name)
    }

    async loadPaths(paths, basePath, raiseOnFailure = true) {
        for (let path of paths) {
            if (this.cache.has(basePath + path)) {
                console.log(`Warning: attempted to load already loaded path '${basePath + path}'`);
                continue;
            }
            const contents = await this.fetch(basePath + path, raiseOnFailure);
            if (contents) {
                this.cache.set(basePath + path, contents);
            }
        }
    }

    async fetch(path, raiseOnFailure = true) {
        const req = await fetch(path);

        if (req.ok) {
            return await req.text();
        } else if (raiseOnFailure) {
            throw `failed to fetch resource '${path}'; got status ${req.status} '${req.statusText}'`;
        } else {
            this.errors.paths.set(path, req.statusText);

            return false;
        }
    }
}

export {Loader};
