import {LitElement, css, html} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Expense} from '../model';
import {expenses} from '../data';

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
        // todo: load only X last or for this month?
        this._expenses = await this.getExpenses();
    }


    private getExpenses() {
        return new Promise<Expense[]>((resolve, reject) => resolve(expenses));
      }

    render() {
        return html`
            <h4>History</h4>
            <ul>
            ${map(this._expenses, (item) =>
                html`
                    <li>
                    ${item.currency.sign} ${item.value} (${item.category.name})
                    </li>
                `
            )}
            </ul>
        `;
    }
}