import {lib, registerLib} from './lib.js'

describe('', function() {
    const canary = {};

    registerLib(canary);

    it('should be the same as the registered object', function() {
        canary.should.equal(lib);
    });

    it('should be rebindable', function() {
        const finch = {};
        registerLib(finch);
        finch.should.equal(lib);
        canary.should.not.equal(lib);
    });

    it('is different', function() {
        let a = {};
        let b = a;
        a = {};
        a.should.not.equal(b);
    })
});
