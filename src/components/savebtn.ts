import {html, css, LitElement} from 'lit';
import {customElement, property, state } from 'lit/decorators.js';
import { CSVExporter } from "../services/export";


@customElement('save-btn')
export class SaveBtn extends LitElement {
  static styles = css`
    ::slotted(*) {
      color: red;
    }
  `
  @property({type: Boolean})
  disabled = false;

  @state()
  private _exporter!: CSVExporter;

  async connectedCallback() {
    super.connectedCallback();
    this._exporter = await CSVExporter.create();
  }

  onClick = async (e) => {
    let result = await this._exporter.export();
    console.log(result);
  }

  render() {
    return html`
        <button ?disabled=${this.disabled} @click=${this.onClick}>
          <svg slot="svg" xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 -960 960 960" fill="currentColor">
            <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
          </svg>
        </button>
    `;}
}

