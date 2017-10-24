import twgl from 'twgl.js';
import {gl} from 'gl.js';

function getGl() {
    return gl;
}

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
        this.errors = new Map();
        this.loading = null;
        this.load(opts);
    }

    load({basePath, paths, raiseOnFailure, textures} = {basePath: '', paths: []}) {
        const loadPromise = new Promise(async (resolve, reject) => {
            if (paths) {
                for (let path of paths) {
                    const key = basePath + path;
                    const req = await fetch(key);
                    if (req.ok) {
                        this.cache.set(key, await req.text());
                    } else if (raiseOnFailure) {
                        throw `failed to fetch resource '${key}'; got status ${req.status} '${req.statusText}'`;
                    } else {
                        this.errors.set(key, req.statusText);
                    }
                }
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
}

export {Loader};
