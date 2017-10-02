import {App} from './app.js';

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
mountPoint.appendChild(canvas);
const app = new App({el: canvas});
app.start();
