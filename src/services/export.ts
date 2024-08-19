import { CurrencyDao } from "../domain/currency_dao";
import { CategoryDao } from "../domain/category_dao";
import { ExpenseDao } from "../domain/expense_dao";
import { initDB } from "../domain/db";


export interface Exporter {
    export(): String;
}

function formatDateTime(timestamp: number): string {
    let date = new Date();
    date.setTime(timestamp);
    let datePart = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].map((n, i) => n.toString().padStart(i === 0 ? 4 : 2, "0")).join("-");
    let timePart = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
    ].map((n, i) => n.toString().padStart(2, "0")).join(":");
    return datePart + "," + timePart;
}

export class CSVExporter implements Exporter {

    private _currencyDao!: CurrencyDao;
    private _categoryDao!: CategoryDao;
    private _expenseDao!: ExpenseDao;

    readonly SPLITTER = ",";

    public static async create() {
        let exporter = new CSVExporter();
        exporter._expenseDao = new ExpenseDao();
        exporter._categoryDao = new CategoryDao();
        exporter._currencyDao = new CurrencyDao();
        return exporter;
    }

    public export = async (): String => {
        let expenses = await this._expenseDao.getAll();
        if (!expenses) {
            return []
        }
        const categories = await this._categoryDao.getAll(true);
        const currencies = await this._currencyDao.getAll();
        const categoryMap: Map<string, Category> = new Map(
            categories.map(obj => [obj.id, obj])
        );
        const currencyMap: Map<string, Currency> = new Map(
            currencies.map(obj => [obj.id, obj])
        );
        // datetime | category | value | currency 
        let headers = "date,time,category,value,currency";
        let values = expenses.map(item => {
            return formatDateTime(item.created) + 
                this.SPLITTER + 
                (categoryMap.get(item.category_id) as Category).name + 
                this.SPLITTER + 
                item.value + 
                this.SPLITTER + 
                (currencyMap.get(item.currency_id) as Currency).sign; 
        }).join("\n");

        let csv = headers + '\n' + values; 
        return csv;
    }
}
