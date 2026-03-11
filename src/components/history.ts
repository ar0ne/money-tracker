import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { ExpenseDTO, Category, Currency } from '../domain/model';
import { styles } from '../styles/shared-styles';
import { initDB } from '../domain/db';
import { ExpenseDao } from '../domain/expense_dao';
import { CategoryDao } from '../domain/category_dao';
import { CurrencyDao } from '../domain/currency_dao';
import { SettingsDao } from '../domain/settings_dao';
import { ExchangeRateDao } from '../domain/exchange_rate_dao';
import { formatDateTime, getFirstDayOfMonth, getLastDayOfMonth, getMonthName, getColorClass } from '../utils';

@customElement('app-history')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class AppHistory extends LitElement {

    static get styles() {
        return [
          styles,
          css`
            ul {
                list-style-type: none;
                padding-inline-start: 1%;
                padding-inline-end: 1%;
            }
            .expense-list-item {
                margin: auto;
                border: 1px solid grey;
                padding: 0.5em;
            }
            .category {
                font-size: 1.2em;
            }
            .expense-value {
                margin: 1em 0 0 0;
            }
            .clearfix::after {
                content: "";
                clear: both;
                display: table;
            }
            .btn-remove {
                float: right;
                padding: 1em;
            }
            .expense-row {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 0.5em;
            }
            .datetime {
                flex-shrink: 0;
                font-variant-numeric: tabular-nums;
            }
            #statistics,#history p {
                width: 90%;
                display: block;
                margin-left: auto;
                margin-right: auto;
            }
        `
        ]
    }

    @state()
    private _expenseDao!: ExpenseDao;
    @state()
    private _currencyDao!: CurrencyDao;
    @state()
    private _categoryDao!: CategoryDao;
    @state()
    private _settingsDao!: SettingsDao;
    @state()
    private _exchangeRateDao!: ExchangeRateDao;
    @state()
    private _expenses: ExpenseDTO[] = [];
    @state()
    private _categories: Category[] = [];
    @state()
    private _currentDate!: Date;  // 1st day of current month
    @state()
    private _baseCurrency: Currency | undefined = undefined;
    @state()
    private _ratesMap: Record<string, number> = {};

    @state()
    private _expenseToRemove: ExpenseDTO | null = null;

    /** Increment to force reload (e.g. after import). */
    @property({ type: Number })
    refreshTrigger = 0;

    constructor() {
        super();
        const now = new Date();
        this._currentDate = getFirstDayOfMonth(now.getFullYear(), now.getMonth());
    }

    async connectedCallback() {
        super.connectedCallback();
        // todo: load only X last or for this month?
        await initDB();
        this._expenseDao = new ExpenseDao();
        this._categoryDao = new CategoryDao();
        this._currencyDao = new CurrencyDao();
        this._settingsDao = new SettingsDao();
        this._exchangeRateDao = new ExchangeRateDao();
        await this.handleHistory();
    }

    updated(changedProperties: Map<string, unknown>) {
        super.updated?.(changedProperties);
        if (changedProperties.has('refreshTrigger') && this._expenseDao) {
            this.handleHistory();
        }
    }

    async dateChanged(e: CustomEvent) {
        this._currentDate = e.detail.selectedDate;
        await this.handleHistory();
    }

    async categoryIncludeToggled(e: CustomEvent<{ category: Category }>) {
        await this._categoryDao.update(e.detail.category);
        this._categories = [...this._categories];
    }

    async handleHistory() {
        const from_date = getFirstDayOfMonth(this._currentDate.getFullYear(), this._currentDate.getMonth());
        const to_date = getLastDayOfMonth(this._currentDate.getFullYear(), this._currentDate.getMonth());
        const expenses = await this._expenseDao.getAllInRange(from_date, to_date);
        if (!expenses) {
            return;
        }
        this._categories = await this._categoryDao.getAll(true);
        const currencies = await this._currencyDao.getAll();
        const categoryMap: Map<string, Category> = new Map(
            this._categories.map(obj => [obj.id, obj])
        );
        const currencyMap: Map<string, Currency> = new Map(
            currencies.map(obj => [obj.id, obj])
        );
        // Load settings and exchange rates for statistic header (converted sum in base currency)
        const settings = await this._settingsDao.getAll();
        const baseCurrencyId = (settings?.default_currency_id ?? 'USD').toUpperCase();
        const rates = await this._exchangeRateDao.getAll(baseCurrencyId);
        this._baseCurrency = currencyMap.get(baseCurrencyId);
        this._ratesMap = Object.fromEntries(rates.map((r) => [r.to_currency_id.toUpperCase(), r.rate]));

        const results = expenses.map(item => {
            return {
                id: item.id,
                created: item.created,
                currency: currencyMap.get(item.currency_id) as Currency,
                value: item.value,
                category: categoryMap.get(item.category_id) as Category,
            }
        });
        this._expenses = results.reverse();
    }

    openRemoveConfirm(expense: ExpenseDTO) {
        this._expenseToRemove = expense;
    }

    cancelRemove() {
        this._expenseToRemove = null;
    }

    async confirmRemove() {
        if (!this._expenseToRemove) return;
        await this._expenseDao.remove(this._expenseToRemove.id);
        this._expenseToRemove = null;
        await this.handleHistory();
    }

    getCurrentMonthName = () => getMonthName(this._currentDate);

    getCategoryColor = (category: Category): String => {
        let index = this._categories.indexOf(category);
        return getColorClass(index);
    }

    render() {
        const listExpenses = html`
            <ul>
            ${map(this._expenses, (expense) =>
                html`
                    <li>
                        <div class="expense-list-item clearfix">
                            <sl-button class="btn-remove" title="Delete" @click=${() => this.openRemoveConfirm(expense)}>X</sl-button>
                            <div class="expense-row">
                                <i class="category ${this.getCategoryColor(expense.category)} ${expense.category.is_removed ? 'removed' : ''}">${expense.category.name}</i>
                                <span class="datetime">${formatDateTime(expense.created)}</span>
                            </div>
                            <div class="expense-value">
                                ${expense.currency.sign} ${expense.value}
                            </div>
                        </div>
                    </li>
                `
            )}
            </ul>
        `;

        const history = this._expenses?.length
            ? listExpenses
            : html`<p>No records yet.</p>`;

        return html`
            <div class="container">
                <sl-dialog
                    label="Remove expense"
                    ?open=${!!this._expenseToRemove}
                    @sl-after-hide=${() => this.cancelRemove()}
                >
                    ${this._expenseToRemove
                        ? html`Are you sure you want to remove ${this._expenseToRemove.currency.sign} ${this._expenseToRemove.value} (${this._expenseToRemove.category.name})?`
                        : ''}
                    <sl-button slot="footer" variant="primary" @click=${() => this.confirmRemove()}>
                        Remove
                    </sl-button>
                    <sl-button slot="footer" @click=${() => this.cancelRemove()}>
                        Cancel
                    </sl-button>
                </sl-dialog>
                <app-statistic
                    .selectedDate=${this._currentDate}
                    .expenses=${this._expenses}
                    .categories=${this._categories}
                    .baseCurrency=${this._baseCurrency}
                    .ratesMap=${this._ratesMap}
                    @date-changed=${this.dateChanged}
                    @category-include-toggled=${this.categoryIncludeToggled}
                ></app-statistic>
                <div id="history">
                    ${history}
                </div>
            </div>
        `;
    }
}
