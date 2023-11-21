import { LitElement, html, css } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency, Expense } from '../domain/model'
import { styles as sharedStyles } from '../styles/shared-styles'
import { Dao, IndexDbDAO } from '../domain/dao';
import { getFirstDayOfMonth, getLastDayOfMonth } from '../utils';

@customElement('app-expenses')
export class AppExpensePage extends LitElement {
  static styles = [
    sharedStyles,
    css`
      #add-expense-card {
        width: 100%;
        padding-top: 1em;
      }
    `,
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
  private _visibleCurrencies: Currency[] = [];
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

  async connectedCallback() {
    super.connectedCallback();
    this._dao = await IndexDbDAO.create();
    await this.handleGetCurrencies()
    await this.handleGetCategories();
    await this.handleLoadSettings();
    await this.handleGetUsedCurrencies();
  }

  toggleDisableAddExpenseValue() {
    this.disableAddExpense = !(this._value && this._currency && this._category);
  }

  toggleHideValue() {
    this.hideValue = !this.hideValue;
  }

  cancelAddExpense() {
    this._value = this._category = undefined;
    this.inputValue.value = '';
    this.toggleHideValue();
  }

  async changeCurrency(e: CustomEvent) {
    this._currency = e.detail.currency;
    await this._dao.updateSettings({last_currency_id: this._currency?.id});
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

  async editCurrency(e: CustomEvent) {
    try {
      await this._dao.updateCurrency(e.detail.currency);
      this.handleGetCurrencies();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage("Saved!");
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
    this.toggleHideValue();
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

  showAllCurrencies() {
    this._visibleCurrencies = this._listCurrencies;
  }

  async handleGetCurrencies() {
    this._listCurrencies = await this._dao.getAllCurrencies();
  }

  async handleGetCategories() {
    this._listCategories = await this._dao.getAllCategories();
  }

  async handleGetUsedCurrencies() {
    let usedCurrencies = await this._dao.getUsedCurrencies(getFirstDayOfMonth(), getLastDayOfMonth());
    // add default currency if it's not in the list yet
    if (this._currency && !usedCurrencies.some(c => c.id === this._currency?.id)) {
      usedCurrencies.push(this._currency);
    }
    this._visibleCurrencies = usedCurrencies;
  }

  async handleLoadSettings() {
    const settings = await this._dao.getSettings();
    if (!settings) {
      await this._dao.addSettings({last_currency_id: this._listCurrencies?.[0]?.id});
    }
    this._currency = this._listCurrencies?.filter((cur) => cur.id == settings?.last_currency_id)[0];
  }

  render() {
    const addExpenseValue = html`
      <div>
        <sl-card id="add-expense-card">
          <sl-input id="newvalue"
            label="Category: ${this._category?.name}"
            type="number"
            @keyup=${this._onExpenseValueChanged}
          ></sl-input>
          <br/>
          <sl-button
            variant="success"
            @click=${this.addExpense}
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
          .visibleCurrencies=${this._visibleCurrencies}
          @currency-adding="${this.toggleHideValue}"
          @currency-added="${this.addCurrency}"
          @currency-changed="${this.changeCurrency}"
          @currency-edited="${this.editCurrency}"
          @currency-show-all="${this.showAllCurrencies}"
        ></app-currency>
        ${this.hideValue ? "" : addExpenseValue}
      </main>
    `;
  }
}
