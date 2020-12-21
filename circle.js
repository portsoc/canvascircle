"use strict";

const canvas = document.createElement("canvas");
const c = canvas.getContext('2d');

const TAU = 2*Math.PI;
const r=200; // radius
const d=2*r; // diameter
const blobsize = 10;
const blobOffset = blobsize/2;
const margin = 16*blobsize;

const tau = 2*Math.PI;
const step = 0.005;
const multiplier = d/tau;


const style = getComputedStyle(document.documentElement);
const cols = {};

setColorScheme();
window.matchMedia('(prefers-color-scheme: dark)').addListener(setColorScheme);

function setColorScheme() {
  cols.sin = style.getPropertyValue('--sin'),
  cols.cos = style.getPropertyValue('--cos'),
  cols.circ = style.getPropertyValue('--circ'),
  cols.bg = style.getPropertyValue('--bg'),
  cols.fg = style.getPropertyValue('--fg')
};

const show = {
  sin: true,
  cos: false,
  lines: false,
  edges: false,
  circle: false,
  auto: false,
  numbers: true
};

function onoff(e) {
  if (e.key === "c") show.cos = !show.cos;
  if (e.key === "s") show.sin = !show.sin;
  if (e.key === "l") show.lines = !show.lines;
  if (e.key === "p") show.circle = !show.circle;
  if (e.key === "e") show.edges = !show.edges;
  if (e.key === "n") show.numbers = !show.numbers;
  if (e.key === "ArrowRight") {
    stepOn(+10);
    show.auto = false;
  }
  if (e.key === "ArrowLeft") {
    stepOn(-10);
    show.auto = false;
  }
  if (e.key === "a") show.auto = !show.auto;
  if (e.key === " ") {
    show.auto = !show.auto;
    e.preventDefault();
  }
  drawInitial();
}

document.addEventListener('keydown', onoff);

canvas.width=2*r+margin;
canvas.height=2*r+margin;
c.translate(margin/2, margin/2);
c.lineWidth = 2;
c.font = '12px sans-serif';

function drawBlob(x,y, fill, stroke) {
  c.beginPath();
  c.arc(x, y, blobsize, 0, TAU);
  c.fillStyle = fill;
  c.strokeStyle = stroke;
  c.fill();
  c.stroke();
  c.closePath();

  if (show.numbers) {
    c.fillStyle = stroke;
    c.fillText("x" + x.toFixed(0) + " y" + y.toFixed(0), x+blobsize, y-blobsize);
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


let background = null;

function drawInitial() {
  
  c.clearRect(-margin, -margin,canvas.width + margin, canvas.height + margin);

  if (show.circle) {
    // draw circle using arc
    c.strokeStyle = cols.circ;
    c.lineWidth = 2;
    if (show.circle) {
      c.beginPath();
      c.arc(200, 200, r, 0, TAU);
      c.stroke();
    }    
  }

  if (show.sin) {
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

  if (show.cos) {
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

let i=TAU;
function drawNext() {
  if (show.auto) {
    stepOn(+1);
  }

  const x = r - r*Math.cos(i);
  const y = r + r*Math.sin(i);
  const axispos = d-(i*multiplier % d);

  // redraw the background covering the previous frame.
  c.putImageData( background, 0, 0 )

  if (show.circle && show.lines) {
    if (show.sin) drawConn( x, y, axispos, y, cols.sin, true );
    if (show.cos) drawConn( x, y, x, axispos, cols.cos, true );
  }


  if (show.sin) {
    if (show.edges) {
      drawConn( axispos, y, axispos, 0, cols.sin );
      drawBlob( axispos, 0, cols.bg, cols.sin  ); 
    }
    drawBlob( axispos, y, cols.bg, cols.sin  );
  }

  if (show.cos) {
    if (show.edges) {
      drawConn( 0, axispos, x, axispos, cols.cos );
      drawBlob( 0, axispos, cols.bg, cols.cos ); 
    }
    drawBlob( x, axispos, cols.bg, cols.cos ); 
  }

  if (show.circle) {
    drawBlob( x, y, cols.bg, cols.circ);
  }


  window.requestAnimationFrame(drawNext);
}

document.body.appendChild(canvas);

drawInitial();
drawNext();
stepOn(+1);