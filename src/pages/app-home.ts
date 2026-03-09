import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  @state()
  private _historyRefreshTrigger = 0;

  @state()
  private _importDialogOpen = false;

  static get styles() {
    return [
      styles,
      css`
        .main-btn-block {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        .main-btn-block .right {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          float: none;
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
      `
    ];
  }

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
        <app-header></app-header>
        <main>
          <div class="main-btn-block">
            <span class="right" @import-complete=${() => { this._historyRefreshTrigger++; }} @import-dialog-open=${this._onImportDialogOpen}>
              <export-btn></export-btn>
              <import-btn></import-btn>
            </span>
            <div class="center">
              <sl-button href="/expense" variant="primary">New record</sl-button>
            </div>
          </div>
          <sl-divider></sl-divider>
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
      </div>
    `;
  }
}
