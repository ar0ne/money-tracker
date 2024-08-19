import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  static get styles() {
    return [
      styles,
      css``
    ];
  }

  render() {
    return html`
      <div>
        <app-header></app-header>
        <main>
          <div class="main-btn-block">
            <span class="right">
              <save-btn/>
            </span>
            <div class="center">
              <sl-button href="/expense" variant="primary">New record</sl-button>
            </div>
          </div>
          <sl-divider></sl-divider>
          <app-history></app-history>
        </main>
      </div>
    `;
  }
}
