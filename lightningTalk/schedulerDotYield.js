import setImmediate from './setImmediate.js';

// Note: This will only be true if `schedulerDotYield()` is called before event dispatch
// Ideally we would have an api for this, perhaps similar to `isFramePending()` though not exactly.
let needsFrameAfterInput = false;

export default function schedulerDotYield() {
	if (navigator.scheduling.isInputPending()) {
		needsFrameAfterInput = true;
	}

	return new Promise(resolve => {
		if (needsFrameAfterInput) {
			// Altenatively: instead of calling rPAF every time, just call once and maintain an array of tasks
			requestAnimationFrame(() => {
				needsFrameAfterInput = false;
				setImmediate(resolve);
			});

		} else {
			setImmediate(resolve);
		}
	});
}

