import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ScoreKeeper extends LitElement {
	static properties = {
		score: {},
	};

	static styles = [ css`
		:host {
			display: block;
			// border: 1px solid black;
		}
	`];

	constructor() {
		super();
		this.score = 0; // Why is this needed?
	}

	render() {
		const { score } = this;

		return html`
		<div>
			Score: ${score}
		</div>
		<button @click=${this.increment}>
			Increment
		</button>
		<button @click=${this.decrement}>
			Decrement
		</button>
		`;
	}

	connectedCallback() {
		super.connectedCallback();
	}

	increment() {
		this.score ++;
	}

	decrement() {
		this.score --;
	}
}

customElements.define('score-keeper', ScoreKeeper);