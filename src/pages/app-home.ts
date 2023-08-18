import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  static get styles() {
    return [
      styles,
      css`
    `];
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <app-header></app-header>

      <main>
        <div>
          <sl-button href="/expense" variant="primary">Add expense</sl-button>
        </div>

        <app-history></app-history>
      </main>
    `;
  }
}
