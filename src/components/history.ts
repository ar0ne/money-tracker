import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Expense} from '../model';
import { initDB, getStoreData, Stores } from '../db';

@customElement('app-history')
class AppHistory extends LitElement {
    static styles =
    css``


    @state()
    private _expenses: Expense[] = [];

    constructor() {
        super();
    }

    async connectedCallback() {
        super.connectedCallback();
        await initDB();

        // todo: load only X last or for this month?
        this._expenses = await getStoreData<Expense>(Stores.Expenses);
    }

    render() {
        const listExpenses = html`
            <ul>
            ${map(this._expenses, (item) =>
                html`
                    <li>
                    ${item.currency.sign} ${item.value} (${item.category.name})
                    ${item.getTimestamp()}
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