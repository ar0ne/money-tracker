import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  @state()
  private _historyRefreshTrigger = 0;

  @state()
  private _importDialogOpen = false;

  @state()
  private _isScrolled = false;

  static get styles() {
    return [
      styles,
      css`
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 2%;
          min-height: 36px;
        }
        .header-row .right {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        /* Import modal: outside transformed .right so position:fixed uses viewport; centered and responsive */
        .import-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          box-sizing: border-box;
        }
        .import-panel {
          background: #fff;
          color: #1e293b;
          padding: 1.25rem;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 360px;
          box-sizing: border-box;
        }
        .import-panel h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
        }
        .import-panel p {
          margin: 0 0 1.25rem 0;
          line-height: 1.5;
        }
        .import-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .import-actions button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #334155;
        }
        .import-actions button.primary {
          background: #3b82f6;
          color: #fff;
          border-color: #3b82f6;
        }
        .fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          color: #fff;
          background: var(--sl-color-primary-600, #2563eb);
          border: none;
          border-radius: 28px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: border-radius 0.2s ease, padding 0.2s ease;
        }
        .fab:hover {
          background: var(--sl-color-primary-700, #1d4ed8);
          color: #fff;
        }
        .fab-compact {
          padding: 0.875rem;
          border-radius: 50%;
        }
        .fab sl-icon {
          font-size: 1.25rem;
        }
      `
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._onScroll, { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
    super.disconnectedCallback();
  }

  private _onScroll = () => {
    const isScrolled = window.scrollY > 50;
    if (isScrolled !== this._isScrolled) {
      this._isScrolled = isScrolled;
    }
  };

  private _onImportDialogOpen = () => {
    this._importDialogOpen = true;
  };

  private _onImportDialogCancel = () => {
    this._importDialogOpen = false;
  };

  private _onImportDialogConfirm = () => {
    this._importDialogOpen = false;
    this.dispatchEvent(new CustomEvent('import-confirm', { bubbles: true, composed: true }));
  };

  render() {
    return html`
      <div>
        <div class="header-row">
          <app-header></app-header>
          <span class="right" @import-complete=${() => { this._historyRefreshTrigger++; }} @import-dialog-open=${this._onImportDialogOpen}>
            <a href="/rates">Rates</a>
            <export-btn></export-btn>
            <import-btn></import-btn>
          </span>
        </div>
        <main>
          <app-history .refreshTrigger=${this._historyRefreshTrigger}></app-history>
        </main>

        ${this._importDialogOpen
          ? html`
              <div class="import-overlay" @click=${this._onImportDialogCancel}>
                <div class="import-panel" @click=${(e: Event) => e.stopPropagation()}>
                  <h3>Import data</h3>
                  <p>
                    Import will clear existing expenses and categories. Currencies
                    will be preserved. Continue?
                  </p>
                  <div class="import-actions">
                    <button @click=${this._onImportDialogCancel}>Cancel</button>
                    <button class="primary" @click=${this._onImportDialogConfirm}>Import</button>
                  </div>
                </div>
              </div>
            `
          : ''}

        <a href="/expense" class="fab ${this._isScrolled ? 'fab-compact' : 'fab-extended'}" aria-label="${this._isScrolled ? 'Add' : 'Add new record'}">
          <sl-icon name="plus"></sl-icon>
          ${!this._isScrolled ? html`<span>Add</span>` : ''}
        </a>
      </div>
    `;
  }
}
