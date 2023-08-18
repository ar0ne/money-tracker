import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { ExpenseDTO } from '../model';
import { Dao, IndexDbDAO } from '../dao';

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
            ${history}
        `;
    }
}