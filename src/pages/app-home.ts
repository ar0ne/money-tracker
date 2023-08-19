import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

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
      <div class="container-fluid">
        <app-header></app-header>

        <main>
          <div>
            <a href="/expense">
              <button>Add expense</button>
            </a>
          </div>

          <app-history></app-history>
        </main>
      </div>
    `;
  }
}
