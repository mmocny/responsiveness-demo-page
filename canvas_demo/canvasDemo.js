import { FpsTracker } from './FpsTracker.js';
import { CanvasFps } from './CanvasFps.js';
import { ThreadLocalRAFIterator, SendPostMessageRAF } from './AnimationFrameIterator.js';


// Set up OffscreenCanvas WebWorker
const canvas_wrkr_raf_main = document.querySelector('#canvas_wrkr_raf_main').transferControlToOffscreen();
const canvas_wrkr_raf_wrkr = document.querySelector('#canvas_wrkr_raf_wrkr').transferControlToOffscreen();
const worker = new Worker('./CanvasWorker.js', { type: 'module' });

worker.postMessage({
  msg: 'start',
  canvas_wrkr_raf_main,
  canvas_wrkr_raf_wrkr
}, [canvas_wrkr_raf_main, canvas_wrkr_raf_wrkr]);


// Start tracking frames on main, reporting frame times to worker
(async () => {
  const fpsTracker = new FpsTracker(5000);
  const canvas_main_raf_main = document.querySelector('#canvas_main_raf_main');
  const c = new CanvasFps(canvas_main_raf_main.getContext('2d'), fpsTracker);
  c.startDrawing();

  for await (let frameTime of ThreadLocalRAFIterator()) {
    let fps = fpsTracker.reportNewFrame(frameTime);
    SendPostMessageRAF(worker, frameTime);
  }
})();

// Start adding Long Tasks on main
(async function () {
  const el = document.getElementById('long_task_tracker');
  function blog(text) {
    el.textContent = text;
  }

  function durationInMsToClock(durationInMs) {
    durationInMs = Math.floor(durationInMs);
    // Calculate hours, minutes, seconds, and milliseconds
    const milliseconds = durationInMs % 1000;
    const seconds = Math.floor((durationInMs / 1000) % 60);
    const minutes = Math.floor((durationInMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationInMs / (1000 * 60 * 60));

    // Format each component to have leading zeros if needed
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');

    // Combine the formatted components into the final string
    const result = `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;

    return result;
  }

  function block(block_ms) {
    blog(`page updated at ${durationInMsToClock(performance.now())}`);

    let now = performance.now();
    let end = now + block_ms;
    while (now < end) {
      now = performance.now();
    }
  }

  function toggleLongTasks() {
    const searchParams = new URLSearchParams(window.location.search);
    const FPS = 60;
    const MSPF = 1000 / FPS;
    const RATIO = 0.5;
    const blockDuration = +searchParams.get('block') || MSPF * RATIO;
    const intervalDuration = +searchParams.get('delay') || 0;

    setInterval(() => {
      block(blockDuration);
    }, intervalDuration);
  }

  toggleLongTasks();

  document.getElementById('t').addEventListener('keydown', (evt) => {
    block(100);
  });
})();


// https://dbaron.org/log/20100309-faster-timeouts
// Only add setZeroTimeout to the window object, and hide everything
// else in a closure.
(function () {
  var timeouts = [];
  var messageName = "zero-timeout-message";

  // Like setTimeout, but only takes a function argument.  There's
  // no time argument (always zero) and no arguments (you have to
  // use a closure).
  function setZeroTimeout(fn) {
    timeouts.push(fn);
    window.postMessage(messageName, "*");
  }

  function handleMessage(event) {
    if (event.source == window && event.data == messageName) {
      event.stopPropagation();
      if (timeouts.length > 0) {
        var fn = timeouts.shift();
        fn();
      }
    }
  }

  window.addEventListener("message", handleMessage, true);

  // Add the one thing we want added to the window object.
  window.setZeroTimeout = setZeroTimeout;
})();

export async function reportTimeToNextFrame() {
  let start = performance.now();
  let id = `MyFrame-${(Math.random() * 100000).toFixed(0)}`;

  let p = document.createElement('div');
  p.id = id;
  p.innerText = '.';
  p.setAttribute('elementtiming', id);
  document.body.appendChild(p);

  let viaElementTiming = new Promise(resolve => {
    // TODO, wrap this in a promise
    const observer = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.identifier != id) continue;

        let duration = entry.renderTime - start;

        console.log('via Element Timing', duration, start, entry);

        resolve(duration);
      }
      observer.disconnect();
    });
    observer.observe({ type: 'element' });
  });

  let viaSingleRaf = new Promise(resolve => {
    requestAnimationFrame((t1) => {
      let duration = t1 - start;

      console.log('via Single rAF', duration, t1);

      resolve(duration);
    })
  });

  let viaDoubleRaf = new Promise(resolve => {
    requestAnimationFrame((t1) => {
      requestAnimationFrame((t2) => {
        let duration = t2 - start;

        console.log('via Double rAF', duration, t1, t2);

        resolve(duration);
      })
    })
  });

  let viaRafNTask = new Promise(resolve => {
    requestAnimationFrame((t1) => {
      // TODO: try out different types of task scheduling methods to get higher priority task
      // See: https://github.com/WICG/scheduling-apis/blob/main/explainers/prioritized-post-task.md
      // setZeroTimeout(() => {
      setTimeout(() => {
        let t2 = performance.now();
        let duration = t2 - start;

        console.log('via rAF n Task', duration, t1, t2);

        resolve(duration);
      }, 0);
    })
  });

  return Promise.all([
    viaElementTiming,
    viaSingleRaf,
    viaDoubleRaf,
    viaRafNTask,
  ]);
}

window.reportTimeToNextFrame = reportTimeToNextFrame;