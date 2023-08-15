import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';

import { styles } from './expense-styles';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';

type Currency = {
  text: string,
  sign: string,
  selected: boolean,
}
@customElement('app-expense')
export class AppExpense extends LitElement {
  static styles = [
    sharedStyles,
    styles,
  ]


  @state()
  private _listCategories = [
    { text: 'Services' },
    { text: 'Enterprise' },
    { text: 'Alcohol' },
    { text: 'Groceries' },
    { text: 'Trips' },
  ];

  @state()
  private _listCurrencies: Currency[] = [
    { sign: '$', text: 'US Dollar', selected: true },
    { sign: '€', text: 'Euro', selected: false },
  ];

  constructor() {
    super();
  }

  @query('#newcategory')
  input!: HTMLInputElement;

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
              class=${item.selected ? 'selected' : ''}
              >
            ${item.sign}
          </button>
        `
      )}
    </ul>
    `;

    const values = html`
        ${currencies}
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
    this.toggleAddValue();
  }

  addCategory() {
    this._listCategories = [...this._listCategories,
      {text: this.input.value}];
    this.input.value = '';
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
    let newCurrencyList: Currency[] = [];
    this._listCurrencies.forEach(function(value, idx) {
      let el = value;
      el.selected = false;
      if (el.sign == item.sign) {
        el.selected = true;
      }
      newCurrencyList.push(el);
    });
    this._listCurrencies = newCurrencyList;
  }

}
