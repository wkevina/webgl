import App from './app.js';
import '../css/app.css'

const mountPoint = document.getElementById('content');
const canvas = document.createElement('canvas');
mountPoint.appendChild(canvas);
const app = new App({el: canvas});
app.start();
