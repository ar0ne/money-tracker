import {LitElement, css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Category} from "../domain/model"
import {styles} from '../styles/shared-styles';

@customElement('app-category')
class AppCategory extends LitElement {
    static get styles() {
        return [
            styles,
            css`
                .rename-category-item {
                    display: table;
                    width: 100%;
                }
                .rename-category-input {
                    display: table-cell;
                    padding-right: 2%;
                }
                .rename-category-input > sl-input {
                    width: 100%;
                    margin: 2px;
                    padding: 2px;
                    box-sizing: border-box;
                }
            `
        ]
    }

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

    selectCategory(item: Category) {
        this._category = item;
        const options = {
            detail: {category: this._category},
        };
        this.dispatchEvent(new CustomEvent('category-selected', options));
    }

    addCategory() {
        let categoryName = this.inputCategory.value;
        if (!categoryName) {
            return;
        }
        let newCategory = new Category(categoryName);
        this.inputCategory.value = '';
        const options = {
            detail: {category: newCategory},
        };
        this.dispatchEvent(new CustomEvent('category-added', options));
        this.toggleAddCategory();
    }

    renameCategory(category: Category) {
        const input = (this.shadowRoot?.getElementById("renamecategory_" + category.id) as HTMLInputElement);
        let newName = input.value;
        if (!newName) {
            return;
        }
        category.name = newName;
        input.value = '';
        const options = {
            detail: {category: category},
        };
        this.dispatchEvent(new CustomEvent('category-renamed', options));
        this.toggleEditCategory();
    }

    removeCategory(category: Category) {
        category.is_removed = true;
        const options = {
            detail: {category: category},
        };
        this.dispatchEvent(new CustomEvent('category-remove', options));
        this.toggleEditCategory();
    }

    toggleAddCategory() {
        this.hideAddCategory = !this.hideAddCategory;
    }

    toggleEditCategory() {
        this.hideRenameCategory = !this.hideRenameCategory;
    }

    render() {
        const editCategory = html`
            <div class="rename-category-list">
                <h5>Edit category</h5>
                ${map(this.categories, (category) =>
                    html`
                        <div class="rename-category-item">
                            <div class="rename-category-input">
                                <sl-input
                                    id="renamecategory_${category.id}"
                                    value="${category.name}"
                                    type="text"
                                    name="Rename
                                    item"
                                    >
                                </sl-input>
                            </div>
                            <sl-button
                                variant="danger"
                                outline
                                @click=${() => this.renameCategory(category)}
                                >
                                Rename
                            </sl-button>
                            <sl-button
                                variant="warning"
                                outline
                                @click=${() => this.removeCategory(category)}
                                >
                                Delete
                            </sl-button>
                        </div>
                    `
                )}
                </br>
                <sl-button
                    variant="warning"
                    @click=${this.toggleEditCategory}
                    >
                    Cancel
                </sl-button>
            </div>
        `;

        const listCategories = html`
            <div class="list-category">
                ${map(this.categories, (category) =>
                    html`
                        <sl-button
                            class="center"
                            @click=${() => this.selectCategory(category)}
                            >
                            ${category.name}
                        </sl-button>
                        </br>
                    `
                )}
            </div>
        `;

        const addNewCategory = html`
            <div class="add-category">
                <sl-input
                    id="newcategory"
                    label="New category"
                    >
                </sl-input>
                <br/>
                <sl-button
                    variant="success"
                    @click=${this.addCategory}
                    >
                    Add
                </sl-button>
                <sl-button
                    variant="warning"
                    @click=${this.toggleAddCategory}
                    >
                    Cancel
                </sl-button>
            </div>
        `;

        const categorySettings = html`
            <div class="settings-category">
                <sl-button
                    variant="success"
                    @click=${this.toggleAddCategory}
                    >
                    Add
                </sl-button>
                <sl-button
                    variant="warning"
                    @click=${this.toggleEditCategory}
                    >
                    Edit
                </sl-button>
            </div>
        `;

        const setupCategory = this.hideAddCategory
            ? editCategory
            : addNewCategory

        return this.hideAddCategory && this.hideRenameCategory
            ? html`
                ${listCategories}
                ${categorySettings}
            `
            : setupCategory;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "app-category": AppCategory;
    }
}
