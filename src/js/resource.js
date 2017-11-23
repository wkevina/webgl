import {_} from 'underscore'
import * as twgl from 'twgl-js';
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

    load(opts) {
        let {basePath,
            raiseOnFailure,
            paths,
            textures,
            programs} = ({basePath: '', raiseOnFailure: true, ...opts});
        // trim trailing slashes
        basePath = basePath.replace(/\/+$/, '');

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
                for (let progOpts of programs) {
                    let name = progOpts;
                    let opts;

                    if (_.isObject(progOpts)) {
                        name = progOpts.name;
                        opts = progOpts.opts;
                    }

                    if (this.programCache.has(name)) {
                        console.log(`Warning: attempted to load already loaded program '${name}'`);
                        continue;
                    }

                    const fp = _.compact([basePath, name.split('.').join('/')]).join('/');

                    const vsName = `${fp}.vert`;
                    const fsName = `${fp}.frag`;
                    await this.loadPaths([vsName, fsName], '', raiseOnFailure);
                    this.programCache.set(
                        name,
                        twgl.createProgramInfo(gl, [this.get(vsName), this.get(fsName)], opts)
                    );
                }
            }

            resolve(this);
        });

        this.loading = this.loading ? this.loading.then(res => loadPromise) : loadPromise;

        return this.loading;
    }

    get(path) {
        const ret = this.cache.get(path);
        if (ret === undefined) {
            raise `No value for key ${path}`;
        }
        return ret;
    }

    getTexture(name) {
        const ret = this.textureCache.get(name);
        if (ret === undefined) {
            raise `No texture value for key ${path}`;
        }
        return ret;
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
