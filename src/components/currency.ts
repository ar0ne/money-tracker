import {LitElement, css, html} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

export interface Currency {
    name: string,
    sign: string,
  }

@customElement('app-currency')
class AppCurrency extends LitElement {
    static styles =
    css``

    @query('#newcurrencysign')
    inputCurrencySign!: HTMLInputElement;
    @query('#newcurrencyname')
    inputCurrencyName!: HTMLInputElement;
    @property()
    currencies: Currency[] = [];
    @property()
    hideAddCurrency = true;
    @state()
    private _currency?: Currency;

    constructor() {
        super();
        this._currency = this.currencies[0];
    }

    toggleAddCurrency() {
        this.hideAddCurrency = !this.hideAddCurrency;
    }

    selectCurrency(item: Currency) {
        let self = this;
        this.currencies.forEach((value) => {
            if (value == item) {
                self._currency = value;
            }
        });
        // this.toggleDisableAddExpenseValue();
    }

    addCurrency() {
        this.currencies = [...this.currencies,
            {
                sign: this.inputCurrencySign.value,
                name: this.inputCurrencyName.value
            }
        ];
        this.inputCurrencyName.value = this.inputCurrencySign.value = '';
        this.toggleAddCurrency();
    }

    render() {
        const listCurrencies = html`
            <ul>
            ${map(this.currencies, (item) =>
            html`
                <button
                @click=${() => this.selectCurrency(item)}
                class=${item === this._currency ? 'selected' : ''}
                >
                ${item.sign}
                </button>
            `
            )}
            <button
                @click=${() => this.addCurrency()}
                >
                +
            </button>
            </ul>
        `;

        const addNewCurrency = html`
            <input id="newcurrencyname"
                aria-label="Currency name"
                type="text"
            >
            <input id="newcurrencysign"
                aria-label="Currency sign"
                type="text"
            >
            <button @click=${this.addCurrency}>Add</button>
        `;

        const listOrAddCurrency = this.hideAddCurrency
            ? listCurrencies
            : addNewCurrency;

        return html`
            ${listOrAddCurrency}
        `;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "app-currency": AppCurrency;
    }
}