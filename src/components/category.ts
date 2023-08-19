import {LitElement, css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Category} from "../model"

@customElement('app-category')
class AppCategory extends LitElement {
    static styles =
    css``

    @property()
    categories: Category[] = [];
    @state()
    private _category?: Category;
    @state()
    hideAddCategory = true;
    @state()
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
                        <sl-input id="renamecategory_${category.id}" value="${category.name}" type="text" name="Rename item"></sl-input>
                        <sl-button @click=${() => this.renameCategory(category)}>Rename</sl-button>
                    </li>
                    `
                )}
                </ul>
                <sl-button @click=${this.toggleAddCategory}>Cancel</sl-button>
            </div>
        `;

        const listCategories = html`
            <div class="list-category">
                <ul>
                ${map(this.categories, (category) =>
                    html`
                        <sl-button
                            @click=${() => this.selectCategory(category)}>
                        ${category.name}
                        </sl-button>
                        </br>
                    `
                )}
                </ul>
            </div>
        `;

        const addNewCategory = html`
            <div class="add-category">
                <h5>New category</h5>
                <sl-input id="newcategory" label="New item">
                <sl-button @click=${this.addCategory}>Add</sl-button>
                <sl-button @click=${this.toggleAddCategory}>X</sl-button>
            </div>
        `;

        const categorySettings = html`
            <div class="settings-category">
                <sl-button
                    @click=${() => this.toggleAddCategory()}
                    >+
                </sl-button>
                <sl-button
                    @click=${() => this.toggleRenameCategory()}
                    >Rename
                </sl-button>
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
