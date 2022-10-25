import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { onFID } from 'https://unpkg.com/web-vitals@3?module';
import { cwvStyles } from './cwv-styles.js';

export class FidScore extends LitElement {
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

		return html`FID: <span class=${rating}>${score}</span>`;
	}

	connectedCallback() {
		super.connectedCallback();

		onFID(({ value, rating }) => {
			this.score = Math.round(value);
			this.rating = rating;
		});
	}
}

customElements.define('fid-score', FidScore);