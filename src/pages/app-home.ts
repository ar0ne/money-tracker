import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';

import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  static get styles() {
    return [
      styles,
      css`
    `];
  }

  constructor() {
    super();
  }

  async firstUpdated() {
  }

  render() {
    return html`
      <app-header></app-header>

      <main>
        <div>
          <sl-button href="${resolveRouterPath('expense')}" variant="primary">Add expense</sl-button>
        </div>

        <app-history></app-history>
      </main>
    `;
  }
}
