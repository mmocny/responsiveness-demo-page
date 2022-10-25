import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { cwvStyles } from './cwv-styles.js';

export class MetricViewer extends LitElement {
	static properties = {
		metricName: {},
		score: {},
		rating: {},
	};

	static styles = [ cwvStyles, css`
		:host {
			display: grid;
			position: relative;
			min-height: 5em;
			min-width: 10em;
			align-items: center;
			justify-content: center;

			border: 1px solid #ddd;
			border-radius: 10px;
			overflow: hidden;
		}

		.title {
			position: absolute;
			top: 0;
			left: 0;
			padding: 0.25em;
		}

		span {
			font-size: 2em;
		}
	`];

	constructor() {
		super();
		this.metricName = 'NoName';
		// this.rating = 'good';
	}

	render() {
		const { metricName, score, rating } = this;

		return html`
			<div class="title">${metricName}</div>
			<span class=${rating}>${score}</span>
			`;
	}

	connectedCallback() {
		super.connectedCallback();
	}
}