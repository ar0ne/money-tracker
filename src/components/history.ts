import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ExpenseDTO } from '../model';
import { styles } from '../styles/shared-styles';
import { Dao, IndexDbDAO } from '../dao';
import { getStatistic, Statistic } from '../components/statistics';

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
    private _selectedDate!: Date;
    @state()
    private _expenses: ExpenseDTO[] = [];
    @state()
    private _statistic?: Statistic;
    @state()
    private _dateChanged: boolean = false;

    constructor() {
        super();
        this._selectedDate = new Date();
    }

    async connectedCallback() {
        super.connectedCallback();
        // todo: load only X last or for this month?
        this._dao = await IndexDbDAO.create();
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
        const from_date = this.getFirstDayOfMonth(this._selectedDate.getFullYear(), this._selectedDate.getMonth());
        const to_date = this.getLastDayOfMonth(this._selectedDate.getFullYear(), this._selectedDate.getMonth());
        let expenses = await this._dao.getAllExpenses(from_date, to_date);
        expenses.sort((a,b) => new Date(a.created).getTime() - new Date(b.created).getTime());
        this._expenses = expenses.reverse();
        this._statistic = getStatistic(this._expenses);
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
        return this._selectedDate.toLocaleString('default', { month: 'long' });
    }

    async previousMonth() {
        this._dateChanged = true;
        let previousMonth = new Date();
        previousMonth.setDate(1);
        previousMonth.setFullYear(this._selectedDate.getFullYear());
        previousMonth.setMonth(this._selectedDate.getMonth() - 1);
        this._selectedDate = previousMonth;
        await this.handleHistory();
    }

    async resetHistory() {
        this._dateChanged = false;
        this._selectedDate = new Date();
        await this.handleHistory();
    }

    render() {
        const statisticForMonth = html`
            <div>
                <sl-menu id="statistic-card">
                    ${!this._statistic?.size
                        ? html`<sl-menu-item>No results</sl-menu-item>`
                        : ''
                    }
                    ${map(this._statistic, (stat) =>
                        html`
                        <sl-menu-item>
                                <span class="stat-category">${stat[0].name}</span> (
                                ${repeat( stat[1], (item) => item[0].id, (item, index) =>
                                    html`
                                        ${!!item[1]
                                            ? html`
                                                <span class="stat-sign">${item[0].sign}</span>
                                                <span class="stat-value">${item[1]}</span>
                                                ${!!item[1] && index + 1 !== stat[1].size ? ';': ''}
                                            `: ''
                                        }
                                    `
                                )}
                            )
                        </sl-menu-item>
                        `
                    )}
                </sl-menu>
            </div>
        `;

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
                <div id="statistics">
                    <sl-details summary="Expenses for ${this.getCurrentMonthName()}">
                        <sl-button @click=${() => this.previousMonth()}>Previous</sl-button>
                        ${this._dateChanged ? html`
                            <sl-button
                                variant="warning" outline
                                @click=${() => this.resetHistory()}
                                >
                                Reset
                            </sl-button>
                        `: ''}
                        ${statisticForMonth}
                    </sl-details>
                </div>
                <div id="history">
                    ${history}
                </div>
            </div>
        `;
    }
}