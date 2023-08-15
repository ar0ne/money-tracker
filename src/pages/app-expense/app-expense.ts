import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';

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

  render() {
    const categories = html`
    <ul>
      ${this._listCategories.map((item) =>
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
      @click=${() => this.toggleAddCategory()}>+
    </button>
    `;

    const addnewcategory = html`
      <h2>Add Expense</h2>
      <input id="newcategory" aria-label="New item">
      <button @click=${this.addCategory}>Add</button>
      <button @click=${this.toggleAddCategory}>X</button>
    `;

    const listOrAddCategory = this.hideAddCategory
        ? categories
        : addnewcategory;


    const currencies = html`
      <ul>
      ${this._listCurrencies.map((item) =>
        html`
          <button
              @click=${() => this.selectCurrency(item)}
              class=${item.sign == this._currency?.sign ? 'selected' : ''}
              >
            ${item.sign}
          </button>
        `
      )}
    </ul>
    `;

    const values = html`
      <input id="newvalue"
        aria-label="New value"
        type="number"
      >
      ${currencies}
      <button
        @click=${() => this.addExpense()}
      >
        Add
      </button>
    `;

    const categoriesOrValue = this.hideCategories
        ? values
        : listOrAddCategory

    return html`
      <app-header ?enableBack="${true}"></app-header>

      <main>
        ${categoriesOrValue}
      </main>
    `;
  }

  selectCategory(item) {
    // next page
    console.log(item.text);
    this._category = item;
    this.toggleAddValue();
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

  selectCurrency(item: Currency) {
    let self = this;
    this._listCurrencies.forEach(function(value) {
      if (value.sign == item.sign) {
        self._currency = value;
      }
    });
  }

  addExpense() {
    // todo
    if (!this.inputValue.value) {
      // do nothing
      return
    }
    this._value = this.inputValue.value as any;
    var msg = `${this._value} ${this._currency?.sign} ${this._category?.text}`;
    // let expense: Expense = new Expense(this.currency, this.inputValue.value, );
    console.log("Added " + msg);
  }

}
