import { LitElement, html, css } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { Currency } from '../domain/model'
import { styles as sharedStyles } from '../styles/shared-styles'
import { initDB } from '../domain/db'
import { CurrencyDao } from '../domain/currency_dao'
import { SettingsDao } from '../domain/settings_dao'
import { ExpenseDao } from '../domain/expense_dao'
import { ExchangeRateDao } from '../domain/exchange_rate_dao'
import { getFirstDayOfLastMonth, getLastDayOfLastMonth } from '../utils'
import type { ExchangeRate } from '../domain/model'

export function sortCurrenciesForRates(
  currencies: Currency[],
  baseCurrencyId: string,
  recentCurrencyIds: Set<string>,
  ratesByToId: Map<string, ExchangeRate>
): Currency[] {
  const baseUpper = baseCurrencyId.toUpperCase()
  const rest = currencies.filter((c) => c.id !== baseUpper)
  const withRecent: Currency[] = []
  const withRate: Currency[] = []
  const remaining: Currency[] = []
  for (const c of rest) {
    if (recentCurrencyIds.has(c.id)) withRecent.push(c)
    else if (ratesByToId.has(c.id)) withRate.push(c)
    else remaining.push(c)
  }
  const byName = (a: Currency, b: Currency) => a.name.localeCompare(b.name)
  return [...withRecent.sort(byName), ...withRate.sort(byName), ...remaining.sort(byName)]
}

