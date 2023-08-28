import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Currency} from '../model';

@customElement('app-currency')
class AppCurrency extends LitElement {

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
        this.addingCurrency();
    }

    toggleAddNewCurrency() {
        this.hideAddCurrency = !this.hideAddCurrency;
    }

    addingCurrency() {
        this.toggleAddNewCurrency();
        this.dispatchEvent(new CustomEvent('currency-adding', {}));
    }

    render() {
        const listCurrencies = html`
            ${map(this.currencies, (item) =>
                html`
                    <sl-button
                        @click=${() => this.selectCurrency(item)}
                        variant=${item === this.currency ? 'primary' : 'default'}
                        outline
                    >
                    ${item.sign}
                    </sl-button>
                `
            )}
            <sl-button
                variant="success"
                @click=${this.addingCurrency}
                >
                +
            </sl-button>
        `;

        const addNewCurrency = html`
            <div>
                <h3>Add new currency</h3>
                <sl-input id="newcurrencyname"
                    label="Name"
                    type="text"
                    clearable
                    placeholder="US Dollar"
                ></sl-input>
                <br />
                <sl-input id="newcurrencysign"
                    label="Sign"
                    type="text"
                    clearable
                    placeholder="$"
                ></sl-input>
                <br />
                <sl-button variant="success" @click="${this.addCurrency}">Add</sl-button>
                <sl-button variant="warning" @click="${this.addingCurrency}">X</sl-button>
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