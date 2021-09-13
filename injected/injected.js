const canvas = document.createElement("canvas");

const roundCursorURL = chrome.runtime.getURL("images/round-cursor.svg");

var isActive = false;
var curColor = "#000";
var curWidth = 1;
const rubberWidth = 50;
var rubberTool = false;

const disableExtension = () => {
  isActive = false;
  canvas.style.zIndex = "-999";
  canvas.style.display = "none";
};

const enableExtension = () => {
  isActive = true;
  canvas.style.zIndex = "999";
  canvas.style.display = "initial";
};

// We want the extension to work only if it's active

const canvasStyles =  {
  "position": "absolute",
  "top": "0",
  "left": "0",
  "z-index": "1",
  "box-sizing": "border-box",
};

const setCanvasSize = canvas => {
  // Set the scale on the canvas so that 1unit on canvas is 1px on the screen.
  canvas.width = document.documentElement.scrollWidth;
  canvas.height = document.documentElement.scrollHeight;
  canvas.style.width = document.documentElement.scrollWidth;
  canvas.style.height = document.documentElement.scrollHeight;
};

Object.assign(canvas.style, canvasStyles);
document.body.appendChild(canvas);

setCanvasSize(canvas);

const ctx = canvas.getContext('2d');

const updatePencilColor = color => {
  ctx.strokeStyle = color;
  curColor = color;
};

const updateStrokeWidth = width => {
  ctx.lineWidth = parseInt(width);
  curWidth = parseInt(width);
};

const onResize = () => {
  let tempCanvas = document.createElement("canvas");
  setCanvasSize(tempCanvas);
  let tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0);
  setCanvasSize(canvas);
  ctx.drawImage(tempCanvas, 0, 0);
  updatePencilColor(curColor);
  updateStrokeWidth(curWidth);
};

const setToolAsPencil = () => {
  rubberTool = false;
  ctx.strokeStyle = curColor;
  ctx.lineWidth = curWidth;
  canvas.style.cursor = "auto";
};

const setToolAsRubber = () => {
  rubberTool = true;
  canvas.style.cursor = `url(${roundCursorURL}) 50 50, auto`;
};

const clearBoard = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updatePencilColor(curColor);
  updateStrokeWidth(curWidth);
};

const listenerFunction = event => {
  let clickX = window.scrollX + event.clientX;
  let clickY = window.scrollY + event.clientY;
  if(isActive) {
    if(rubberTool) {
      if(event.which) {
        ctx.clearRect(clickX - rubberWidth/2, clickY - rubberWidth/2, rubberWidth, rubberWidth);
      }
    } else {
      if(event.which) {
        if(currentPath) { // Continue the stroke
          ctx.lineTo(clickX, clickY);
          ctx.stroke();
        } else { // Create a new stroke
          ctx.beginPath();
          ctx.moveTo(clickX, clickY);
          currentPath = true;
        }
      } else if(currentPath) { // End the stroke
        ctx.closePath();
        currentPath = false;
      }
    }
  }
};

const backgroundColor = "#FFFFFF";
var currentPath = false;
var currentTool = "pencil";

window.addEventListener("resize", onResize);

chrome.storage.sync.get("state", value => {value.state ? enableExtension() : disableExtension()});

canvas.addEventListener('mousemove', listenerFunction);

const messageReceived = (msg, sender, sendResponse) => {
  switch(msg.command) {
    case 'change-color':
      updatePencilColor(msg.color);
      break;
    case 'change-size':
      updateStrokeWidth(msg.width);
      break;
    case 'clear-screen':
      clearBoard();
      break;
    case 'tool-pencil':
      setToolAsPencil();
      break;
    case 'tool-rubber':
      setToolAsRubber();
      break;
    case 'set-state':
      msg.state ? enableExtension() : disableExtension();
      break;
    default:
      break;
  }
};

chrome.storage.sync.get(["default-color", "default-size"], res => {
  updatePencilColor(res["default-color"]);
  updateStrokeWidth(res["default-size"]);
});

chrome.runtime.onMessage.addListener(messageReceived);

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.state?.newValue !== undefined) {
      changes.state?.newValue ? enableExtension() : disableExtension();
    }
});
