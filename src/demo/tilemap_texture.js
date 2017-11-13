import {TilemapTextureBuilder} from 'graphics.js';
import {loadImage} from 'util.js';
import '../css/app.css'

import App from 'app.js';


const mountPoint = document.getElementById('content');
mountPoint.style.display = 'none';
const canvas = document.createElement('canvas');
canvas.classList.add('game');
mountPoint.appendChild(canvas);


const app = new App({
    el: canvas
});


const tilemapTex = new TilemapTextureBuilder({
    tileWidth: 16,
    tileHeight: 16,
    width: 16,
    height: 16,
    layers: 4
});


loadImage('/img/mario.png').then((img) => {
    tilemapTex.addTiles(img);

    const layers = tilemapTex.readback();

    const canvas = document.createElement('canvas');
    document.body.prepend(canvas);
    canvas.width = tilemapTex.width * tilemapTex.tileWidth;
    canvas.height = tilemapTex.height * tilemapTex.tileHeight * layers.length;

    const ctx = canvas.getContext('2d');

    for (let i = 0; i < layers.length; i++) {
        ctx.putImageData(layers[i], 0, i * tilemapTex.layerHeight);
    }
});
