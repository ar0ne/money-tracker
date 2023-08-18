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
    @property()
    hideRenameCategory = true;

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
        let newCategory = new Category(this.inputCategory.value);
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

    renameCategory(category: Category) {
        const input = (this.shadowRoot?.getElementById("renamecategory_" + category.id) as HTMLInputElement);
        category.name = input.value;
        input.value = '';
        const options = {
            detail: {category: category},
        };
        this.dispatchEvent(new CustomEvent('category-renamed', options));
        this.toggleRenameCategory();
    }

    toggleAddCategory() {
        this.hideAddCategory = !this.hideAddCategory;
    }

    toggleRenameCategory() {
        this.hideRenameCategory = !this.hideRenameCategory;
    }

    render() {

        const renameCategory = html`
            <div class="rename-category">
                <h5>Rename category</h5>
                <ul>
                ${map(this.categories, (category) =>
                    html`
                    <li>
                        <input id="renamecategory_${category.id}" value="${category.name}" type="text" name="Rename item">
                        <button @click=${() => this.renameCategory(category)}>Rename</button>
                    </li>
                    `
                )}
                </ul>
                <button @click=${this.toggleAddCategory}>Cancel</button>
            </div>
        `;

        const listCategories = html`
            <div class="list-category">
                <ul>
                ${map(this.categories, (category) =>
                    html`
                        <button
                            @click=${() => this.selectCategory(category)}>
                        ${category.name}
                        </button>
                        </br>
                    `
                )}
                </ul>
            </div>
        `;

        const addNewCategory = html`
            <div class="add-category">
                <h5>New category</h5>
                <input id="newcategory" aria-label="New item">
                <button @click=${this.addCategory}>Add</button>
                <button @click=${this.toggleAddCategory}>X</button>
            </div>
        `;

        const categorySettings = html`
            <div class="settings-category">
                <button
                    @click=${() => this.toggleAddCategory()}
                    >+
                </button>
                <button
                    @click=${() => this.toggleRenameCategory()}
                    >Rename
                </button>
            </div>
        `;

        const setupCategory = this.hideAddCategory
            ? renameCategory
            : addNewCategory

        const listOrSetupCategory = this.hideAddCategory && this.hideRenameCategory
            ? html`${listCategories} ${categorySettings}`
            : setupCategory;

        return html`
            ${listOrSetupCategory}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "app-category": AppCategory;
    }
}
