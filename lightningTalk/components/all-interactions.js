import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { cwvStyles } from './cwv-styles.js';
import onInteraction from '../utils/onInteraction.js';

export class AllInteractions extends LitElement {
	static properties = {
		interactions: {},
	};

	static styles = [ cwvStyles, css`
		:host {
			display: grid;
			grid-template-rows: min-content 1fr;
		}

		ul {
			margin: 0;
			font-size: 0.75em;

			max-height: 10em;
			overflow: scroll;
		}

		details {
			overflow: scroll;
		}

		// details summary::-webkit-details-marker,
		// details summary::marker {
		// 	display: none; 
		// 	content: "";
		// }
	`];

	constructor() {
		super();
		this.interactions = [];
	}

	getRating(score) {
		if (score <= 200) return 'good';
		if (score <= 500) return 'needs-improvement';
		return 'poor';
	}

	getAverage() {
		return this.interactions.reduce((sum, interaction) => sum + interaction.value, 0) / this.interactions.length;
	}

	render() {
		const { interactions } = this;

		return html`
		
		<details>
			<summary>Show All Interactions</summary>
			<div>Average: ${this.getAverage()}</div>
			<ul>
				${interactions.map(interaction => 
					html`<li>Interaction: <span class=${this.getRating(interaction.value)}>${interaction.value}</span></li>`
				)}
			</ul>
		</details>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		onInteraction((interaction) => {
			// Push front so looks better
			this.interactions.unshift(interaction);
			this.requestUpdate();
		});
	}
}

customElements.define('all-interactions', AllInteractions);