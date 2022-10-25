import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import { demos } from './demos.js';

export class DemoViewer extends LitElement {
	static properties = {
		demo: {},
		nextDemo: {},
	};

	static styles = [ css`
		:host {
			display: grid;
			grid-template-rows: min-content 1fr;
			margin-bottom: 100vh;
		}
		pre {
			padding-left: 2em;
			background-color: #eef;
			border: 1px solid #dde;
			border-radius: 5px;
		}

		// details summary::-webkit-details-marker,
		// details summary::marker {
		// 	display: none; 
		// 	content: "";
		// }
	`];

	constructor() {
		super();

		const demoNumber = this.demoNumber;
		const nextDemoNumber = demoNumber+1;
		this.demo = demos[demoNumber];

		if (nextDemoNumber < demos.length) {
			this.nextDemo = demos[nextDemoNumber];
		} else {
			this.nextDemo = {};
		}

	}

	get demoNumber() {
		const params = (new URL(document.location)).searchParams;
		const num = +params.get('demo');
		return num;
	}

	get hasNextDemo() {
		return !!this.nextDemo;
	}

	get nextDemoLink() {
		const next = this.demoNumber + 1;
		if (next >= demos.length)
			return html`<a>Next Demo</a>`;
		return html`<a href="?demo=${next}">Next Demo</a>`;

	}

	get prevDemoLink() {
		const prev = this.demoNumber - 1;
		if (prev < 0)
			return html`<a>Prev Demo</a>`;
		return html`<a href="?demo=${prev}">Prev Demo</a>`;
	}

	visibleString(fn) {
		const s = fn.toString().split('\n').slice(1,-1).map(s => s.substring(3)).join('\n');
		return s;
	}

	toggleNextCode(evt) {
		window.scrollTo({ top: this.getBoundingClientRect().y });
	}

	render() {
		const { title: currentDemoTitle, visible: currentDemoCode } = this.demo;
		const { title: nextDemoTitle, visible: nextDemoCode } = this.nextDemo;

		console.log(nextDemoTitle);

		return html`
		<div>
			${this.prevDemoLink} ${this.nextDemoLink}
		</div>

		<details open>
			<summary>This Demo: ${currentDemoTitle}</summary>
			<pre>${this.visibleString(currentDemoCode)}</pre>
		</details>

		${this.nextDemoTitle ?
			html `` :
			html`
				<details @toggle=${this.toggleNextCode}>
					<summary>Next Demo</summary>
					${nextDemoTitle}
					<pre>${this.visibleString(nextDemoCode)}</pre>
				</details>
			`
		}
		`;
	}

	connectedCallback() {
		super.connectedCallback();

		this.demo.visible();
		this.demo.hidden();
	}
}

customElements.define('demo-viewer', DemoViewer);