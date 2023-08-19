import { LitElement, html } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency, Expense } from '../../model'
import { styles } from './expense-styles';
import { styles as sharedStyles } from '../../styles/shared-styles'
import { Dao, IndexDbDAO } from '../../dao';

@customElement('app-expense-page')
export class AppExpensePage extends LitElement {
  static styles = [
    sharedStyles,
    styles,
  ]

  private MESSAGE_DURATION: number = 2000;
  @property()
  private _currency?: Currency;
  @property()
  private _category?: Category;
  @query('#newvalue')
  inputValue!: HTMLInputElement;
  @state()
  private _listCategories: Category[] = [];
  @state()
  private _listCurrencies: Currency[] = [];
  @state()
  private _value?: number;
  @state()
  private _message: string = '';
  @state()
  private _dao!: Dao;
  @state()
  private hideValue = true;
  @state()
  private disableAddExpense = true;
  @state()
  private hideMessage = true;

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    this._dao = await IndexDbDAO.create();
    await this.handleGetCurrencies()
    await this.handleGetCategories();
    // todo: save default category into db instead
    this._currency = this._listCurrencies?.[0];
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
      await this._dao.addCurrency(e.detail.currency);
      this.handleGetCurrencies();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage("Added!");
  }

  async addCategory(e: CustomEvent) {
    try {
      await this._dao.addCategory(e.detail.category);
      this.handleGetCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage("Added!");
  }

  async renameCategory(e: CustomEvent) {
    try {
      await this._dao.updateCategory(e.detail.category);
      this.handleGetCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage("Edited!");
  }

  async addExpense() {
    if (!(this._value && this._currency && this._category)) {
      // do nothing
      this.toggleDisableAddExpenseValue();
      return
    }
    let expense = new Expense(this._currency.id, this._value, this._category.id)
    try {
      await this._dao.addExpense(expense);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.inputValue.value = '';
    this.displayMessage('Added!');
  }

  selectCategory(e: CustomEvent) {
    this._category = e.detail.category;
    this.hideValue = !this.hideValue;
  }

  _onExpenseValueChanged(_e: Event) {
    if (this._value !== +this.inputValue.value){
      this._value = +this.inputValue.value;
      this.toggleDisableAddExpenseValue();
    }
  }

  displayMessage(message: string) {
    this._message = message;
    this.hideMessage = false;
    setTimeout(() => {
        this.hideMessage = true;
        this._message = '';
    }, this.MESSAGE_DURATION);
  }

  async handleGetCurrencies() {
    this._listCurrencies = await this._dao.getAllCurrencies();
  }

  async handleGetCategories() {
    // return new Promise<Category[]>((resolve, reject) => resolve(categories));
    this._listCategories = await this._dao.getAllCategories();
  }

  render() {
    const addExpenseValue = html`
      <div>
        <sl-card id="add-expense-card">
          <sl-input id="newvalue"
            label="${this._category?.name}:"
            type="number"
            @keyup=${this._onExpenseValueChanged}
          ></sl-input>
          <br/>
          <sl-button
            variant="success"
            @click=${() => this.addExpense()}
            class=${this.disableAddExpense ? 'disabled': ''}
            >
            Add
          </sl-button>
          <sl-button
            variant="warning"
            @click=${this.cancelAddExpense}
          >Close</sl-button>
        </sl-card>
      </div>
    `;

    const addExpense = this.hideValue
      ? ""
      : addExpenseValue;


    return html`
      <app-header ?enableBack="${true}"></app-header>
      <sl-divider></sl-divider>
      <main>
        <p class=${this.hideMessage ? "hide": ""}>${this._message}</p>
        <app-category
          class=${this._category ? "hide": ''}
          .categories=${this._listCategories}
          @category-selected="${this.selectCategory}"
          @category-added="${this.addCategory}"
          @category-renamed="${this.renameCategory}"
        ></app-category>
        <app-currency
          class=${!this._category ? "hide": ''}
          .currencies=${this._listCurrencies}
          .currency=${this._currency}
          @currency-changed="${this.changeCurrency}"
          @currency-adding="${() => this.hideValue = !this.hideValue}"
          @currency-added="${this.addCurrency}"
        ></app-currency>
        ${addExpense}
      </main>
    `;
  }
}
