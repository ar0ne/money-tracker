import {LitElement, css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Currency} from '../model';

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
    currency?: Currency;
    @state()
    private hideAddCurrency = true;

    selectCurrency(item: Currency) {
        this.currency = item;
        const options = {
            detail: {currency: this.currency},
        };
        this.dispatchEvent(new CustomEvent('currency-changed', options));
    }

    addCurrency() {
        let newCurrency: Currency = new Currency(
            this.inputCurrencyName.value,
            this.inputCurrencySign.value,
        )
        this.inputCurrencyName.value = this.inputCurrencySign.value = '';
        const options = {
            detail: {currency: newCurrency},
        };
        this.dispatchEvent(new CustomEvent('currency-added', options));
        this.toggleAddNewCurrency();
    }

    toggleAddNewCurrency() {
        this.hideAddCurrency = !this.hideAddCurrency;
    }

    render() {
        const listCurrencies = html`
            ${map(this.currencies, (item) =>
                html`
                    <sl-button
                        @click=${() => this.selectCurrency(item)}
                        class=${item === this.currency ? 'selected' : ''}
                    >
                    ${item.sign}
                    </sl-button>
                `
            )}
            <sl-button
                @click=${() => this.toggleAddNewCurrency()}
                >
                +
            </sl-button>
        `;

        const addNewCurrency = html`
            <div>
                <h3>Add new currency</h3>
                <sl-input id="newcurrencyname"
                    label="Currency name"
                    type="text"
                    clearable
                    placeholder="US Dollar"
                ></sl-input>
                <br />
                <sl-input id="newcurrencysign"
                    label="Currency sign"
                    type="text"
                    clearable
                    placeholder="$"
                ></sl-input>
                <br />
                <sl-button @click="${this.addCurrency}">Add</sl-button>
                <sl-button @click="${() => this.toggleAddNewCurrency()}">X</sl-button>
            </div>
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