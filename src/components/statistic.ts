import { Category, Currency, ExpenseDTO } from "../domain/model";
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styles } from '../styles/shared-styles';
import { getMonthName, getColorClass } from '../utils';

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
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                .statistics-scroll-wrapper {
                    overflow-x: auto;
                    overflow-y: hidden;
                }
                #statistic-card {
                    display: inline-block;
                    min-width: 100%;
                    margin-left: -1em;
                }
                .stat-category {
                    flex-shrink: 0;
                    white-space: normal;
                }
                .stat-list {
                    flex-shrink: 0;
                }
                .stat-list::after {
                    content: ", ";
                }
                .stat-list:last-child::after {
                    content: "";
                }
                .rate-warning {
                    color: var(--sl-color-danger-600, #dc2626);
                    margin-left: 0.15em;
                }
                .details-actions-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .copy-icon-btn {
                    flex-shrink: 0;
                    padding: 0.25rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .copy-icon-btn:hover {
                    opacity: 0.7;
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
    @property()
    categories: Category[] = [];
    @property()
    baseCurrency?: Currency;
    @property()
    ratesMap: Record<string, number> = {};

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

    getCategoryColorClass(category: Category): string {
        let index = this.categories.indexOf(category);
        return getColorClass(index);
    }


    /**
     * Sum all expenses converted to base currency using ratesMap.
     * Rate is stored as 1 base = rate × other, so other -> base = value / rate.
     * Returns { totalInBase, hasMissingRates }.
     */
    getTotalInBase(): { totalInBase: number; hasMissingRates: boolean } {
        let totalInBase = 0;
        let hasMissingRates = false;
        const baseId = this.baseCurrency?.id?.toUpperCase();
        for (const expense of this.expenses) {
            if (expense.category.is_in_summary === false) continue;
            const curId = expense.currency.id?.toUpperCase();
            if (curId === baseId) {
                totalInBase += expense.value;
                continue;
            }
            const rate = this.ratesMap[curId ?? ''];
            if (rate != null && rate > 0) {
                totalInBase += expense.value / rate;
            } else {
                hasMissingRates = true;
            }
        }
        return { totalInBase, hasMissingRates };
    }

    render() {
        const { totalInBase, hasMissingRates } = this.getTotalInBase();
        const baseSign = this.baseCurrency?.sign ?? '$';
        const monthName = this.getCurrentMonthName();

        const statisticForMonth = html`
            <div class="statistics-scroll-wrapper">
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
                            <span class="stat-category">
                            <i class="${this.getCategoryColorClass(stat[0])} ${stat[0].is_removed ? 'removed' :''}">${stat[0].name}</i> :
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
                    <sl-details>
                        <span slot="summary">
                            Expenses for ${monthName}: ${baseSign} ${totalInBase.toFixed(2)}
                            ${hasMissingRates
                                ? html`
                                    <sl-tooltip content="Some of the currency exchange rates are not available">
                                        <span class="rate-warning" aria-label="Some exchange rates missing">!</span>
                                    </sl-tooltip>`
                                : ''}
                        </span>
                        <div class="details-actions-row">
                            <span>
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
                                        Today
                                    </sl-button>
                                    `
                                : ''}
                            </span>
                            <button
                                class="copy-icon-btn"
                                @click=${this.copyToClipbord}
                                aria-label="Copy to clipboard"
                                title="Copy to clipboard"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h3m9 -9v-5a2 2 0 0 0 -2 -2h-2" />
                                    <path d="M13 17v-1a1 1 0 0 1 1 -1h1m3 0h1a1 1 0 0 1 1 1v1m0 3v1a1 1 0 0 1 -1 1h-1m-3 0h-1a1 1 0 0 1 -1 -1v-1" />
                                    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                                </svg>
                            </button>
                        </div>

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
