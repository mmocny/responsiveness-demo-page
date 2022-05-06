import { getINP, estimateInteractionCount } from './getINP.js';
import { addBusyHandlers, removeBusyHandlers } from './addBusyHandlers.js';
import * as EventsByType from './events.json';

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
function replaceConsole() {
  var log = console.log.bind(console);
  var group = console.group.bind(console);
  console.log = function (...args) {
	log(...args);
	let el = document.getElementById('log');
	if (enableLog) {
	  el.innerHTML += `<pre>${args.join(' ')}<pre>`;
	  el.scrollTop = el.scrollHeight;
	}
  }
  console.group = function (...args) {
	group(...args);
	let el = document.getElementById('log');
	// el.innerHTML += `<hr/>`;
  }
}

function reportEvents() {
  const observer = new PerformanceObserver(list => {
	const entries = list.getEntries().filter(entry => EVENTS.includes(entry.name));
	if (entries.length == 0) return;

	console.group();
	for (let entry of entries) {
	  const renderTime = Math.round((entry.startTime + entry.duration) / 8) * 8;
	  console.log(`renderTime:${renderTime} ${entry.name} id:${entry.interactionId}`);
	}
	console.groupEnd();
  });

  observer.observe({
	type: "event",
	durationThreshold: 0, // 16 minumum by spec
	buffered: true
  });
}

replaceConsole();
reportEvents();

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
  // console.log(`Starting to sync block for ${ms}ms`);
  const end = performance.now() + ms;
  while (performance.now() < end);
}

function blockingRaf(ms) {
  requestAnimationFrame((time) => {
	// console.log('Starting rAF handler');
	block(ms);
  });
}

function keepBusy(event) {
  block(HANDLER_BLOCK_TIME);
  blockingRaf(RAF_BLOCK_TIME);
  document.body.style['background-color'] = randomColor();
}

// function addPreventDefault(handler) {
//   return (...args) => {
//     handler(...args);
//     event.preventDefault();
//   };
// }

const handler = (event) => {
  console.log(`timeStamp:${event.timeStamp.toFixed(2)} ${event.type}`);
  keepBusy();
}

function addHandlers() {
  for (let event of EVENTS) {
	document.addEventListener(event, handler);
  }
}
function removeHandlers() {
  for (let event of EVENTS) {
	document.removeEventListener(event, handler);
  }
}

const checky = document.getElementById('checky');
checky.addEventListener('change', (event) => {
  if (event.target.checked) {
	addHandlers();
  } else {
	removeHandlers();
  }
});
checky.click();

const loggy = document.getElementById('loggy');
loggy.addEventListener('change', (event) => {
  enableLog = event.target.checked;
  event.stopPropagation();
  event.preventDefault();
});
loggy.click();