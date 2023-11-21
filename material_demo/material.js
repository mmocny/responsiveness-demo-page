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

function main() {
	attachMaterial();
	addResponsivenessJank();
	startMeasuringInp();
}

if (document.readyState === "complete" || document.readyState === "loaded" || document.readyState === "interactive") {
	main();
} else {
	document.addEventListener('DOMContentLoaded', main);
}