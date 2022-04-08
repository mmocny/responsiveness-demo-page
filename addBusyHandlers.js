/*
 * Let's add some Jank to event handlers, shall we?
 *
 * Multiple things we can do inside handlers, after registering for a bunch of event types:
 * - Do nothing at all!  This tests browser IPC and things like passive/non-passive handlers, default actions.
 *     i.e. doNothing();
 * 
 * - Add sync processing time (do-nothing-loop).  Multiple events will add up to longer tasks.
 *     i.e. block(100);
 * 
 * - Queue a new rAF callback that adds processing time.  Similar to above, but is less likely to starve rendering completely.
 *     i.e. requestAnimationFrame(() => block(100));
 * 
 * - Queue a singleton rAF callback that adds some fixed processing time.  Only one delay per frame, since multiple events do not "add up"... still, sometimes delays are larger than expect if any other long tasks sneak in.
 *     i.e. if (!raf) raf = requestAnimationFrame(() => block(100));
 * 
 * - Queue a singleton rAF callback that adds variable processing time based on a desired timeout relative to some timeStamp.  Most likely to have expected amount of target delay, whatever the cause.
 *     i.e. if (!raf) raf = requestAnimationFrame(() => blockUntil(event.timeStamp + 100));
 * 
 * (... And probably many other combinations of task scheduling and jank approaches.)
 * */

// Removing some handlers, such that we have one down/up per interaction type, just because they render in separate frames
const EVENTS = [
  "keydown",
  // "keyup",
  "keypress",
  // "pointerdown",
  "pointerup",
  "pointercancel",
  // "touchstart",
  // "touchend",
  // "touchcancel",
  // "mousedown",
  // "mouseup",
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

function block(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end);
}
function blockingRaf(ms) {
  requestAnimationFrame((time) => {
    block(ms);
  });
}

let raf;
function onceBlockingRaf(ms) {
  if (raf) return;
  raf = requestAnimationFrame((time) => {
    raf = undefined;
    block(ms);
  });
}

function keepBusy(event) {
  // Option 1: Do nothing

  // Option 2:
  // block(delayAmount);

  // Option 3:
  // onceBlockingRaf(delayAmount);

  // blockingRaf(delayAmount);
  onceBlockingRaf(delayAmount);
}

export function addBusyHandlers() {
  for (let event of EVENTS) {
    document.addEventListener(event, keepBusy);
  }
}
export function removeBusyHandlers() {
  for (let event of EVENTS) {
    document.removeEventListener(event, keepBusy);
  }
}