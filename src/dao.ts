import { addData, initDB, getStoreData, Stores, deleteData, updateData } from './db';
import { Category, Currency, Expense, ExpenseDTO } from "./model";


export interface Dao {
    getAllCurrencies(): Promise<Currency[]>;
    getAllCategories(): Promise<Category[]>;
    getAllExpenses(): Promise<ExpenseDTO[]>;
    addCategory(category: Category): Promise<void>;
    addCurrency(currency: Currency): Promise<void>;
    addExpense(expense: Expense): Promise<void>;
    removeExpense(id: string): Promise<void>;
    updateCategory(category: Category): Promise<void>;
}

export class IndexDbDAO implements Dao {

    constructor() {
    }

    public static create = async () => {
        const dao = new IndexDbDAO();
        await initDB();
        return dao;
    }

    public getAllCurrencies = async () => {
        let currencies: Currency[] = await getStoreData<Currency>(Stores.Currencies);
        return currencies;
    }

    public getAllCategories = async () => {
        let categories: Category[] = await getStoreData<Currency>(Stores.Categories);
        return categories;
    }

    public getAllExpenses = async () => {
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

    public addCategory = async (category: Category) => {
        await addData(Stores.Categories, category);
    }

    public addCurrency = async (currency: Currency) => {
        await addData(Stores.Currencies, currency);
    }

    public addExpense = async (expense: Expense) => {
        await addData(Stores.Expenses, expense);
    }

    public removeExpense = async (id: string) => {
        await deleteData(Stores.Expenses, id);
    }

    public updateCategory = async (category: Category) => {
        await updateData(Stores.Categories, category.id, category)
    }
}


