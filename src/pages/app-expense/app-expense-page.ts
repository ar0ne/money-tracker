import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';

import { Category } from '../../components/category';
import { Currency } from '../../components/currency';
import { styles } from './expense-styles';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';


class Expense {
  constructor(
    public currency: Currency,
    public value: number,
    public category: Category
  ) {
    this.currency = currency;
    this.value = value;
    this.category = category;
  }
}

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


  @state()
  private _value?: number;

  constructor() {
    super();
    this._listCategories = [
      { name: 'Services'},
      { name: 'Enterprise' },
      { name: 'Alcohol'},
      { name: 'Groceries' },
      { name: 'Trips' },
    ];
    this._listCurrencies = [
      { sign: '$', name: 'US Dollar' },
      { sign: '€', name: 'Euro' },
    ];
  }


  @query('#newvalue')
  inputValue!: HTMLInputElement;

  @property()
  hideValue = true;
  @property()
  disableAddExpense = true;

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
        <app-category .categories=${this._listCategories}></app-category>
        <app-currency .currencies=${this._listCurrencies}></app-currency>
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


  _onExpenseValueChanged(e: Event) {
    if (this._value !== +this.inputValue.value){
      this._value = +this.inputValue.value;
      // updated doesn't work for onChange
      this.toggleDisableAddExpenseValue();
    }
  }

  createNewExpense() {
    if (!(this._value)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    console.log("added");
  }

}
