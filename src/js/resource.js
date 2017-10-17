class Loader {
    constructor({basePath, paths, raiseOnFailure}) {
        this.basePath = basePath || '';
        this.raiseOnFailure = raiseOnFailure;
        this.cache = new Map();
        this.errors = new Map();
        this.loading = null;
        this.load(paths || []);
    }

    load(paths) {
        this.loading = new Promise(async(resolve, reject) => {
            for (let path of paths) {
                const key = this.basePath + path;
                const req = await fetch(key);
                if (req.ok) {
                    this.cache.set(key, await req.text());
                } else if (this.raiseOnFailure) {
                    throw `failed to fetch resource '${key}'; got status ${req.status} '${req.statusText}'`;
                } else {
                    this.errors.set(key, req.statusText);
                }
            }

            resolve(this);
        });

        return this.loading;
    }

    get(path) {
        return this.cache.get(path);
    }
}

export {Loader};
