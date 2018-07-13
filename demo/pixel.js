import {initCanvas} from '../js/app.js';
import '../css/app.css';
import '../css/pixel.css';

const canvas = initCanvas('content', 'game');
const context = canvas.getContext('2d');

const size = 8;
const scale = 64;

canvas.width = size;
canvas.height = size;
canvas.style.width = `${scale * size}px`;
canvas.style.height = `${scale * size}px`;

let color = [];

const click = (evt) => {

};

canvas.addEventListener('mousedown', click);

console.log(canvas.toDataURL());

