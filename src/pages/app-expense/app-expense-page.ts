import { LitElement, html } from 'lit';
import { animate } from '@lit-labs/motion';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency } from '../../model'
import { styles } from './expense-styles';
import { styles as sharedStyles } from '../../styles/shared-styles'
import { categories, currencies } from '../../data';
import '@shoelace-style/shoelace/dist/components/card/card.js';


@customElement('app-expense-page')
export class AppExpensePage extends LitElement {
  static styles = [
    sharedStyles,
    styles,
  ]

  @state()
  private _listCategories: Category[] = [];
  @state()
  private _listCurrencies: Currency[] = [];
  @property()
  private _currency?: Currency;
  @property()
  private _category?: Category;
  @state()
  private _value?: number;

  @query('#newvalue')
  inputValue!: HTMLInputElement;
  @property()
  hideValue = true;
  @property()
  disableAddExpense = true;
  @property({type: Boolean})
  hideMessage = true;

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    // this.users = await this.getUsers();
    this._listCategories = await this.getCategories();
    this._listCurrencies = await this.getCurrencies();
    this._currency = this._listCurrencies[0];
  }

  toggleDisableAddExpenseValue() {
    this.disableAddExpense = !(this._value && this._currency && this._category);
  }

  cancelAddExpense() {
    this._value = this._category = undefined;
    this.inputValue.value = '';
    this.hideValue = !this.hideValue;
  }

  changeCurrency(e: CustomEvent) {
    this._currency = e.detail.currency;
  }

  addCurrency(e: CustomEvent) {
    this._listCurrencies = [...this._listCurrencies, e.detail.currency];
  }

  addCategory(e: CustomEvent) {
    this._listCategories = [...this._listCategories, e.detail.category];
  }

  selectCategory(e: CustomEvent) {
    this._category = e.detail.category;
    this.hideValue = !this.hideValue;
  }

  _onExpenseValueChanged(e: Event) {
    if (this._value !== +this.inputValue.value){
      this._value = +this.inputValue.value;
      this.toggleDisableAddExpenseValue();
    }
  }

  createNewExpense() {
    if (!(this._value && this._currency && this._category)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    this.inputValue.value = '';
    console.log("added");
    this.displayMessage();
  }

  displayMessage() {
    this.hideMessage = false;
    setTimeout(() => {
        this.hideMessage = true;
    }, 2000);
  }

  private getCurrencies() {
    return new Promise<Currency[]>((resolve, reject) => resolve(currencies));
  }

  private getCategories() {
    return new Promise<Category[]>((resolve, reject) => resolve(categories));
  }

  render() {
    const addExpenseValue = html`
      <label for="newvalue">Total</label>
      <input id="newvalue"
        aria-label="New value"
        type="number"
        @keyup=${this._onExpenseValueChanged}
      >
      <button
        @click=${() => this.createNewExpense()}
        class=${this.disableAddExpense ? 'disabled': ''}
        >
        Add
      </button>
      <button
        @click=${() => this.cancelAddExpense()}
      >X</button>
    `;

    const addExpense = this.hideValue
      ? ""
      : addExpenseValue;


    return html`
      <app-header ?enableBack="${true}"></app-header>
      <main>
        <p class=${this.hideMessage ? "hide": ""}>Added!</p>
        <app-category
          class=${this._category ? "hide": ''}
          .categories=${this._listCategories}
          @category-selected="${this.selectCategory}"
          @category-added="${this.addCategory}"
        ></app-category>
        <app-currency
          class=${!this._category ? "hide": ''}
          .currencies=${this._listCurrencies}
          .currency=${this._currency}
          @currency-changed="${this.changeCurrency}"
          @currency-added="${this.addCurrency}"
        ></app-currency>
        ${addExpense}
      </main>
    `;
  }

}
