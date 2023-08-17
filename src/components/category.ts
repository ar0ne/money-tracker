import {LitElement, css, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Category} from "../model"

@customElement('app-category')
class AppCategory extends LitElement {
    static styles =
    css``

    @property()
    private _category?: Category;

    @property()
    categories: Category[] = [];
    @property()
    hideAddCategory = true;

    @query('#newcategory')
    inputCategory!: HTMLInputElement;

    constructor() {
        super();
    }

    selectCategory(item: Category) {
        this._category = item;
        const options = {
            detail: {category: this._category},
        };
        this.dispatchEvent(new CustomEvent('category-selected', options));
    }

    addCategory() {
        let newCategory = {name: this.inputCategory.value};
        this.inputCategory.value = '';
        const options = {
            detail: {category: newCategory},
        };
        this.dispatchEvent(new CustomEvent('category-added', options));
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
            <h5>New category</h5>
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
