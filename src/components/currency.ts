import {LitElement, css, html} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import { Currency } from '../model';

@customElement('app-currency')
class AppCurrency extends LitElement {
    static styles =
    css`
        .selected {
            color: red;
        }
    `

    @query('#newcurrencysign')
    inputCurrencySign!: HTMLInputElement;
    @query('#newcurrencyname')
    inputCurrencyName!: HTMLInputElement;
    @property()
    currencies: Currency[] = [];
    @property()
    hideAddCurrency = true;

    @property() currency?: Currency;

    selectCurrency(item: Currency) {
        let self = this;
        this.currencies.forEach((value) => {
            if (value == item) {
                self.currency = value;
                return
            }
        });
    }

    addCurrency() {
        this.currencies = [...this.currencies,
            {
                sign: this.inputCurrencySign.value,
                name: this.inputCurrencyName.value
            }
        ];
        this.inputCurrencyName.value = this.inputCurrencySign.value = '';
        this.toggleAddNewCurrency();
    }

    toggleAddNewCurrency() {
        this.hideAddCurrency = !this.hideAddCurrency;
    }

    render() {
        const listCurrencies = html`
            <ul>
            ${map(this.currencies, (item) =>
                html`
                    <button
                        @click=${() => this.selectCurrency(item)}
                        class=${item === this.currency ? 'selected' : ''}
                    >
                    ${item.sign}
                    </button>
                `
            )}
            <button
                @click=${() => this.toggleAddNewCurrency()}
                >
                +
            </button>
            </ul>
        `;

        const addNewCurrency = html`
            <p>
                <h5>Add new currency</h5>
                <label for="newcurrencyname">Name</label>
                <input id="newcurrencyname"
                    aria-label="Currency name"
                    type="text"
                >
                <br>
                <label for="newcurrencysign">Sign</label>
                <input id="newcurrencysign"
                    aria-label="Currency sign"
                    type="text"
                >
                <br>
                <button @click=${this.addCurrency}>Add</button>
                <button @click=${() => this.toggleAddNewCurrency()}>X</button>
            </p>
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