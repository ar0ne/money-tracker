import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ExpenseDTO } from '../model';
import { Dao, IndexDbDAO } from '../dao';

import { getStatistic, Statistic } from '../components/statistics';

@customElement('app-history')
class AppHistory extends LitElement {
    static styles =
    css``

    @state()
    private _dao!: Dao;
    @state()
    private _today?: Date;
    @state()
    private _expenses: ExpenseDTO[] = [];
    @state()
    private _statistic?: Statistic;

    constructor() {
        super();
        this._today = new Date();
    }

    async connectedCallback() {
        super.connectedCallback();
        // todo: load only X last or for this month?
        this._dao = await IndexDbDAO.create();
        await this.handleHistory();
    }

    async handleHistory() {
        let expenses = await this._dao.getAllExpenses();
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

    render() {

        const statistic = html`
            ${map(this._statistic, (stat) =>
                html`
                    <div>
                        <span class="stat-category">${stat[0].name}</span> (
                        ${repeat( stat[1], (item) => item[0].id, (item, index) =>
                            html`
                                <span class="stat-sign">${item[0].sign}</span>
                                <span class="stat-value">${item[1]}</span>
                                ${index + 1 !== stat[1].size ? '/': ''}
                            `
                        )}
                    )</div>
                `
            )}
        `;

        const showStatistic = this._statistic
            ? statistic
            : '<p>No statistics.</p>';

        const listExpenses = html`
            <ul>
            ${map(this._expenses, (item) =>
                html`
                    <li>
                    ${item.currency.sign} ${item.value} (${item.category.name})
                    ${this.formatDateTime(item.created)}
                    <button @click=${() => this.removeRecord(item)}>X</button>
                    </li>
                `
            )}
            </ul>
        `;

        const history = this._expenses?.length
            ? listExpenses
            : html`<p>No records yet.</p>`;

        return html`
            <h4>History</h4>
            ${showStatistic}
            ${history}
        `;
    }
}