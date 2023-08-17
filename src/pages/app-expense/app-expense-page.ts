import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency } from '../../model'
import { styles } from './expense-styles';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';
import { categories, currencies } from '../../data';


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


  @query('#newvalue')
  inputValue!: HTMLInputElement;

  @property()
  hideValue = true;
  @property()
  disableAddExpense = false;

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
    `;

    return html`
      <app-header ?enableBack="${true}"></app-header>
      <main>
        <app-category
          .categories=${this._listCategories}
          @category-selected="${this.selectCategory}"
        ></app-category>
        <app-currency
          .currencies=${this._listCurrencies}
          .currency=${this._currency}
          @currency-changed="${this.changeCurrency}"
        ></app-currency>
        ${addExpenseValue}
      </main>
    `;
  }

  toggleAddValue() {
    // this.hideCategories = !this.hideCategories;
  }

  toggleDisableAddExpenseValue() {
    // this.disableAddExpense = !(this._value && this._currency && this._category);
  }

  changeCurrency(e: CustomEvent) {
    this._currency = e.detail.currency;
  }

  selectCategory(e: CustomEvent) {
    this._category = e.detail.category;
  }

  _onExpenseValueChanged(e: Event) {
    if (this._value !== +this.inputValue.value){
      this._value = +this.inputValue.value;
      // updated doesn't work for onChange
      this.toggleDisableAddExpenseValue();
    }
  }

  createNewExpense() {
    console.log(this._currency);
    console.log(this._category)
    if (!(this._value)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    console.log("added");
  }

  private getCurrencies() {
    return new Promise<Currency[]>((resolve, reject) => resolve(currencies));
  }

  private getCategories() {
    return new Promise<Category[]>((resolve, reject) => resolve(categories));
  }

}
