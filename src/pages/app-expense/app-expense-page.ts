import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency, Expense } from '../../model'
import { styles } from './expense-styles';
import { styles as sharedStyles } from '../../styles/shared-styles'
import { dao } from '../../dao';

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
  @state()
  private _message: string = '';

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
    await this.handleGetCurrencies()
    await this.handleGetCategories();
    // todo: save default category into db
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

  async addCurrency(e: CustomEvent) {
    try {
      await dao.addCurrency(e.detail.currency);
      this.handleGetCurrencies();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this._message = err.message;
      } else {
        this._message = 'Something went wrong';
      }
    }
  }

  async addCategory(e: CustomEvent) {
    try {
      await dao.addCategory(e.detail.category);
      this.handleGetCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this._message = err.message;
      } else {
        this._message = 'Something went wrong';
      }
    }
  }

  async addExpense() {
    if (!(this._value && this._currency && this._category)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    let expense = new Expense(this._currency.id, this._value, this._category.id)
    try {
      await dao.addExpense(expense);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this._message = err.message;
      } else {
        this._message = 'Something went wrong';
      }
    }
    this.inputValue.value = '';
    this._message = 'Added!';
    this.displayMessage();
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

  displayMessage() {
    this.hideMessage = false;
    setTimeout(() => {
        this.hideMessage = true;
        this._message = '';
    }, 2000);
  }

  async handleGetCurrencies() {
    this._listCurrencies = await dao.getAllCurrencies();
  }

  async handleGetCategories() {
    // return new Promise<Category[]>((resolve, reject) => resolve(categories));
    this._listCategories = await dao.getAllCategories();
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
        @click=${() => this.addExpense()}
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
        <p class=${this.hideMessage ? "hide": ""}>${this._message}</p>
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
