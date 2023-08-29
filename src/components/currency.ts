import {LitElement, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Currency} from '../model';

@customElement('app-currency')
class AppCurrency extends LitElement {

    @query('#currencysign')
    inputCurrencySign!: HTMLInputElement;
    @query('#currencyname')
    inputCurrencyName!: HTMLInputElement;
    @property()
    currencies: Currency[] = [];
    @property()
    currency?: Currency;
    @state()
    private hideAddCurrency = true;
    @state()
    private hideEditCurrency = true;

    selectCurrency(item: Currency) {
        this.currency = item;
        const options = {
            detail: {currency: this.currency},
        };
        this.dispatchEvent(new CustomEvent('currency-changed', options));
    }

    addCurrency() {
        let currencyName = this.inputCurrencyName.value;
        let currencySign = this.inputCurrencySign.value;
        if (!(currencyName && currencySign)) {
            return;
        }
        let newCurrency: Currency = new Currency(currencyName, currencySign);
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

    toggleEditCurrency() {
        this.hideEditCurrency = !this.hideEditCurrency;
    }

    editCurrency() {
        let currencyName = this.inputCurrencyName.value;
        let currencySign = this.inputCurrencySign.value;
        if (!(currencyName && currencySign)) {
            return;
        }
        if (currencyName == this.currency?.name && currencySign == this.currency?.sign) {
            // no need to change anything
            this.editingCurrency();
            return;
        }
        let editedCurrency: Currency = Object.assign({}, this.currency);
        editedCurrency.name = currencyName;
        editedCurrency.sign = currencySign;
        this.inputCurrencyName.value = this.inputCurrencySign.value = '';
        const options = {
            detail: {currency: editedCurrency},
        };
        this.dispatchEvent(new CustomEvent('currency-edited', options));
        this.editingCurrency();
    }

    addingCurrency() {
        this.toggleAddNewCurrency();
        this.dispatchEvent(new CustomEvent('currency-adding', {}));
    }

    editingCurrency() {
        this.toggleEditCurrency();
        this.dispatchEvent(new CustomEvent('currency-adding', {}));
    }

    render() {
        const listCurrencies = html`
            ${map(this.currencies, (item) =>
                html`
                    <sl-button
                        @click=${() => this.selectCurrency(item)}
                        variant=${item.id === this.currency?.id ? 'primary' : 'default'}
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
            ${this.currency ?
                html
                `<sl-button
                    variant="warning"
                    @click=${this.editingCurrency}
                    >
                    !
                </sl-button>
                `
                : ''
            }
        `;

        const showEditCurrency = html`
            <div class="edit-currency">
                <h3>Edit currency</h3>
                <sl-input id="currencyname"
                    label="Name"
                    type="text"
                    clearable
                    placeholder="US Dollar"
                    value=${this.currency?.name}
                    >
                </sl-input>
                <br />
                <sl-input id="currencysign"
                    label="Sign"
                    type="text"
                    clearable
                    placeholder="$"
                    value=${this.currency?.sign}
                    >
                </sl-input>
                <br />
                <sl-button
                    variant="success"
                    @click="${this.editCurrency}"
                    >
                    Save
                </sl-button>
                <sl-button
                    variant="warning"
                    @click="${this.editingCurrency}"
                    >
                    Cancel
                </sl-button>
            </div>
        `;

        const addNewCurrency = html`
            <div>
                <h3>Add new currency</h3>
                <sl-input id="currencyname"
                    label="Name"
                    type="text"
                    clearable
                    placeholder="US Dollar"
                    >
                </sl-input>
                <br />
                <sl-input id="currencysign"
                    label="Sign"
                    type="text"
                    clearable
                    placeholder="$"
                    >
                </sl-input>
                <br />
                <sl-button
                    variant="success"
                    @click="${this.addCurrency}"
                    >
                    Add
                </sl-button>
                <sl-button
                    variant="warning"
                    @click="${this.addingCurrency}"
                    >
                    X
                </sl-button>
            </div>
        `;

        const setupCurrency = this.hideAddCurrency ? showEditCurrency : addNewCurrency;

        const display = (this.hideAddCurrency && this.hideEditCurrency)
            ? listCurrencies
            : setupCurrency;

        return display;
    }

}

declare global {
    interface HTMLElementTagNameMap {
        "app-currency": AppCurrency;
    }
}