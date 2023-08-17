import { addData, initDB, getStoreData, Stores, getStoreDataById } from './db';
import { Category, Currency, Expense, ExpenseDTO } from "./model";


export class Dao {

    public getAllCurrencies = async () => {
        await initDB();
        let currencies: Currency[] = await getStoreData<Currency>(Stores.Currencies);
        return currencies;
    }

    public getAllCategories = async () => {
        await initDB();
        let categories: Category[] = await getStoreData<Currency>(Stores.Categories);
        return categories;
    }

    public getAllExpenses = async () => {
        await initDB();
        const expenses = await getStoreData<Expense>(Stores.Expenses);
        const categories = await this.getAllCategories();
        const currencies = await this.getAllCurrencies();
        const categoryMap: Map<string, Category> = new Map(
            categories.map(obj => {
                return [obj.id, obj];
            }),
        );
        const currencyMap: Map<string, Currency> = new Map(
            currencies.map(obj => {
                return [obj.id, obj];
            }),
        );

        return expenses.map(item => {
            return {
                id: item.id,
                created: item.created,
                currency: currencyMap.get(item.currency_id) as Currency,
                value: item.value,
                category: categoryMap.get(item.category_id) as Category,
            }
        });
    }

    public addCategory =async (category: Category) => {
        await initDB();
        await addData(Stores.Categories, category);
    }

    public addCurrency =async (currency: Currency) => {
        await initDB();
        await addData(Stores.Currencies, currency);
    }

    public addExpense =async (expense: Expense) => {
        await initDB();
        await addData(Stores.Expenses, expense);
    }
}

const dao = new Dao();

export { dao };

