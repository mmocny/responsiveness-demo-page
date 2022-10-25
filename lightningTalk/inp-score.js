import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { onINP } from 'https://unpkg.com/web-vitals@3?module';
import { cwvStyles } from './cwv-styles.js';

export class InpScore extends LitElement {
	static properties = {
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
		this.score = undefined;
		this.rating = 'good';
	}

	render() {
		const { score, rating } = this;

		return html`INP: <span class=${rating}>${score}</span>`;
	}

	connectedCallback() {
		super.connectedCallback();

		onINP(({ value, rating}) => {
			this.score = Math.round(value);
			this.rating = rating;
		}, { reportAllChanges: true, durationThreshold: 0 });
	}
}

customElements.define('inp-score', InpScore);