import setImmediate from './setImmediate.js';

function raf() {
	return new Promise(resolve => {
		requestAnimationFrame(resolve);
	})
}

// TODO: (Perhaps) ideally this would be scheduler API, based on dom imvalidation or something
let needsNextPaint_ = false;
function needsNextPaint() {
	return needsNextPaint_;
}

// TODO: Ideally we don't need to mark ourselves
function markNeedsNextPaint() {
	needsNextPaint_ = true;
	
	// TODO: This requestPostAnimationFrame()
	// But, can't guarentee that requestPostAnimationFrame will run early enough.
	requestAnimationFrame(() => {
		setImmediate(() => {
			needsNextPaint_ = false;
		});
	});
}

function markNeedsNextPaintIfNeeded() {
	// Technically pending input isn't proof that we require next paint..., just that we should yield.
	// But unless all event handlers call markNeedsNextPaint correctly, lets just mark it anyway.
	if (navigator.scheduling.isInputPending()) {
		markNeedsNextPaint();
	}
}

function schedulerDotYield() {
	return new Promise(resolve => {
		setImmediate(resolve);
	});
}

async function schedulerDotYieldUntilNextPaint() {
	markNeedsNextPaintIfNeeded();

	if (needsNextPaint()) {
		await raf();
	}
	await schedulerDotYield();
}


export {
	markNeedsNextPaint,
	schedulerDotYield,
	schedulerDotYieldUntilNextPaint,
}