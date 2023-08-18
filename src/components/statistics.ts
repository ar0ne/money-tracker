import { ExpenseDTO } from "../model";
import {Category, Currency} from "../model";


export type Statistic = Map<Category, Map<Currency, number>>;

export function getStatistic(expenses: ExpenseDTO[]) {
    const currencies = [...new Set(expenses.map(item => item.currency))];
    const categories = [...new Set(expenses.map(item => item.category))];
    // init statistic
    let statistic: Statistic = new Map(
        categories.map(cat => [cat, new Map(currencies.map(cur => [cur, 0]))])
    );
    expenses.forEach(expense => {
        const category = expense.category;
        const currency = expense.currency;
        const oldValue = statistic.get(category)?.get(currency) || 0;
        statistic.get(category)?.set(currency, oldValue + expense.value);
    });
    return statistic;
}
