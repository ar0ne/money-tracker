import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js'
import { Currency } from '../domain/model'
import { styles } from '../styles/shared-styles'
import { WORLD_CURRENCIES, type WorldCurrency } from '../data/currencies'

@customElement('app-currency')
class AppCurrency extends LitElement {
  static get styles() {
    return [
      styles,
      css`
        .add-currency {
          margin: 2%;
        }
        .currency-picker-list {
          max-height: 240px;
          overflow-y: auto;
          margin-top: 0.5em;
        }
        .currency-picker-list sl-button {
          margin: 2px;
        }
      `,
    ]
  }

  @property()
  currencies: Currency[] = []
  @property()
  currency?: Currency
  @property()
  visibleCurrencies: Currency[] = []
  @state()
  private hideAddCurrency = true
  @state()
  private hideAllCurrencies = true
  @state()
  private addSearchQuery = ''

  private get availableWorldCurrencies(): WorldCurrency[] {
    const addedNames = new Set(this.currencies.map((c) => c.name))
    return WORLD_CURRENCIES.filter((w) => !addedNames.has(w.name))
  }

  private get filteredWorldCurrencies(): WorldCurrency[] {
    const q = this.addSearchQuery.trim().toLowerCase()
    if (!q) return this.availableWorldCurrencies
    return this.availableWorldCurrencies.filter(
      (w) =>
        w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
    )
  }

  selectCurrency(item: Currency) {
    this.currency = item
    this.dispatchEvent(
      new CustomEvent('currency-changed', { detail: { currency: this.currency } })
    )
  }

  selectWorldCurrency(entry: WorldCurrency) {
    const newCurrency = new Currency(entry.name, entry.sign)
    this.dispatchEvent(
      new CustomEvent('currency-added', { detail: { currency: newCurrency } })
    )
    this.toggleAddNewCurrency()
    this.dispatchEvent(new CustomEvent('currency-adding', {}))
  }

  toggleAddNewCurrency() {
    this.hideAddCurrency = !this.hideAddCurrency
    if (this.hideAddCurrency) this.addSearchQuery = ''
  }

  addingCurrency() {
    this.toggleAddNewCurrency()
    this.dispatchEvent(new CustomEvent('currency-adding', {}))
  }

  expandAllCurrencies() {
    this.hideAllCurrencies = false
    this.dispatchEvent(new CustomEvent('currency-show-all', {}))
  }

  private _onAddSearchInput(e: Event) {
    const input = e.target as HTMLInputElement
    this.addSearchQuery = input?.value ?? ''
  }

  render() {
    const listCurrencies = html`
      ${map(
        this.visibleCurrencies,
        (item) => html`
          <sl-button
            @click=${() => this.selectCurrency(item)}
            variant=${item.id === this.currency?.id ? 'primary' : 'default'}
            outline
            title=${item.name}
          >
            ${item.sign}
          </sl-button>
        `
      )}
      ${this.hideAllCurrencies
        ? html`
            <sl-button
              variant="neutral"
              title="All currencies"
              @click=${this.expandAllCurrencies}
            >
              ...
            </sl-button>
          `
        : ''}
      <sl-button variant="success" @click=${this.addingCurrency}> + </sl-button>
    `

    const addNewCurrency = html`
      <div class="add-currency">
        <h3>Add new currency</h3>
        <sl-input
          label="Search"
          type="text"
          placeholder="Search by name or code..."
          .value=${this.addSearchQuery}
          @input=${this._onAddSearchInput}
          clearable
        ></sl-input>
        <div class="currency-picker-list">
          ${this.filteredWorldCurrencies.length === 0
            ? html`<p>No currencies match, or all are already added.</p>`
            : map(
                this.filteredWorldCurrencies,
                (entry) => html`
                  <sl-button
                    variant="default"
                    outline
                    title=${entry.name}
                    @click=${() => this.selectWorldCurrency(entry)}
                  >
                    ${entry.sign}
                  </sl-button>
                `
              )}
        </div>
        <sl-button variant="warning" @click=${this.addingCurrency}>
          Cancel
        </sl-button>
      </div>
    `

    const display = this.hideAddCurrency ? listCurrencies : addNewCurrency
    return display
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-currency': AppCurrency
  }
}
