import { LitElement, html, PropertyValues } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

import { styles } from './expense-styles';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';

type Currency = {
  text: string,
  sign: string,
}

type Category = {
  text: string,
}

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

@customElement('app-expense')
export class AppExpense extends LitElement {
  static styles = [
    sharedStyles,
    styles,
  ]

  @state()
  private _listCategories: Category[] = [
    { text: 'Services'},
    { text: 'Enterprise' },
    { text: 'Alcohol'},
    { text: 'Groceries' },
    { text: 'Trips' },
  ];

  @state()
  private _listCurrencies: Currency[] = [
    { sign: '$', text: 'US Dollar' },
    { sign: '€', text: 'Euro' },
  ];

  @state()
  private _category?: Category;
  @state()
  private _currency?: Currency;
  @state()
  private _value?: number;

  constructor() {
    super();
    this._currency = this._listCurrencies[0];
  }

  @query('#newcategory')
  inputCategory!: HTMLInputElement;
  @query('#newvalue')
  inputValue!: HTMLInputElement;

  @property()
  hideAddCategory = true;
  @property()
  hideValue = true;
  @property()
  hideCategories = false;
  @property()
  disableAddExpense = true;

  render() {
    const listCategories = html`
      <ul>
      ${map(this._listCategories, (item) =>
        html`
          <button
              @click=${() => this.selectCategory(item)}>
            ${item.text}
          </button>
          </br>
        `
      )}
      </ul>
      <button
        @click=${() => this.toggleAddCategory()}
        >+
      </button>
    `;

    const addNewCategory = html`
      <h2>Add Expense</h2>
      <input id="newcategory" aria-label="New item">
      <button @click=${this.addCategory}>Add</button>
      <button @click=${this.toggleAddCategory}>X</button>
    `;

    const listOrAddCategory = this.hideAddCategory
      ? listCategories
      : addNewCategory;

    const listCurrencies = html`
      <ul>
      ${map(this._listCurrencies, (item) =>
        html`
          <button
            @click=${() => this.selectCurrency(item)}
            class=${item === this._currency ? 'selected' : ''}
            >
            ${item.sign}
          </button>
        `
      )}
      </ul>
    `;

    const addExpenseValue = html`
      <input id="newvalue"
        aria-label="New value"
        type="number"
        @keyup=${this._onExpenseValueChanged}
      >
      ${listCurrencies}
      <button
        @click=${() => this.createNewExpense()}
        class=${this.disableAddExpense ? 'disabled': ''}
        >
        Add
      </button>
    `;

    const categoriesOrAddExpenseValue = this.hideCategories
      ? addExpenseValue
      : listOrAddCategory

    return html`
      <app-header ?enableBack="${true}"></app-header>
      <main>
        ${categoriesOrAddExpenseValue}
      </main>
    `;
  }

  selectCategory(item: Category) {
    // next page
    console.log(item.text);
    this._category = item;
    this.toggleAddValue();
    this.toggleDisableAddExpenseValue();
  }

  addCategory() {
    this._listCategories = [...this._listCategories,
      {text: this.inputCategory.value}];
    this.inputCategory.value = '';
    this.toggleAddCategory();
  }

  removeCategory() {
    // todo
  }

  toggleAddCategory() {
    this.hideAddCategory = !this.hideAddCategory;
  }

  toggleAddValue() {
    this.hideCategories = !this.hideCategories;
  }

  toggleDisableAddExpenseValue() {
    this.disableAddExpense = !(this._value && this._currency && this._category);
  }

  selectCurrency(item: Currency) {
    let self = this;
    this._listCurrencies.forEach((value) => {
      if (value == item) {
        self._currency = value;
      }
    });
    this.toggleDisableAddExpenseValue();
  }

  _onExpenseValueChanged(e: Event) {
    if (this._value !== +this.inputValue.value){
      this._value = +this.inputValue.value;
      // updated doesn't work for onChange
      this.toggleDisableAddExpenseValue();
    }
  }

  createNewExpense() {
    if (!(this._currency && this._value && this._category)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    var msg = `${this._value} ${this._currency?.sign} ${this._category?.text}`;
    let expense: Expense = new Expense(this._currency as Currency, this._value as number, this._category as Category);
    console.log("Added " + msg);
    console.log(expense);
  }

}
