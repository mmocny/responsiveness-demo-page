import firstOnly from './Promise.firstOnly.polyfill.js';

// Always unblocks next-render... but can leave main thread idle time while waiting for next frame.
function doubleRaf(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}

// Always unblocks next-render... but gets scheduled at the back of the main thread task queue
function rafAndTask(cb) {
  requestAnimationFrame(() => {
    setTimeput(cb, 0);
  });
}

// Always unblocks next-render... and races the next
export default function requestPostAnimationFrame(cb) {
  // Wrap the callback with a helper that ensures it only gets called once.
  // Many different ways to do this better, this is just a demonstration.
  let cbOnce = () => {
    cb();
    cbOnce = () => {};
  };

  // first rAF guarentees we are inisde a rendering task which will end with Commit
  // ...but at this point, we still cannot block the update
  requestAnimationFrame(async () => {
    // Now we need a way to post a macrotask that runs after the current rendering task is done.
    // You can use setTimeout or setImmediate (or its post-message polyfill) etc, but those can be lower
    // priority than rAF.  On the other hand, rAF is only run once per frame.
    // So... race() to see which runs first.  This isn't strictly needed.
    // There may be better ways to yield here with a high-priority resumption via postTask...
    await firstOnly([
      (signal) => {
        return new Promise((resolve, reject) => {
          const t = setTimeout(() => {
            // console.log('setTimeout wins');
            cbOnce();
            resolve();
          }, 0);
          signal.addEventListener('abort', () => {
            clearTimeout(t);
            reject();
          });
        });
      },

      (signal) => {
        return new Promise((resolve, reject) => {
          const r = requestAnimationFrame(() => {
            // console.log('rAF wins');
            cbOnce();
            resolve();
          });
          signal.addEventListener('abort', () => {
            cancelAnimationFrame(r);
            reject();
          });
        });
      },
    ]);
    // TODO: ideally we cancel whichever didn't finish yet based on `whichFinished`
  });
}
