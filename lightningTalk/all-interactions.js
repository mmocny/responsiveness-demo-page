import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { cwvStyles } from './cwv-styles.js';
import onInteraction from './onInteraction.js';

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

	render() {
		const { interactions } = this;

		return html`
		
		<details>
			<summary>Show All Interactions</summary>
			<ul>
				${interactions.map(i => html`<li>Interaction: <span class=${this.getRating(i.value)}>${i.value}</span></li>`)}
			</ul>
		</details>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		onInteraction((interaction) => {
			this.interactions.unshift(interaction);
			this.requestUpdate();
		});
	}
}

customElements.define('all-interactions', AllInteractions);