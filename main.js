import { getINP } from './web-vitals.js';

let delayAmount = 0;
let delayProgress;
let inpProgress;

function attachMaterial() {
	mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));
	mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-fab'));
	delayProgress = new mdc.linearProgress.MDCLinearProgress(document.querySelector('#delay-amount'));
	inpProgress = new mdc.linearProgress.MDCLinearProgress(document.querySelector('#inp-score'));
}

function registerHandlers() {
	// TODO: Removing DOWN handlers for now, just because they render in separate frames
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
		// TODO: Multiple ways to keep busy:
		// - Can add delay in each handler, so multiple events add up
		// - Can add delay in rAF, once per handler, so multiple events add up, but lets frames render
		// - Can add delay in rAF, once per rAF, so multiple events don't add up
		// block(delayAmount);
		// blockingRaf(delayAmount);
		onceBlockingRaf(delayAmount);
	}
	const handler = (event) => {
		// console.log(`handler: ${event.timeStamp.toFixed(2)} ${event.type}`);
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

	addHandlers();
}

function startAddingDelay() {
	const MIN_DELAY = 0;
	const MAX_DELAY = 1000;
	const RAMP_DELAY = 5000;
	const RAMP_TIME = 30000;

	const interval = setInterval(() => {
		const progress = (performance.now() - RAMP_DELAY) / RAMP_TIME;
		// Clamp progress to [0,1];
		const delay_ratio = Math.max(0, Math.min(1, progress));
		delayAmount = MIN_DELAY + (MAX_DELAY - MIN_DELAY) * delay_ratio;
		// console.log('delay:', delayAmount);

		delayProgress.foundation.setProgress(delay_ratio);

		if (delay_ratio == 1) {
			clearInterval(interval);
		}
	}, 100);
}

function startMeasuringInp() {
	const GOOD = 200;
	const BAD = 500;
	const MAX = 2000;

	getINP((metric) => {
		const progress = metric.value / MAX;
		const ratio = Math.max(0, Math.min(1, progress));
		inpProgress.foundation.setProgress(ratio);
		
		console.log(ratio, metric);

	}, true);
}

function startMeasuringMainThreadDelayOnOffscreenCanvas() {

}

function main() {
	attachMaterial();
	registerHandlers();
	startAddingDelay();
	startMeasuringInp();
	startMeasuringMainThreadDelayOnOffscreenCanvas();
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
	main();
} else {
	document.addEventListener('DOMContentLoaded', main);
}