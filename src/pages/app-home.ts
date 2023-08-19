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
      <div>
        <app-header></app-header>
        <main>
          <div>
            <sl-button href="/expense" variant="primary">Add expense</sl-button>
          </div>
          <sl-divider></sl-divider>
          <app-history></app-history>
        </main>
      </div>
    `;
  }
}
