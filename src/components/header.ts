import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';
import { styles } from '../styles/shared-styles';


@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Expense Tracker';

  @property({ type: Boolean}) enableBack: boolean = false;

  static get styles() {
    return [
      styles,
      css`
      header a {
        margin-left: 2%;
      }
      header div {
        width: 100%;
        margin-bottom: 1rem;
      }
      `
    ]
  }

  constructor() {
    super();
  }

  render() {
    return html`
      <header>
        <h1 class="center">${this.title}</h1>
        <div>
          ${this.enableBack
            ? html`
                <a href="${resolveRouterPath()}">
                  <sl-button>Back</sl-button>
                </a>
              `
            : null
          }
        </div>
      </header>
    `;
  }
}
