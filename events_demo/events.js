import { getINP, estimateInteractionCount } from '../snippets/getINP.js';
import { addResponsivenessJank } from '../snippets/addResponsivenessJank.js';
// import * as EventsByType from './EventTypes.json';

// TODO: use EventsByType to build this list + ignore list, instead
const EVENTS = [
  "keydown",
  "keyup",
  "keypress",
  "pointerdown",
  "pointerup",
  "pointercancel",
  // "touchstart",
  // "touchend",
  // "touchcancel",
  "mousedown",
  "mouseup",
  // "gotpointercapture",
  // "lostpointercapture",
  "click",
  "dblclick",
  "auxclick",
  "contextmenu",
  // "pointerleave",
  // "pointerout",
  // "pointerover",
  // "pointerenter",
  // "mouseout",
  // "mouseover",
  // "mouseleave",
  // "mouseenter",
  // "lostpointercapture",
  "dragstart",
  "dragend",
  // "dragenter",
  // "dragleave",
  // "dragover",
  "drop",
  // "beforeinput",
  // "input",
  "compositionstart",
  "compositionupdate",
  "compositionend",
];

let enableLog = true;
function log(...args) {
  if (!enableLog) return;
  console.log(...args);
  let el = document.getElementById('log');
  el.innerHTML += `<pre>${args.join(' ')}<pre>`;
  el.scrollTop = el.scrollHeight;
}
function group(...args) {
  if (!enableLog) return;
  console.group(...args);
  let el = document.getElementById('log');
  // el.innerHTML += `<hr/>`;
}
function groupEnd(...args) {
  if (!enableLog) return;
  console.groupEnd(...args);
}

function logEvents() {
  const observer = new PerformanceObserver(list => {
    const entries = list.getEntries().filter(entry => EVENTS.includes(entry.name));
    if (entries.length == 0) return;

    group();
    for (let entry of entries) {
      const renderTime = Math.round((entry.startTime + entry.duration) / 8) * 8;
      log(`renderTime:${renderTime} ${entry.name} id:${entry.interactionId}`);
    }
    groupEnd();
  });

  observer.observe({
    type: "event",
    durationThreshold: 0, // 16 minumum by spec
    buffered: true
  });
}

let currentINP;
getINP((metric) => {
  currentINP = metric;
}, true);

setInterval(() => {
  const counts = {
	inp: currentINP?.value,
	count: currentINP?.entries.length,
	...estimateInteractionCount(),
  };
  document.getElementById('counts').innerHTML = `<div><pre>${JSON.stringify(counts,null,2)}<pre></div>`;
}, 100);

const HANDLER_BLOCK_TIME = 20; // ms
const RAF_BLOCK_TIME = 20; // ms

function randomColor() {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

function block(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end);
}

const handler = (event) => {
  log(`timeStamp:${event.timeStamp.toFixed(2)} ${event.type}`);

  document.body.style['background-color'] = randomColor();

  const shouldBlock = document.getElementById('checky').checked;
  if (shouldBlock) {
    block(HANDLER_BLOCK_TIME);
    requestAnimationFrame((time) => {
      block(RAF_BLOCK_TIME);
    });
  }
}

function addHandlers() {
  for (let event of EVENTS) {
    document.addEventListener(event, handler);
  }

  const loggy = document.getElementById('loggy');
  loggy.addEventListener('change', (event) => {
    enableLog = event.target.checked;
  });
  loggy.click();
}



addHandlers();
logEvents();
addResponsivenessJank();