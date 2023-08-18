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

/**
 *
 * Bill: {
 *    USD: 24,
 *    EUR: 24,
 * },
 *
 * function getStat(expenses: []):
 *
 *    expenses = {}
 *    for cat in categories:
 *        for exp in expenses:
 *            if exp.cat == cat:
 *                expenses[exp.currency] += exp.value
 *
 *
 *
 */
