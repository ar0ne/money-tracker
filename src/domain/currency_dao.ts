import { getStoreData, Stores, addData, updateData } from "./db";
import { Currency, ExpenseDTO } from "./model";


export class CurrencyDao {
    
    public getAll = async () => {
        let currencies: Currency[] = await getStoreData<Currency>(Stores.Currencies);
        return currencies.sort((a, b) => a.name.localeCompare(b.name));
    }

    public getUsed = async (expenses: ExpenseDTO[]) => {
        const currencies = new Set(expenses.map((ex) => ex.currency));
        return Array.from(currencies).sort((a, b) => a.name.localeCompare(b.name));
    }

    public add = async (currency: Currency) => {
        await addData(Stores.Currencies, currency);
    }

    public update = async (currency: Currency) => {
        await updateData(Stores.Currencies, currency.id, currency);
    }

}

