"use strict";

const canvas = document.createElement("canvas");
const c = canvas.getContext('2d');

const r=200; // radius
const d=2*r; // diameter
const blobsize = 10;
canvas.width=2*r+blobsize;
canvas.height=2*r+blobsize;

const tau = 2*Math.PI;
const step = 0.01;
const radius = 150;
const multiplier = d/tau;

function drawBlob(x,y, col) {
  c.fillStyle = col;
  c.fillRect( x, y, blobsize,blobsize );
}

function drawConn(x,y, x1,y1, col) {
  c.strokeStyle = col;
  c.strokeWidth = "2";
  c.moveTo( x, y );
  c.lineTo( x1, y1 );
  c.stroke();
}


function fadeContent() {
  c.fillStyle = `rgba(255,255,255,0.01)`;
  c.fillRect( 0,0, canvas.width, canvas.height);
}

let i=0;

function drawNext() {
  i+=step;
  fadeContent();
  let x = r + r*Math.sin(i);
  let y = r + r*Math.cos(i);
  let axispos = i*multiplier % d;
  
  drawBlob( x, y, `purple`);

  drawBlob( axispos, y, 'blue'  ); 
  drawBlob( x, axispos, 'red'  ); 

  window.requestAnimationFrame(drawNext);
}

document.body.appendChild(canvas);
drawNext();