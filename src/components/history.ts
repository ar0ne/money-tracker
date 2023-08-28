import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { ExpenseDTO } from '../model';
import { styles } from '../styles/shared-styles';
import { Dao, IndexDbDAO } from '../dao';

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
                border: 3px solid grey;
                padding: 10px;
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
    private _dao!: Dao;
    @state()
    private _expenses: ExpenseDTO[] = [];
    @state()
    private _currentDate!: Date;  // 1st day of current month

    constructor() {
        super();
        const now = new Date();
        this._currentDate = this.getFirstDayOfMonth(now.getFullYear(), now.getMonth());
    }

    async connectedCallback() {
        super.connectedCallback();
        // todo: load only X last or for this month?
        this._dao = await IndexDbDAO.create();
        await this.handleHistory();
    }

    async dateChanged(e: CustomEvent) {
        this._currentDate = e.detail.selectedDate;
        await this.handleHistory();
    }

    getFirstDayOfMonth(year: number, month: number) {
        return new Date(year, month, 1);
    }

    getLastDayOfMonth(year: number, month: number) {
        // last minute of the month
        return new Date(new Date(year, month + 1, 0).getTime() - 1);
    }

    async handleHistory() {
        const from_date = this._currentDate;
        const to_date = this.getLastDayOfMonth(this._currentDate.getFullYear(), this._currentDate.getMonth());
        let expenses = await this._dao.getAllExpenses(from_date, to_date);
        this._expenses = expenses.reverse();
    }

    public formatDateTime(timestamp: number) {
        let date = new Date();
        date.setTime(timestamp);
        return date.toLocaleDateString('en-GB');
    }

    async removeRecord(expense: ExpenseDTO) {
        await this._dao.removeExpense(expense.id);
        await this.handleHistory();
    }

    getCurrentMonthName() {
        return this._currentDate.toLocaleString('default', { month: 'long' });
    }

    render() {
        const listExpenses = html`
            <ul>
            ${map(this._expenses, (item) =>
                html`
                    <li>
                        <div class="expense-list-item clearfix">
                            <sl-button class="btn-remove" @click=${() => this.removeRecord(item)}>X</sl-button>
                            <p>${this.formatDateTime(item.created)} <i>(${item.category.name})</i></p>
                            ${item.currency.sign} ${item.value}
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