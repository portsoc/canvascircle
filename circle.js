"use strict";

const canvas = document.createElement("canvas");
canvas.id='canvas';

const c = canvas.getContext('2d');

const TAU = 2*Math.PI;
const SCALE = 8;
const r=50; // radius
const d=2*r; // diameter
const blobsize = r/25;
const blobOffset = SCALE*blobsize/2;
const margin = SCALE*r;

const tau = 2*Math.PI;
const step = 0.01;
const multiplier = d/tau;

const style = getComputedStyle(document.documentElement);
const cols = {};
const el = {};

let background = null;
let i=TAU;


function setColorScheme() {
  cols.sin = style.getPropertyValue('--sin'),
  cols.cos = style.getPropertyValue('--cos'),
  cols.circ = style.getPropertyValue('--circ'),
  cols.bg = style.getPropertyValue('--bg'),
  cols.fg = style.getPropertyValue('--fg')
};

function isShown(what) {
  const e = document.getElementById(what);
  return e.checked;
}

function flipCheckbox(id) {
  const e = document.getElementById(id);
  e.click();
}

function nudge(dir) {
  stepOn(dir);
  const auto = document.getElementById('auto');
  if (auto.checked) auto.click();
}

function nudgeUp() {
  nudge(+1);
}

function nudgeDown() {
  nudge(-1);
}

function onoff(e) {
  if (e.key === "c") flipCheckbox('cos');
  if (e.key === "s") flipCheckbox('sin');
  if (e.key === "l") flipCheckbox('lines');
  if (e.key === "p") flipCheckbox('circle');
  if (e.key === "e") flipCheckbox('edges');
  if (e.key === "n") flipCheckbox('numbers');
  if (e.key === "ArrowRight") nudgeUp();
  if (e.key === "ArrowLeft") nudgeDown();
  if (e.key === "a") flipCheckbox('auto');
  if (e.key === " ") {
    flipCheckbox('auto');
    e.preventDefault();
  }
  drawInitial();
}

function drawBlob(x,y, fill, stroke, drawx=true, drawy=true) {
  c.beginPath();
  c.arc(x, y, blobsize, 0, TAU);
  c.fillStyle = fill;
  c.strokeStyle = stroke;
  c.fill();
  c.stroke();
  c.closePath();

  if (isShown('numbers')) {
    c.fillStyle = stroke;
    c.font = `${r/20}pt sans-serif`;
    const xText = drawx ? "x" + x.toFixed(0) : "";
    const yText = drawy ? "y" + y.toFixed(0) : "";
    c.fillText(`${xText} ${yText}`, x+blobsize, y-blobsize );
  }
}

function drawConn(x,y, x1,y1, col, dashed = false) {
  c.beginPath();
  c.strokeStyle = col;
  c.moveTo( x , y  );
  c.lineTo( x1, y1  );
  if (dashed) c.setLineDash([4,4]);
  c.stroke();
  c.closePath();
  c.setLineDash([]);
}


function drawInitial() {
  c.clearRect(-margin, -margin,canvas.width + margin, canvas.height + margin);
  c.lineWidth = r/100;

  if (isShown('circle')) {
    // draw circle using arc
    c.beginPath();
    c.strokeStyle = cols.circ;
    c.arc(r, r, r, 0, TAU);
    c.stroke();
  }

  if (isShown('sin')) {
    // draw sine path
    c.beginPath();
    c.strokeStyle = cols.sin;
    c.moveTo(2*r,r);
    for (let i=0; i<TAU; i += step) {
      const y = r + r*Math.sin(i);
      const axispos = d - i*multiplier % d;
      c.lineTo(axispos,y);
    }
    c.stroke();
  }

  if (isShown('cos')) {
    // draw cosine path
    c.beginPath();
    c.strokeStyle = cols.cos;
    c.moveTo(0,0);
    for (let i=0; i<TAU; i += step) {
      const x =  r - r*Math.cos(i);
      const axispos = i*multiplier % d;
      c.lineTo(x,axispos);
    }
    c.stroke();
  }

  background = c.getImageData( 0,0, canvas.width, canvas.height);

  // create a bitmap copy of the canvas
}


function stepOn(direction) {
    i-=(step*direction);
    if (i<0) i+=TAU;
}

function drawNext() {
  if (isShown('auto')) {
    stepOn(+1);
  }

  const x = r - r*Math.cos(i);
  const y = r + r*Math.sin(i);
  const axispos = d-(i*multiplier % d);

  // redraw the background covering the previous frame.
  c.putImageData( background, 0, 0 )

  if (isShown('circle') && isShown('lines')) {
    if (isShown('sin')) drawConn( x, y, axispos, y, cols.sin, true );
    if (isShown('cos')) drawConn( x, y, x, axispos, cols.cos, true );
  }


  if (isShown('sin')) {
    if (isShown('edges')) {
      drawConn( axispos, y, axispos, 0, cols.sin );
      drawBlob( axispos, 0, cols.bg, cols.sin );
    }
    drawBlob( axispos, y, cols.bg, cols.sin, false, true  );
  }

  if (isShown('cos')) {
    if (isShown('edges')) {
      drawConn( 0, axispos, x, axispos, cols.cos );
      drawBlob( 0, axispos, cols.bg, cols.cos );
    }
    drawBlob( x, axispos, cols.bg, cols.cos, true, false );
  }

  if (isShown('circle')) {
    drawBlob( x, y, cols.bg, cols.circ);
  }


  window.requestAnimationFrame(drawNext);
}

function init() {

  el.current = document.querySelector('#current');

  document.querySelector('#key').after(canvas);

  document.addEventListener('keydown', onoff);

  document.querySelector('#down').addEventListener('click', nudgeDown);
  document.querySelector('#up').addEventListener('click', nudgeUp);

  const inputs = document.querySelectorAll('input');
  inputs.forEach( i => i.addEventListener('change', drawInitial) );

  canvas.width=2*SCALE*r+margin;
  canvas.height=2*SCALE*r+margin;
  c.translate(margin/2, margin/2);
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