import { getINP, reportAllInteractions } from '../snippets/getINP.js';
import { addResponsivenessJank } from '../snippets/addResponsivenessJank.js';

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
	const fab = document.querySelector('.mdc-fab');
	fab.addEventListener('click', (event) => {
		stopAddingDelay();
		setDelay(200);
	});
}


let interval;
function startAddingDelay() {
	const MIN_DELAY = 0;
	const MAX_DELAY = 500;
	const RAMP_DELAY = 5000;
	const RAMP_TIME = 30000;

	// interval = setInterval(() => {
	// 	const progress = (performance.now() - RAMP_DELAY) / RAMP_TIME;
	// 	// Clamp progress to [0,1];
	// 	setDelay(MIN_DELAY + (MAX_DELAY - MIN_DELAY) * delay_ratio);


	// 	if (delay_ratio == 1) {
	// 		stopAddingDelay();
	// 	}
	// }, 100);

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
function stopAddingDelay() {
	clearInterval(interval);
}
// function setDelay(ms) {
// 	const delay_ratio = Math.max(0, Math.min(1, progress));
// 	const progress = (performance.now() - RAMP_DELAY) / RAMP_TIME;
// 	const delay_ratio = Math.max(0, Math.min(1, progress));

// 	delayAmount = ms;
// 	// console.log('delay:', delayAmount);
// 	delayProgress.foundation.setProgress(delay_ratio);
// }

function startMeasuringInp() {
	const GOOD = 200;
	const BAD = 500;
	const MAX = 2000;

	getINP((metric) => {
		const progress = metric.value / MAX;
		const ratio = Math.max(0, Math.min(1, progress));
		inpProgress.foundation.setProgress(ratio);
		
		console.log('[INP]', metric.value, metric);

	}, true);
}

function startMeasuringMainThreadDelayOnOffscreenCanvas() {

}

function main() {
	attachMaterial();
	registerHandlers();
	addResponsivenessJank();
	startMeasuringInp();
	startMeasuringMainThreadDelayOnOffscreenCanvas();
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
	main();
} else {
	document.addEventListener('DOMContentLoaded', main);
}