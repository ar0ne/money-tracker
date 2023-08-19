import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';


@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Expense Tracker';

  @property({ type: Boolean}) enableBack: boolean = false;

  static get styles() {
    return css`

    `;
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>

        <div id="back-button-block">
          ${this.enableBack
            ? html`<a href="${resolveRouterPath()}"><button>Back</button></a>`
            : null
          }
          <h1>${this.title}</h1>
        </div>
      </header>
    `;
  }
}
