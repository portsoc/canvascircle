'use strict';

const canvas = document.createElement('canvas');
canvas.id = 'canvas';

const c = canvas.getContext('2d');

const TAU = 2 * Math.PI;
const SCALE = 8;
const r = 50; // radius
const d = 2 * r; // diameter
const blobsize = r / 25;
const margin = SCALE * r;

const tau = 2 * Math.PI;
const step = 0.01;
const multiplier = d / tau;

const style = getComputedStyle(document.documentElement);
console.log(style);
const cols = {};
const el = {};

let background = null;
let i = TAU;


function setColorScheme() {
  const properties = 'sin cos sinalpha cosalpha circ bg fg'.split(' ');
  for (const prop of properties) {
    cols[prop] = style.getPropertyValue('--' + prop);
  }
}

function nudge(dir) {
  stepOn(dir);
  if (el.auto.checked) el.auto.click();
}

function onoff(e) {
  switch (e.key) {
    case 'ArrowRight': nudge(+1); break;
    case 'ArrowLeft': nudge(-1); break;
    case 'c': el.cos.click(); break;
    case 's': el.sin.click(); break;
    case 'l': el.lines.click(); break;
    case 'p': el.circle.click(); break;
    case 'e': el.edges.click(); break;
    case 'n': el.numbers.click(); break;
    case 'a': el.auto.click(); break;
  }
  drawInitial();
}

function drawBlob(x, y, fill, stroke, fillx, filly) {
  c.beginPath();
  c.arc(x, y, blobsize, 0, TAU);
  c.fillStyle = fill;
  c.strokeStyle = stroke;
  c.fill();
  c.stroke();
  c.closePath();

  if (el.numbers.checked) {
    c.font = `${r / 20}pt sans-serif`;
    c.fillStyle = fillx ? fillx : stroke;
    c.fillText('x' + x.toFixed(0), x + blobsize, y - blobsize * 3);
    c.fillStyle = filly ? filly : stroke;
    c.fillText('y' + y.toFixed(0), x + blobsize, y - blobsize);
  }
}

function drawConn(x, y, x1, y1, col, dashed = false) {
  c.beginPath();
  c.strokeStyle = col;
  c.moveTo(x, y);
  c.lineTo(x1, y1);
  if (dashed) c.setLineDash([4, 4]);
  c.stroke();
  c.closePath();
  c.setLineDash([]);
}


function drawInitial() {
  c.clearRect(-margin, -margin, canvas.width + margin, canvas.height + margin);
  c.lineWidth = r / 100;

  if (el.circle.checked) {
    // draw circle using arc
    c.beginPath();
    c.strokeStyle = cols.circ;
    c.arc(r, r, r, 0, TAU);
    c.stroke();
  }

  if (el.sin.checked) {
    // draw sine path
    c.beginPath();
    c.strokeStyle = cols.sin;
    c.moveTo(2 * r, r);
    for (let i = 0; i < TAU; i += step) {
      const y = r + r * Math.sin(i);
      const axispos = d - i * multiplier % d;
      c.lineTo(axispos, y);
    }
    c.stroke();
  }

  if (el.cos.checked) {
    // draw cosine path
    c.beginPath();
    c.strokeStyle = cols.cos;
    c.moveTo(0, 0);
    for (let i = 0; i < TAU; i += step) {
      const x = r - r * Math.cos(i);
      const axispos = i * multiplier % d;
      c.lineTo(x, axispos);
    }
    c.stroke();
  }

  background = c.getImageData(0, 0, canvas.width, canvas.height);

  // create a bitmap copy of the canvas
}


function stepOn(direction) {
  i -= (step * direction);
  if (i < 0) i += TAU;
}

function drawNext() {
  if (el.auto.checked) {
    stepOn(+1);
  }

  const x = r - r * Math.cos(i);
  const y = r + r * Math.sin(i);
  const axispos = d - (i * multiplier % d);

  // redraw the background covering the previous frame.
  c.putImageData(background, 0, 0);

  // connectors between waves and circle
  if (el.circle.checked && el.lines.checked) {
    if (el.sin.checked) drawConn(x, y, axispos, y, cols.sin, true,);
    if (el.cos.checked) drawConn(x, y, x, axispos, cols.cos, true);
  }


  if (el.sin.checked) {
    if (el.edges.checked) {
      // line from axis to sine wave
      drawConn(axispos, y, axispos, 0, cols.sin);
      drawBlob(axispos, 0, cols.bg, cols.sin, cols.sinalpha, cols.sinalpha);
    }
    drawBlob(axispos, y, cols.bg, cols.sin, cols.sinalpha, cols.sin);
  }

  if (el.cos.checked) {
    if (el.edges.checked) {
      // line from axis to cosine wave
      drawConn(0, axispos, x, axispos, cols.cos);
      drawBlob(0, axispos, cols.bg, cols.cos, cols.cosalpha, cols.cosalpha);
    }
    drawBlob(x, axispos, cols.bg, cols.cos, cols.cos, cols.cosalpha);
  }

  if (el.circle.checked) {
    drawBlob(x, y, cols.bg, cols.circ, cols.cos, cols.sin);
  }

  window.requestAnimationFrame(drawNext);
}

function init() {
  const all = document.querySelectorAll('[id]');
  all.forEach(e => { el[e.id] = e; });

  el.key.after(canvas);

  document.addEventListener('keydown', onoff);

  el.down.addEventListener('click', () => nudge(-1));
  el.up.addEventListener('click', () => nudge(+1));

  const inputs = document.querySelectorAll('input');
  inputs.forEach(i => i.addEventListener('change', drawInitial));

  canvas.width = 2 * SCALE * r + margin;
  canvas.height = 2 * SCALE * r + margin;
  c.translate(margin / 2, margin / 2);
  c.lineWidth = 2;
  c.font = '12px sans-serif';
  c.scale(SCALE, SCALE);

  setColorScheme();
  window.matchMedia('(prefers-color-scheme: dark)').addListener(setColorScheme);

  drawInitial();
  drawNext();
  stepOn(+1);
}

window.addEventListener('load', init);
