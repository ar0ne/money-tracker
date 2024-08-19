import { addData, deleteData, getStoreData, Stores } from "./db";
import { Expense } from "./model";


export class ExpenseDao {

    public getAll = async () => {
        const expenses = await getStoreData<Expense>(Stores.Expenses);
        return expenses.sort((a, b) => a.created - b.created);
    }

    public getAllInRange = async (from_date: Date | undefined, to_date: Date | undefined) => {
        const expenses = await this.getAll();
        let result = expenses;
        if (from_date) {
            result = expenses.filter((expense) => from_date.getTime() <= expense.created);
        }
        if (to_date) {
            result = result.filter((expense) => expense.created <= to_date.getTime());
        }
        return result;
    }

    public add = async (expense: Expense) => {
        await addData(Stores.Expenses, expense);
    }

    public remove = async (id: string) => {
        await deleteData(Stores.Expenses, id);
    }
}
