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
			display: block;
			// border: 1px solid black;
		}
	`];

	constructor() {
		super();
		this.metricName = 'NoName';
		this.rating = 'good';
	}

	render() {
		const { metricName, score, rating } = this;

		return html`${metricName}: <span class=${rating}>${score}</span>`;
	}

	connectedCallback() {
		super.connectedCallback();
	}
}