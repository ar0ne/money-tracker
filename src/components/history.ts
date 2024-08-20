import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { ExpenseDTO, Category } from '../domain/model';
import { styles } from '../styles/shared-styles';
import { initDB } from '../domain/db';
import { ExpenseDao } from '../domain/expense_dao';
import { CategoryDao } from '../domain/category_dao';
import { CurrencyDao } from '../domain/currency_dao';
import { formatDateTime, getFirstDayOfMonth, getLastDayOfMonth, getMonthName } from '../utils';

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
                padding: 1em;
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
    private _categoryDao!: CategoryDao
    @state()
    private _expenses: ExpenseDTO[] = [];
    @state()
    private _categories: Category[] = [];
    @state()
    private _currentDate!: Date;  // 1st day of current month

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
        await this.handleHistory();
    }

    async dateChanged(e: CustomEvent) {
        this._currentDate = e.detail.selectedDate;
        await this.handleHistory();
    }

    async handleHistory() {
        const from_date = getFirstDayOfMonth(this._currentDate.getFullYear(), this._currentDate.getMonth());
        const to_date = getLastDayOfMonth(this._currentDate.getFullYear(), this._currentDate.getMonth());
        let expenses = await this._expenseDao.getAllInRange(from_date, to_date);
        if (!expenses) {
            return []
        }
        this._categories = await this._categoryDao.getAll(true);
        const currencies = await this._currencyDao.getAll();
        const categoryMap: Map<string, Category> = new Map(
            this._categories.map(obj => [obj.id, obj])
        );
        const currencyMap: Map<string, Currency> = new Map(
            currencies.map(obj => [obj.id, obj])
        );
        let results = expenses.map(item => {
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

    async removeRecord(expense: ExpenseDTO) {
        await this._expenseDao.remove(expense.id);
        await this.handleHistory();
    }

    getCurrentMonthName = () => getMonthName(this._currentDate);

    getCategoryColor = (category: Category) => {
        const pattern = "color-";
        let index = this._categories.indexOf(category);
        if (index == -1) {
            index = 0;
        } else if (this._categories.length > 10) {
            index %= 10;
        }
        return pattern + index;
    }

    render() {
        const listExpenses = html`
            <ul>
            ${map(this._expenses, (expense) =>
                html`
                    <li>
                        <div class="expense-list-item clearfix">
                            <sl-button class="btn-remove" title="Delete" @click=${() => this.removeRecord(expense)}>X</sl-button>
                            <i class="${this.getCategoryColor(expense.category)}">[${expense.category.name}]${expense.category.is_removed ? " [removed]": ""}</i>
                            <p>
                            ${formatDateTime(expense.created)} 
                            </p>
                            ${expense.currency.sign} ${expense.value}
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
                <app-statistic
                    .selectedDate=${this._currentDate}
                    .expenses=${this._expenses}
                    @date-changed=${this.dateChanged}
                ></app-statistic>
                <div id="history">
                    ${history}
                </div>
            </div>
        `;
    }
}
