/* Usage:
await Promise.firstOnly([
	(signal) => {
		return new Promise((resolve, reject) => {
      // ...do work and resolve();
      signal.addEventListener("abort", () => {
        // ...cancel and reject();
      });
    });
	},
]);
*/

// Abortable PROmise Constructor Callback
function aprocc(cb) {
	return (signal) => {
		return new Promise((resolve, reject) => {
			cb(resolve, reject, signal);
		});
	}
}

export default async function firstOnly(promiseConstructors, { signal } = { signal: new AbortController().signal }) {
	signal?.throwIfAborted();
  
	// Create controllers that fork signal
	const controllers = promiseConstructors.map(() => {
	  const controller = new AbortController();
	  signal?.addEventListener("abort", () => controller.abort());
	  return controller;
	});
  
	// Call each promise constructor, passing in the signal
	const promises = promiseConstructors.map((pc, i) =>
	  Promise.resolve(pc(controllers[i].signal))
	);
  
	return new Promise((resolve, reject) => {
	  let firstFulfilled = false;
  
	  // Reject if the outer signal is aborted
	  signal?.addEventListener("abort", () =>
		reject(new DOMException("Aborted", "AbortError"))
	  );
  
	  for (const [i, promise] of promises.entries()) {
		// Resolve with whatever fulfills first
		promise.then(resolve).then(() => {
		  if (firstFulfilled) return;
		  firstFulfilled = true;
  
		  // Abort the others
		  const otherControllers = controllers.slice();
		  otherControllers.splice(i, 1);
  
		  for (const controller of otherControllers) {
			controller.abort();
		  }
		});
	  }
  
	  // Handle the case where all the promises reject.
	  Promise.allSettled(promises).then((results) => {
		if (results.every((r) => r.status === "rejected")) {
		  // You could do something better here?
		  reject(Error("All rejected"));
		}
	  });
	});
  }

Promise.prototype.firstOnly = firstOnly;