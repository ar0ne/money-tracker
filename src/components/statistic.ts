import {Category, Currency} from "../domain/model";
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ExpenseDTO } from '../domain/model';
import { styles } from '../styles/shared-styles';
import { getMonthName } from '../utils';

type Statistic = Map<Category, Map<Currency, number>>;


@customElement('app-statistic')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
class AppStatistic extends LitElement {

    static get styles() {
        return [
            styles,
            css`
                #statistics {
                    width: 90%;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                .stat-category {
                    margin-left: -1em;
                }
                .stat-list {
                    display: inline-block;
                }
                .stat-list::before {
                    content: ", ";
                }
                .stat-list:first-child::before {
                    content: "";
                }
            `
        ]
    }

    @property()
    selectedDate!: Date;
    @property()
    _expenses: ExpenseDTO[] = [];
    get expenses(): ExpenseDTO[] {
        return this._expenses;
    }
    set expenses(value: ExpenseDTO[]) {
        if (value == this._expenses) {
            return
        }
        this._expenses = value;
        this.reloadStatistic();
    }

    @state()
    private _statistic?: Statistic;
    @state()
    private _dateChanged: boolean = false;

    reloadStatistic() {
        this._statistic = this.getStatistic(this.expenses);
    }

    getCurrentMonthName = () => getMonthName(this.selectedDate);

    selectedDateUpdated(newDate: Date) {
        const options = {
            detail: {selectedDate: newDate},
        };
        this.dispatchEvent(new CustomEvent('date-changed', options));
    }

    previousMonth() {
        this._dateChanged = true;
        let previousMonth = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() - 1);
        this.selectedDateUpdated(previousMonth);
    }

    resetStatistic() {
        this._dateChanged = false;
        this.selectedDateUpdated(new Date());
    }

    copyToClipbord() {
        if (!this._statistic?.size) {
            return
        }
        let json = new Map<string, Array<string>>();
        this._statistic.forEach((v, k) => {
            var cur = new Array<string>();
            v.forEach((value, key) => {
                if (value) {
                    cur.push(key.sign + " " + value.toFixed(2));
                }
            });
            json.set(k.name, cur);
        });
        var jsonString = JSON.stringify(Object.fromEntries(json));
        navigator.clipboard.writeText(jsonString);
    }

    getStatistic(expenses: ExpenseDTO[]) {
        // show statistics only for used currencies and categories
        const currencies = [...new Set(expenses.map(item => item.currency))].sort((a, b) => a.name.localeCompare(b.name));
        const categories = [...new Set(expenses.map(item => item.category))].sort((a, b) => a.name.localeCompare(b.name));
        // init statistic
        let statistic: Statistic = new Map(
            categories.map(cat => [cat, new Map(currencies.map(cur => [cur, 0]))])
        );
        expenses.forEach(expense => {
            const category = expense.category;
            const currency = expense.currency;
            const oldValue = statistic.get(category)?.get(currency) || 0;
            statistic.get(category)?.set(currency, oldValue + expense.value);
        });
        return statistic;
    }

    render() {
        const statisticForMonth = html`
            <div>
                <sl-menu
                    id="statistic-card"
                    >
                    ${!this._statistic?.size
                        ? html`<sl-menu-item>No results</sl-menu-item>`
                        : ''
                    }
                    ${map(this._statistic, (stat) =>
                        html`
                        <sl-menu-item>
                            <span class="stat-category">${stat[0].name} [
                            ${repeat( stat[1], (item) => item[0].id, (item, _) =>
                                html`
                                    ${item[1]
                                        ? html`
                                        <span class="stat-list">
                                            ${item[0].sign}
                                            ${item[1].toFixed(2)}
                                        </span>
                                        `: ''
                                    }
                                `
                            )}
                            ]${stat[0].is_removed ? "(removed)" : ''}
                            </span>
                        </sl-menu-item>
                        `
                    )}
                </sl-menu>
            </div>
        `;

        return html`
            <div class="container">
                <div id="statistics">
                    <sl-details
                        summary="Expenses for ${this.getCurrentMonthName()}"
                        >
                        <sl-button
                            @click=${this.previousMonth}
                            >
                            Previous
                        </sl-button>
                        ${this._dateChanged ?
                            html`
                            <sl-button
                                variant="warning"
                                outline
                                @click=${this.resetStatistic}
                                >
                                Reset
                            </sl-button>
                            `
                        : ''}
                        <sl-button
                            variant="default"
                            outline
                            @click=${this.copyToClipbord}
                            >
                            Copy to clipboard
                        </sl-button>

                        ${statisticForMonth}
                    </sl-details>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "app-statistic": AppStatistic;
    }
}
