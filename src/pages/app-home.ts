import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { styles } from '../styles/shared-styles';
import { initDB } from '../domain/db';
import { CategoryDao } from '../domain/category_dao';
import type { Category } from '../domain/model';

@customElement('app-home')
export class AppHome extends LitElement {

  @state()
  private _historyRefreshTrigger = 0;

  @state()
  private _importDialogOpen = false;

  @state()
  private _isScrolled = false;

  @state()
  private _filterOpen = false;

  @state()
  private _enabledCategoryIds = new Set<string>();

  @state()
  private _filterCategories: Category[] = [];

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
        .rates-btn {
          color: inherit;
        }
        .filter-btn {
          color: inherit;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .filter-btn.filter-btn-active {
          color: var(--sl-color-primary-600, #2563eb);
        }
        .filter-btn svg {
          width: 36px;
          height: 36px;
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
        .filter-overlay {
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
        .filter-panel {
          background: #fff;
          color: #1e293b;
          padding: 1.25rem;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 360px;
          max-height: 80vh;
          overflow-y: auto;
          box-sizing: border-box;
        }
        .filter-panel h3 {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
        }
        .filter-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-start;
          margin-top: 1rem;
        }
        .filter-actions sl-button {
          flex-shrink: 0;
        }
        .filter-category-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
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

  private _onFilterOpen = async () => {
    this._filterOpen = true;
    await initDB();
    const categoryDao = new CategoryDao();
    this._filterCategories = await categoryDao.getAll(true);
  };

  private _onFilterBack = () => {
    this._filterOpen = false;
  };

  private _onFilterCategoryToggle = (categoryId: string) => {
    const next = new Set(this._enabledCategoryIds);
    const allIds = this._filterCategories.map((c) => c.id);
    if (next.size === 0) {
      // Currently "all enabled"; unchecking means show all except this one
      allIds.forEach((id) => id !== categoryId && next.add(id));
    } else {
      if (next.has(categoryId)) {
        next.delete(categoryId);
        if (next.size === 0) next.clear();
      } else {
        next.add(categoryId);
        if (next.size === this._filterCategories.length) next.clear();
      }
    }
    this._enabledCategoryIds = next;
  };

  private _isCategoryEnabled = (categoryId: string): boolean => {
    if (this._enabledCategoryIds.size === 0) return true;
    return this._enabledCategoryIds.has(categoryId);
  };

  private _isFilterActive = (): boolean => {
    if (this._filterCategories.length === 0) return false;
    return this._enabledCategoryIds.size > 0 && this._enabledCategoryIds.size < this._filterCategories.length;
  };

  render() {
    return html`
      <div>
        <div class="header-row">
          <app-header></app-header>
          <span class="right" @import-complete=${() => { this._historyRefreshTrigger++; }} @import-dialog-open=${this._onImportDialogOpen}>
          <button
            class="filter-btn ${this._isFilterActive() ? 'filter-btn-active' : ''}"
            title="Filters"
            aria-label="Filters"
            @click=${this._onFilterOpen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7H20" />
              <path d="M7 12L17 12" />
              <path d="M11 17H13" />
            </svg>
          </button>
          <button>
            <a href="/rates" class="rates-btn" title="Rates" aria-label="Rates">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                width="36"
                height="36">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </a>
            </button>
            <export-btn></export-btn>
            <import-btn></import-btn>
          </span>
        </div>
        <main>
          <app-history
            .refreshTrigger=${this._historyRefreshTrigger}
            .enabledCategoryIds=${this._enabledCategoryIds.size > 0 ? Array.from(this._enabledCategoryIds) : null}
          ></app-history>
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

        ${this._filterOpen
          ? html`
              <div class="filter-overlay" @click=${this._onFilterBack}>
                <div class="filter-panel" @click=${(e: Event) => e.stopPropagation()}>
                  <h3>Filters</h3>
                  <p>Categories to display in history:</p>
                  ${map(this._filterCategories, (cat) => html`
                    <div class="filter-category-item">
                      <sl-checkbox
                        ?checked=${this._isCategoryEnabled(cat.id)}
                        @sl-change=${() => this._onFilterCategoryToggle(cat.id)}
                      >${cat.name}</sl-checkbox>
                    </div>
                  `)}
                  <div class="filter-actions">
                    <sl-button @click=${this._onFilterBack}>Back</sl-button>
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
