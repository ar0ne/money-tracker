import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';

import { styles } from './expense-styles';

import { styles as sharedStyles } from '../../styles/shared-styles'

import '@shoelace-style/shoelace/dist/components/card/card.js';

@customElement('app-expense')
export class AppExpense extends LitElement {
  static styles = [
    sharedStyles,
    styles
  ]

  @state()
  private _listCategories = [
    { text: 'Services' },
    { text: 'Enterprise' },
    { text: 'Alcohol' },
    { text: 'Groceries' },
    { text: 'Trips' },
  ];

  constructor() {
    super();
  }

  @query('#newcategory')
  input!: HTMLInputElement;

  @property()
  hideAddCategory = true;

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

    const listOrAdd = this.hideAddCategory
        ? categories
        : addnewcategory;

    return html`
      <app-header ?enableBack="${true}"></app-header>

      <main>
        ${listOrAdd}
      </main>
    `;
  }

  selectCategory(item) {
    // next page
    console.log(item.text);
  }

  addCategory() {
    this._listCategories = [...this._listCategories,
      {text: this.input.value}];
    this.input.value = '';
    this.toggleAddCategory();
  }

  toggleAddCategory() {
    this.hideAddCategory = !this.hideAddCategory;
  }

}
