import {LitElement, css, html} from 'lit';
import {customElement, state, property, query} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';

export interface Category {
    name: string,
}

@customElement('app-category')
class AppCategory extends LitElement {
    static styles =
    css`

    `

    @state()
    private _category?: Category;

    @property()
    categories: Category[] = [];
    @property()
    hideAddCategory = true;
    @property()
    hideCategories = false;

    @query('#newcategory')
    inputCategory!: HTMLInputElement;

    constructor() {
        super();
    }

    selectCategory(item: Category) {
        // next page
        console.log(item.name);
        this._category = item;
        // this.toggleAddValue();
        // this.toggleDisableAddExpenseValue();
    }

    addCategory() {
        this.categories = [...this.categories,
            {name: this.inputCategory.value}];
        this.inputCategory.value = '';
        this.toggleAddCategory();
    }

    removeCategory() {
        // todo
    }

    toggleAddCategory() {
        this.hideAddCategory = !this.hideAddCategory;
    }

    render() {
        const listCategories = html`
            <ul>
            ${map(this.categories, (item) =>
            html`
                <button
                    @click=${() => this.selectCategory(item)}>
                ${item.name}
                </button>
                </br>
            `
            )}
            </ul>
            <button
                @click=${() => this.toggleAddCategory()}
                >+
            </button>
        `;

        const addNewCategory = html`
            <h2>Add Expense</h2>
            <input id="newcategory" aria-label="New item">
            <button @click=${this.addCategory}>Add</button>
            <button @click=${this.toggleAddCategory}>X</button>
        `;


        const listOrAddCategory = this.hideAddCategory
            ? listCategories
            : addNewCategory;


        return html`
            ${listOrAddCategory}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "app-category": AppCategory;
    }
}