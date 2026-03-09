import { html, css, LitElement } from 'lit'
import { customElement, property, state, query } from 'lit/decorators.js'
import { CSVImporter } from '../services/import'
import { ExpenseDao } from '../domain/expense_dao'
import { CategoryDao } from '../domain/category_dao'
import { CurrencyDao } from '../domain/currency_dao'

@customElement('import-btn')
export class ImportBtn extends LitElement {
  static styles = css`
    button {
      margin-right: 0.5rem;
    }
  `

  @property({ type: Boolean })
  disabled = false

  @state()
  private _importer!: CSVImporter

  @query('input[type="file"]')
  private _fileInput!: HTMLInputElement

  private _onImportConfirm = () => {
    this._fileInput?.click()
  }

  async connectedCallback() {
    super.connectedCallback()
    this._importer = new CSVImporter(
      new ExpenseDao(),
      new CategoryDao(),
      new CurrencyDao()
    )
    window.addEventListener('import-confirm', this._onImportConfirm)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('import-confirm', this._onImportConfirm)
  }

  private onClick = () => {
    this.dispatchEvent(new CustomEvent('import-dialog-open', { bubbles: true }))
  }

  private onFileChange = async (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    input.value = '' // allow re-selecting same file

    try {
      const text = await file.text()
      await this._importer.import(text)
      this.dispatchEvent(new CustomEvent('import-complete', { bubbles: true }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      alert(`Import failed: ${message}`)
    }
  }

  render() {
    return html`
      <button ?disabled=${this.disabled} @click=${this.onClick} title="Import">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"
          />
        </svg>
      </button>

      <input
        type="file"
        accept=".csv"
        hidden
        @change=${this.onFileChange}
      />
    `
  }
}
