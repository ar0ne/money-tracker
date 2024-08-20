import {html, css, LitElement} from 'lit';
import {customElement, property, state } from 'lit/decorators.js';
import { CSVExporter } from "../services/export";


@customElement('export-btn')
export class ExportBtn extends LitElement {
    static styles = css`
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
        this.download(result, "export.csv", "text/csv");
    }

    download(data, filename, type) {
        var file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"), url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }

    render() {
        return html`
            <button ?disabled=${this.disabled} @click=${this.onClick} download="database.csv">
                <svg slot="svg" xmlns="http://www.w3.org/2000/svg" height="36" width="36" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                </svg>
            </button>
        `;
    }
}

