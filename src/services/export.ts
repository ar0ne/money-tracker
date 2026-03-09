import { CurrencyDao } from "../domain/currency_dao";
import { CategoryDao } from "../domain/category_dao";
import { ExpenseDao } from "../domain/expense_dao";
import { Currency, Category } from "../domain/model";


export interface Exporter {
    export(): Promise<string>;
}

/**
 * Formats a Unix timestamp as "YYYY-MM-DD,HH:mm:ss" in UTC.
 * Uses UTC so CSV export is portable and tests pass consistently regardless of machine timezone.
 */
export function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp)
    const datePart = [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate()
    ].map((n, i) => n.toString().padStart(i === 0 ? 4 : 2, "0")).join("-")
    const timePart = [
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    ].map((n) => n.toString().padStart(2, "0")).join(":")
    return datePart + "," + timePart
}

export class CSVExporter implements Exporter {
    readonly SPLITTER = ",";

    constructor(
        private readonly _expenseDao: ExpenseDao,
        private readonly _categoryDao: CategoryDao,
        private readonly _currencyDao: CurrencyDao
    ) {}

    public export = async (): Promise<string> => {
        let expenses = await this._expenseDao.getAll();
        if (expenses.length === 0) {
            return "";
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
                (currencyMap.get(item.currency_id) as Currency).name;
        }).join("\n");

        let csv = headers + '\n' + values;
        return csv;
    }
}
