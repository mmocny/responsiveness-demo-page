import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class ScoreKeeper extends LitElement {
	static properties = {
		score: {},
	};

	static styles = [ css`
		:host {
			display: grid;
			grid-template-rows: 1fr min-content;

			min-height: 8em;
			min-width: 10em;
			margin: 1em;

			align-items: center;
			justify-content: center;
		}

		.score {
			text-align:center;
		}
	`];

	constructor() {
		super();
		this.score = 0; // Why is this needed?
	}

	render() {
		const { score } = this;

		return html`
			<span class="score">
				Score: ${score}
			</span>
			<div>
				<button @click=${this.increment}>
					Increment
				</button>
				<button @click=${this.decrement}>
					Decrement
				</button>
			</div>
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