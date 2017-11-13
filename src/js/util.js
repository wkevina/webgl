function arraySetter(buffer) {
    let count = 0;
    return function(newElements) {
        buffer.set(newElements, count);
        count += newElements.length;
    }
}

function hsl2rgb (h, s, l) {

    var r, g, b, m, c, x

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }

    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return [r, g, b];
}

function attachFramebuffer(gl, width, height) {
    const framebuffer = gl.createFramebuffer();
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, width, height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return {
        width,
        height,
        attach() {
            gl.viewport(0, 0, width, height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        },
        detach() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        },
        texture,
        framebuffer
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        function removeListeners() {
            img.removeEventListener('load', null);
            img.removeEventListener('error', null);
        }

        img.addEventListener('load', () => {
            removeListeners();
            resolve(img);
        });

        img.addEventListener('error', (error) => {
            removeListeners();
            reject(error);
        });

        img.src = src;
    });
}

export {arraySetter, hsl2rgb, attachFramebuffer, loadImage};
