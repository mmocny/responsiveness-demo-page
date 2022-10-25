import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { cwvStyles } from './cwv-styles.js';

const MAX_FRAMES = 10;

export class FpsMeter extends LitElement {
	static properties = {
		frameTimes: {},
		rating: {},
	};

	static styles = [cwvStyles, css`
		:host {
			display: block;
			// border: 1px solid black;
		}
	`];

	constructor() {
		super();
		this.frameTimes = [];
		this.rating = 'good';
	}

	render() {
		const { fps, rating } = this;

		return html`FPS: <span class=${rating}>${fps}</span>`;
	}

	get fps() {
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