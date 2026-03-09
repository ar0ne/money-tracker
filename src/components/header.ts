import { LitElement, css, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { resolveRouterPath } from '../router';
import { styles } from '../styles/shared-styles';


@customElement('app-header')
export class AppHeader extends LitElement {
  @property({ type: String }) title = 'Track spending';

  @property({ type: Boolean}) enableBack: boolean = false;

  static get styles() {
    return [
      styles,
      css`
        header {
          margin: 0;
          padding: 0;
        }
        header a {
          margin-left: 0;
        }
        header div {
          width: 100%;
          margin-bottom: 0;
        }
        h1 {
          margin: 1rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: left;
        }
      `
    ]
  }

  render() {
    return html`
      <header>
        <h1>${this.title}</h1>
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
