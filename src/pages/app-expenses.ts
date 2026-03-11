import { LitElement, html, css } from 'lit';
import { customElement, state, property, query} from 'lit/decorators.js';
import { Category, Currency, Expense } from '../domain/model'
import { styles as sharedStyles } from '../styles/shared-styles'
import { initDB } from '../domain/db';
import { CategoryDao } from '../domain/category_dao';
import { CurrencyDao } from '../domain/currency_dao';
import { SettingsDao } from '../domain/settings_dao';
import { ExpenseDao } from '../domain/expense_dao';
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
      .header-wrap {
        margin: 0 2%;
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
  private _categoryDao!: CategoryDao;
  @state()
  private _currencyDao!: CurrencyDao;
  @state()
  private _settingsDao!: SettingsDao;
  @state()
  private _expenseDao!: ExpenseDao;
  @state()
  private hideValue = true;
  @state()
  private disableAddExpense = true;
  @state()
  private hideMessage = true;
  @state()
  private _expenseAddedCount = 0;

  async connectedCallback() {
    super.connectedCallback();
    await initDB();
    this._currencyDao = new CurrencyDao();
    this._categoryDao = new CategoryDao();
    this._settingsDao = new SettingsDao();
    this._expenseDao = new ExpenseDao();
    await this.handleGetCurrencies();
    await this.handleLoadSettings();
    await this.handleGetUsedCurrencies();
    await this.handleGetCategories();
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
    await this._settingsDao.update({last_currency_id: this._currency?.id});
  }

  async addCurrency(e: CustomEvent) {
    const newCurrency = e.detail.currency as Currency;
    try {
      await this.handleGetUsedCurrencies();
      if (!this._visibleCurrencies.some((c) => c.id === newCurrency.id)) {
        this._visibleCurrencies = [...this._visibleCurrencies, newCurrency].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
      }
      this._currency = newCurrency;
      await this._settingsDao.update({ last_currency_id: newCurrency.id });
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage('Added!');
  }

  async addCategory(e: CustomEvent) {
    try {
      await this._categoryDao.add(e.detail.category);
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
      await this._categoryDao.update(e.detail.category);
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

  async removeCategory(e: CustomEvent) {
    try {
      await this._categoryDao.update(e.detail.category);
      this.handleGetCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
      }
    }
    this.displayMessage("Removed!");
  }

  async categoryUpdated(e: CustomEvent) {
    try {
      await this._categoryDao.update(e.detail.category);
      this.handleGetCategories();
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.displayMessage(err.message);
      } else {
        this.displayMessage('Something went wrong');
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
      await this._expenseDao.add(expense);
      this._expenseAddedCount++;
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

  _onAddExpenseKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addExpense();
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

  async showAllCurrencies() {
    this._visibleCurrencies = this._listCurrencies;
  }

  async handleGetCurrencies() {
    this._listCurrencies = await this._currencyDao.getAll();
  }

  async handleGetCategories() {
    this._listCategories = await this._categoryDao.getAll();
  }

  async handleGetUsedCurrencies() {
    this._visibleCurrencies = await this.getUsedCurrencies();
  }

  async getUsedCurrencies() {
    let expenses = await this._expenseDao.getAllInRange(getFirstDayOfMonth(), getLastDayOfMonth());
    let currency_ids = [...new Set(expenses.map(e => e.currency_id))];
    let usedCurrencies = await this._currencyDao.getByIds(currency_ids);
    // add default currency if it's not in the list yet
    if (this._currency && !usedCurrencies.some(c => c.id === this._currency?.id)) {
      usedCurrencies.push(this._currency);
    }
    return usedCurrencies;
  }

  async handleLoadSettings() {
    const settings = await this._settingsDao.getAll();
    if (!settings) {
      await this._settingsDao.add({last_currency_id: this._listCurrencies?.[0]?.id});
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
            @keydown=${this._onAddExpenseKeyDown}
          ></sl-input>
          <br/>
          <sl-button
            variant="success"
            ?disabled=${this.disableAddExpense}
            @click=${this.addExpense}
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
      <div class="header-wrap">
        <app-header ?enableBack="${true}"></app-header>
      </div>
      <sl-divider></sl-divider>
      <main>
        <p class=${this.hideMessage ? "hide": ""}>${this._message}</p>
        <app-category
          class=${this._category ? "hide": ''}
          .categories=${this._listCategories}
          @category-selected="${this.selectCategory}"
          @category-added="${this.addCategory}"
          @category-renamed="${this.renameCategory}"
          @category-remove="${this.removeCategory}"
          @category-updated="${this.categoryUpdated}"
        ></app-category>
        <app-currency
          class=${!this._category ? "hide": ''}
          .currencies=${this._listCurrencies}
          .currency=${this._currency}
          .visibleCurrencies=${this._visibleCurrencies}
          @currency-adding="${this.toggleHideValue}"
          @currency-added="${this.addCurrency}"
          @currency-changed="${this.changeCurrency}"
          @currency-show-all="${this.showAllCurrencies}"
        ></app-currency>
        ${this.hideValue ? "" : addExpenseValue}
        ${this.hideValue ? "" : html`<app-latest-entries .refreshTrigger=${this._expenseAddedCount}></app-latest-entries>`}
      </main>
    `;
  }
}
