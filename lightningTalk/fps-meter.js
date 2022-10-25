import { MetricViewer } from './metric-viewer.js';

const MAX_FRAMES = 10;

export class FpsMeter extends MetricViewer {
	static properties = {
		// ...MetricViewer.properties,
		frameTimes: {},
	};

	constructor() {
		super();
		this.metricName = "FPS";
		this.frameTimes = [];
	}

	get score() {
		const frameDurationInMs = (this.frameTimes.at(-1) - this.frameTimes[0]);
		const timePerFrameInMs = frameDurationInMs / (this.frameTimes.length - 1);
		return Math.floor(1000 / timePerFrameInMs);
	}

	start() {
		requestAnimationFrame(this.tick.bind(this));
	}

	addFrameTime(time) {
		if (this.frameTimes.length == MAX_FRAMES) {
			this.frameTimes.shift();
		}
		this.frameTimes.push(time);
		this.requestUpdate();
	}

	tick(time) {
		this.addFrameTime(time);
		this.start();
	}

	connectedCallback() {
		super.connectedCallback();
		this.start();
	}
}

customElements.define('fps-meter', FpsMeter);