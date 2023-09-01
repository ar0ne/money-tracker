import { addData, initDB, getStoreData, Stores, deleteData, updateData, getStoreDataById } from './db';
import { Category, Currency, Expense, ExpenseDTO, Settings } from "./model";


export interface Dao {
    getAllCurrencies(): Promise<Currency[]>;
    getAllCategories(): Promise<Category[]>;
    getAllExpenses(from_date: Date | undefined, to_date: Date | undefined): Promise<ExpenseDTO[]>;
    getSettings(): Promise<Settings| undefined>;
    addCategory(category: Category): Promise<void>;
    addCurrency(currency: Currency): Promise<void>;
    addExpense(expense: Expense): Promise<void>;
    addSettings(settings: Settings): Promise<void>;
    removeExpense(id: string): Promise<void>;
    updateCategory(category: Category): Promise<void>;
    updateSettings(settings: Settings): Promise<void>;
    updateCurrency(currency: Currency): Promise<void>;
}

export class IndexDbDAO implements Dao {

    public SETTINGS_ID: string = 'my-settings';

    public static create = async () => {
        const dao = new IndexDbDAO();
        await initDB();
        return dao;
    }

    public getAllCurrencies = async () => {
        let currencies: Currency[] = await getStoreData<Currency>(Stores.Currencies);
        return currencies.sort((a, b) => a.name.localeCompare(b.name));
    }

    public getAllCategories = async () => {
        let categories: Category[] = await getStoreData<Currency>(Stores.Categories);
        return categories.sort((a, b) => a.name.localeCompare(b.name));
    }

    public getAllExpenses = async (from_date: Date | undefined, to_date: Date | undefined) => {
        // todo: limit data
        console.log("getAllExpenses", from_date, to_date);
        const expenses = await getStoreData<Expense>(Stores.Expenses);
        const categories = await this.getAllCategories();
        const currencies = await this.getAllCurrencies();
        const categoryMap: Map<string, Category> = new Map(
            categories.map(obj => [obj.id, obj])
        );
        const currencyMap: Map<string, Currency> = new Map(
            currencies.map(obj => [obj.id, obj])
        );

        let result = expenses;
        if (from_date) {
            result = expenses.filter((expense) => from_date.getTime() <= expense.created);
        }
        if (to_date) {
            result = result.filter((expense) => expense.created <= to_date.getTime());
        }
        let results = result.map(item => {
            return {
                id: item.id,
                created: item.created,
                currency: currencyMap.get(item.currency_id) as Currency,
                value: item.value,
                category: categoryMap.get(item.category_id) as Category,
            }
        });
        return results.sort((a,b) => a.created - b.created);
    }

    public getSettings = async () => {
        return await getStoreDataById<Settings>(Stores.Settings, this.SETTINGS_ID);
    }

    public addCategory = async (category: Category) => {
        await addData(Stores.Categories, category);
    }

    public addCurrency = async (currency: Currency) => {
        await addData(Stores.Currencies, currency);
    }

    public addExpense = async (expense: Expense) => {
        await addData(Stores.Expenses, expense);
    }

    public addSettings = async (settings: Settings) => {
        await addData(Stores.Settings, {id: this.SETTINGS_ID, last_currency_id: settings.last_currency_id});
    }

    public removeExpense = async (id: string) => {
        await deleteData(Stores.Expenses, id);
    }

    public updateCategory = async (category: Category) => {
        await updateData(Stores.Categories, category.id, category)
    }

    public updateCurrency = async (currency: Currency) => {
        await updateData(Stores.Currencies, currency.id, currency)
    }

    public updateSettings = async (settings: Settings) => {
        await updateData(Stores.Settings, this.SETTINGS_ID, settings)
    }

}


