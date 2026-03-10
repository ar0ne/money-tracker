import { LitElement, css, html } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { ExpenseDTO, Category, Currency } from '../domain/model';
import { Expense } from '../domain/model';
import { styles as sharedStyles } from '../styles/shared-styles';
import { initDB } from '../domain/db';
import { ExpenseDao } from '../domain/expense_dao';
import { CategoryDao } from '../domain/category_dao';
import { CurrencyDao } from '../domain/currency_dao';
import { formatDateTime, getFirstDayOfMonth, getColorClass } from '../utils';

export function getLatestExpenses(expenses: ExpenseDTO[], limit: number): ExpenseDTO[] {
  if (!expenses.length) return [];
  return [...expenses]
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
}

@customElement('app-latest-entries')
export class AppLatestEntries extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .latest-entries-card {
        width: 100%;
        padding-top: 1em;
      }
      ul {
        list-style-type: none;
        padding-inline-start: 1%;
        padding-inline-end: 1%;
      }
      .expense-list-item {
        margin: auto;
        border: 1px solid grey;
        padding: 1em;
      }
    `,
  ]

  @property({ type: Number })
  refreshTrigger = 0;

  @state()
  private _latestExpenses: ExpenseDTO[] = [];
  @state()
  private _expenseDao!: ExpenseDao;
  @state()
  private _categoryDao!: CategoryDao;
  @state()
  private _currencyDao!: CurrencyDao;
  @state()
  private _categories: Category[] = [];

  async connectedCallback() {
    super.connectedCallback();
    await initDB();
    this._expenseDao = new ExpenseDao();
    this._categoryDao = new CategoryDao();
    this._currencyDao = new CurrencyDao();
    await this.loadLatestEntries();
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated?.(changedProperties);
    if (changedProperties.has('refreshTrigger') && this._expenseDao) {
      this.loadLatestEntries();
    }
  }

  async loadLatestEntries() {
    const now = new Date();
    const from = getFirstDayOfMonth(now.getFullYear(), now.getMonth());
    const to = now;
    const expenses = await this._expenseDao.getAllInRange(from, to);
    if (!expenses?.length) {
      this._latestExpenses = [];
      return;
    }
    this._categories = await this._categoryDao.getAll(true);
    const currencies = await this._currencyDao.getAll();
    const categoryMap = new Map(this._categories.map((c) => [c.id, c]));
    const currencyMap = new Map(currencies.map((c) => [c.id, c]));
    const dtos: ExpenseDTO[] = expenses.map((item: Expense) => ({
      id: item.id,
      created: item.created,
      currency: currencyMap.get(item.currency_id) as Currency,
      value: item.value,
      category: categoryMap.get(item.category_id) as Category,
    }));
    this._latestExpenses = getLatestExpenses(dtos, 3);
  }

  getCategoryColor(category: Category): string {
    const index = this._categories.indexOf(category);
    return getColorClass(index);
  }

  render() {
    if (this._latestExpenses.length === 0) {
      return html``;
    }
    return html`
      <sl-card class="latest-entries-card">
        <h3 slot="header">Latest</h3>
        <ul>
          ${map(
            this._latestExpenses,
            (expense) => html`
              <li>
                <div class="expense-list-item">
                  <i class="${this.getCategoryColor(expense.category)} ${expense.category.is_removed ? 'removed' : ''}"
                    >${expense.category.name}</i
                  >
                  <p>${formatDateTime(expense.created)}</p>
                  ${expense.currency.sign} ${expense.value}
                </div>
              </li>
            `
          )}
        </ul>
      </sl-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-latest-entries': AppLatestEntries;
  }
}
