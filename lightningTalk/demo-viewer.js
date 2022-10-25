import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { demos } from './demos.js';



export class DemoViewer extends LitElement {
	static properties = {
		demo: {},
	};

	static styles = [ css`
		:host {
			display: grid;
			grid-template-rows: min-content 1fr;
		}
		pre {
			font-size: 16px;
		}

		details summary::-webkit-details-marker,
		details summary::marker {
			display: none; 
			content: "";
		}
	`];

	constructor() {
		super();
	}

	get demoNumber() {
		const params = (new URL(document.location)).searchParams;
		const num = +params.get('demo');
		return num;
	}

	get nextDemo() {
		const next = this.demoNumber + 1;
		if (next >= demos.length) return null;
		return `?demo=${next}`;

	}

	get prevDemo() {
		const prev = this.demoNumber - 1;
		if (prev < 0) return null;
		return `?demo=${prev}`;
	}

	visibleString() {
		const s = this.demo.visible.toString().split('\n').slice(1,-1).map(s => s.substring(3)).join('\n');
		return s;
	}

	render() {
		const { title, visible, hidden } = this.demo;


		return html`
		<div>
			<a .href="${this.prevDemo}">Prev Demo</a>
			<a .href="${this.nextDemo}">Next Demo</a>
		</div>

		<details>
			<summary>Show Code: ${title}</summary>
			<pre>${this.visibleString()}</pre>
		</details>
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		this.demo = demos[this.demoNumber];
		this.demo.visible();
		this.demo.hidden();
	}
}

customElements.define('demo-viewer', DemoViewer);