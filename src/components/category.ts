import {LitElement, css, html} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {Category} from "../domain/model"
import {styles} from '../styles/shared-styles';
import {getColorClass} from '../utils';

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
                .list-category {
                    margin: 2%;
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
    /** Category pending deletion - when set, shows confirmation dialog. */
    @state()
    private _categoryToRemove: Category | null = null;
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

    /** Opens confirmation dialog before deleting category. */
    openDeleteConfirm(category: Category) {
        this._categoryToRemove = category;
    }

    /** Cancels delete - closes dialog without removing. */
    cancelDelete() {
        this._categoryToRemove = null;
    }

    /** Confirms delete - removes category and closes dialog. */
    confirmDelete() {
        if (!this._categoryToRemove) return;
        this._categoryToRemove.is_removed = true;
        const options = {
            detail: {category: this._categoryToRemove},
        };
        this.dispatchEvent(new CustomEvent('category-remove', options));
        this._categoryToRemove = null;
        this.toggleEditCategory();
    }

    toggleInSummary(category: Category) {
        category.is_in_summary = !(category.is_in_summary !== false);
        this.dispatchEvent(new CustomEvent('category-updated', { detail: { category } }));
    }

    toggleAddCategory() {
        this.hideAddCategory = !this.hideAddCategory;
    }

    toggleEditCategory() {
        this.hideRenameCategory = !this.hideRenameCategory;
    }

    getCategoryColorClass(category: Category): string {
        let index = this.categories.indexOf(category);
        return getColorClass(index);
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
                            <sl-checkbox
                                ?checked=${category.is_in_summary !== false}
                                @sl-change=${() => this.toggleInSummary(category)}
                                title="Include in summary"
                            >In summary</sl-checkbox>
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
                                @click=${() => this.openDeleteConfirm(category)}
                                >
                                Delete
                            </sl-button>
                        </div>
                    `
                )}
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
                            <span class="${this.getCategoryColorClass(category)}">
                            ${category.name}
                            </span>
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

        return html`
            <sl-dialog
                label="Delete category"
                ?open=${!!this._categoryToRemove}
                @sl-after-hide=${() => this.cancelDelete()}
            >
                ${this._categoryToRemove
                    ? html`Are you sure you want to delete "${this._categoryToRemove.name}"?`
                    : ''}
                <sl-button slot="footer" variant="danger" @click=${() => this.confirmDelete()}>
                    Delete
                </sl-button>
                <sl-button slot="footer" @click=${() => this.cancelDelete()}>
                    Cancel
                </sl-button>
            </sl-dialog>
            ${this.hideAddCategory && this.hideRenameCategory
                ? html`
                    ${listCategories}
                    ${categorySettings}
                `
                : setupCategory}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "app-category": AppCategory;
    }
}
