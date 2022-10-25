import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class MyTimer extends LitElement {
  static properties = {
    start: {},
    elapsed: {},
  };
  static styles = css`
    :host {
		display: block;
    }`;

  constructor() {
    super();
  }

  render() {
    const { elapsed } = this;
    const sec = pad(Math.floor((elapsed / 1000)));
    const hun = pad(Math.floor((elapsed % 1000) / 10));

    return html`Time: ${sec}.${hun}`;
  }

  start() {
	this.start = performance.now();
    this.elapsed = 0;
	this.tick();
  }

  tick() {
	this.elapsed = performance.now() - this.start;
	requestAnimationFrame(() => this.tick());
  }

  connectedCallback() {
    super.connectedCallback();
    this.start();
  }
}

customElements.define('my-timer', MyTimer);

function pad(val) {
  return String(val).padStart(2, '0');
}
