'use strict';

// constants
const DEFAULT_STEP = 0.025;
const TAU = 2 * Math.PI;
const RADIUS = 50;
const SCALE = 8;

// computed constants
const BLOB_SIZE = RADIUS / 25;
const DIAMETER = 2 * RADIUS;
const MARGIN = SCALE * RADIUS;
const MULTIPLIER = DIAMETER / TAU;
const STYLE = getComputedStyle(document.documentElement);

// defined in init()
let background;
let canvas;
let cols;
let ctx;
let direction;
let el;
let current;
let stepSize;

function getStyleFromCSS() {
  const properties = 'sin cos sinalpha cosalpha circ bg fg'.split(' ');
  for (const prop of properties) {
    cols[prop] = STYLE.getPropertyValue('--' + prop);
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
    case 'r': el.reverse.click(); break;
  }
  drawInitial();
}

function drawBlob(x, y, fill, stroke, fillx, filly) {
  ctx.beginPath();
  ctx.arc(x, y, BLOB_SIZE, 0, TAU);
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  if (el.numbers.checked) {
    ctx.font = `${RADIUS / 20}pt sans-serif`;
    ctx.fillStyle = fillx || stroke;
    ctx.fillText('x' + x.toFixed(0), x + BLOB_SIZE, y - BLOB_SIZE * 3);
    ctx.fillStyle = filly || stroke;
    ctx.fillText('y' + y.toFixed(0), x + BLOB_SIZE, y - BLOB_SIZE);
  }
}

function drawConn(x, y, x1, y1, col, dashed = false) {
  ctx.beginPath();
  ctx.strokeStyle = col;
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  if (dashed) ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.closePath();
  ctx.setLineDash([]);
}


function drawInitial() {
  ctx.clearRect(-MARGIN, -MARGIN, canvas.width + MARGIN, canvas.height + MARGIN);
  ctx.lineWidth = RADIUS / 100;

  if (el.circle.checked) {
    // draw circle using arc
    ctx.beginPath();
    ctx.strokeStyle = cols.circ;
    ctx.arc(RADIUS, RADIUS, RADIUS, 0, TAU);
    ctx.stroke();
  }

  if (el.sin.checked) {
    // draw sine path
    ctx.beginPath();
    ctx.strokeStyle = cols.sin;
    ctx.moveTo(2 * RADIUS, RADIUS);
    for (let i = 0; i < TAU; i += stepSize / 10) {
      const y = RADIUS + RADIUS * Math.sin(i);
      const axispos = DIAMETER - i * MULTIPLIER;
      ctx.lineTo(axispos, y);
    }
    ctx.stroke();
  }

  if (el.cos.checked) {
    // draw cosine path
    ctx.beginPath();
    ctx.strokeStyle = cols.cos;
    ctx.moveTo(0, 0);
    for (let i = 0; i < TAU; i += stepSize / 10) {
      const x = RADIUS - RADIUS * Math.cos(i);
      const axispos = i * MULTIPLIER;
      ctx.lineTo(x, axispos);
    }
    ctx.stroke();
  }

  background = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // create a bitmap copy of the canvas
}


function stepOn(direction) {
  current += stepSize * direction;
  if (current <= 0) {
    if (el.reverse.checked) {
      return -direction;
    } else {
      current += TAU;
    }
  }
  if (current >= TAU) {
    if (el.reverse.checked) {
      return -direction;
    } else {
      current -= TAU;
    }
  }
  return direction;
}

function drawNext() {
  if (el.auto.checked) {
    direction = stepOn(direction);
  }

  // when reverse is unclicked, ongoing reverses should stop
  if (el.reverse.checked && stepSize < 0) stepSize = -stepSize;

  const x = RADIUS - RADIUS * Math.cos(current);
  const y = RADIUS - RADIUS * Math.sin(current);
  const axispos = current * MULTIPLIER;

  // redraw the background covering the previous frame.
  ctx.putImageData(background, 0, 0);

  // connectors between waves and circle
  if (el.circle.checked && el.lines.checked) {
    if (el.sin.checked) drawConn(x, y, axispos, y, cols.sin, true);
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
  // vars
  current = 0;
  stepSize = DEFAULT_STEP;
  direction = 1;
  el = {};
  cols = {};

  // set up el to point to all id'd elements
  const all = document.querySelectorAll('[id]');
  all.forEach(e => { el[e.id] = e; });

  getStyleFromCSS();

  // add listeners
  const inputs = document.querySelectorAll('input');
  inputs.forEach(i => i.addEventListener('change', drawInitial));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', getStyleFromCSS);
  document.addEventListener('keydown', onoff);
  el.down.addEventListener('click', () => nudge(-1));
  el.up.addEventListener('click', () => nudge(+1));

  // prep canvas
  canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  el.key.after(canvas);

  canvas.width = 2 * SCALE * RADIUS + MARGIN;
  canvas.height = 2 * SCALE * RADIUS + MARGIN;

  ctx = canvas.getContext('2d');
  ctx.translate(MARGIN / 2, MARGIN / 2);
  ctx.lineCap = 'round';
  ctx.font = '12px sans-serif';
  ctx.scale(SCALE, SCALE);

  drawInitial();
  drawNext();
  stepOn(+1);
}

window.addEventListener('load', init);