@customElement('app-rates')
export class AppRatesPage extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .header-wrap { margin: 0 2%; }
      .rates-list { margin-top: 1rem; }
      .rate-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .rate-row .code { font-weight: 600; min-width: 3rem; }
      .rate-row sl-input { width: 8rem; }
    `,
  ]

  @state() private _baseCurrencyId: string = 'USD'
  @state() private _sortedCurrencies: Currency[] = []
  @state() private _allCurrencies: Currency[] = []
  @state() private _pendingBaseCurrencyId: string | null = null
  @state() private _baseCurrencyDropdownOpen: boolean = false
  @state() private _rateInputs: Map<string, string> = new Map()
  @state() private _message: string = ''
  @state() private _hideMessage: boolean = true
  @state() private _settingsDao!: SettingsDao
  @state() private _currencyDao!: CurrencyDao
  @state() private _expenseDao!: ExpenseDao
  @state() private _exchangeRateDao!: ExchangeRateDao

  private readonly MESSAGE_DURATION = 2000

  async connectedCallback() {
    super.connectedCallback()
    await initDB()
    this._settingsDao = new SettingsDao()
    this._currencyDao = new CurrencyDao()
    this._expenseDao = new ExpenseDao()
    this._exchangeRateDao = new ExchangeRateDao()
    await this.loadData()
  }

  private async loadData() {
    const settings = await this._settingsDao.getAll()
    this._baseCurrencyId = (settings?.default_currency_id ?? 'USD').toUpperCase()
    const [currencies, rates, expenses] = await Promise.all([
      this._currencyDao.getAll(),
      this._exchangeRateDao.getAll(this._baseCurrencyId),
      this._expenseDao.getAllInRange(getFirstDayOfLastMonth(), getLastDayOfLastMonth()),
    ])
    const recentIds = new Set(expenses.map((e) => e.currency_id))
    const ratesByToId = new Map(rates.map((r) => [r.to_currency_id, r]))
    const byName = (a: Currency, b: Currency) => a.name.localeCompare(b.name)
    this._allCurrencies = [...currencies].sort(byName)
    this._sortedCurrencies = sortCurrenciesForRates(
      currencies,
      this._baseCurrencyId,
      recentIds,
      ratesByToId
    )
    const inputs = new Map<string, string>()
    for (const c of this._sortedCurrencies) {
      const r = ratesByToId.get(c.id)
      inputs.set(c.id, r != null ? String(r.rate) : '')
    }
    this._rateInputs = new Map(inputs)
  }

  private getRateInput(toCurrencyId: string): string {
    return this._rateInputs.get(toCurrencyId) ?? ''
  }

  private setRateInput(toCurrencyId: string, value: string) {
    const next = new Map(this._rateInputs)
    next.set(toCurrencyId, value)
    this._rateInputs = next
  }

  private async onSave(toCurrencyId: string) {
    const raw = this.getRateInput(toCurrencyId).trim()
    const rate = parseFloat(raw)
    if (raw === '' || isNaN(rate) || rate <= 0) {
      this.showMessage('Enter a valid positive rate')
      return
    }
    try {
      await this._exchangeRateDao.save({
        from_currency_id: this._baseCurrencyId,
        to_currency_id: toCurrencyId,
        rate,
      })
      this.showMessage('Saved')
      await this.loadData()
    } catch (err) {
      this.showMessage(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  private showMessage(msg: string) {
    this._message = msg
    this._hideMessage = false
    setTimeout(() => {
      this._hideMessage = true
      this._message = ''
    }, this.MESSAGE_DURATION)
  }

  private onBaseCurrencySelect(e: CustomEvent) {
    const item = (e as CustomEvent & { detail?: { item?: { value?: string } } }).detail?.item
    const selectedId = item?.value
    if (!selectedId) return
    const dropdown = this.shadowRoot?.querySelector('sl-dropdown') as { hide?: () => void } | null
    dropdown?.hide?.()
    if (selectedId === this._baseCurrencyId) return
    this._pendingBaseCurrencyId = selectedId
  }

  private cancelBaseCurrencyConfirm() {
    this._pendingBaseCurrencyId = null
    this._baseCurrencyDropdownOpen = false
  }

  private async confirmBaseCurrencyChange() {
    if (!this._pendingBaseCurrencyId) return
    try {
      const settings = await this._settingsDao.getAll()
      await this._settingsDao.update({
        last_currency_id: settings?.last_currency_id,
        default_currency_id: this._pendingBaseCurrencyId,
      })
      this._baseCurrencyId = this._pendingBaseCurrencyId
      this._pendingBaseCurrencyId = null
      this._baseCurrencyDropdownOpen = false
      await this.loadData()
      this.showMessage('Base currency updated')
    } catch (err) {
      this.showMessage(err instanceof Error ? err.message : 'Failed to update base currency')
    }
  }

  render() {
    return html`
      <div class="header-wrap">
        <app-header ?enableBack="${true}"></app-header>
      </div>
      <sl-divider></sl-divider>
      <main>
        <p class=${this._hideMessage ? 'hide' : ''}>${this._message}</p>
        <p>
          <strong>Base currency:</strong>
          <sl-dropdown
            ?open=${this._baseCurrencyDropdownOpen}
            @sl-after-hide=${() => (this._baseCurrencyDropdownOpen = false)}
          >
            <sl-button
              slot="trigger"
              caret
              @click=${() => (this._baseCurrencyDropdownOpen = !this._baseCurrencyDropdownOpen)}
            >
              ${this._baseCurrencyId}
            </sl-button>
            ${this._baseCurrencyDropdownOpen
              ? html`
                  <sl-menu @sl-select=${(e: CustomEvent) => this.onBaseCurrencySelect(e)}>
                    ${this._allCurrencies.map(
                      (c) => html` <sl-menu-item value=${c.id}>${c.id} - ${c.name}</sl-menu-item> `
                    )}
                  </sl-menu>
                `
              : ''}
          </sl-dropdown>
        </p>
        <sl-dialog
          label="Change base currency"
          ?open=${!!this._pendingBaseCurrencyId}
          @sl-after-hide=${() => this.cancelBaseCurrencyConfirm()}
        >
          ${this._pendingBaseCurrencyId
            ? html`Change base currency to ${this._pendingBaseCurrencyId}? This will update rates
              display.`
            : ''}
          <sl-button slot="footer" variant="primary" @click=${() => this.confirmBaseCurrencyChange()}>
            Confirm
          </sl-button>
          <sl-button slot="footer" @click=${() => this.cancelBaseCurrencyConfirm()}>
            Cancel
          </sl-button>
        </sl-dialog>
        <div class="rates-list">
          ${this._sortedCurrencies.map(
            (c) => html`
              <div class="rate-row">
                <span class="code">${c.id}</span>
                <sl-input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Rate"
                  .value=${this.getRateInput(c.id)}
                  @input=${(e: Event) => {
                    const t = (e.target as HTMLInputElement)
                    this.setRateInput(c.id, t.value)
                  }}
                ></sl-input>
                <sl-button variant="primary" @click=${() => this.onSave(c.id)}>Save</sl-button>
              </div>
            `
          )}
        </div>
      </main>
    `
  }
}
