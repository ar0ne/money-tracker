import { getStoreData, Stores, addData, updateData } from "./db";
import { Currency } from "./model";


export class CurrencyDao {
    
    public getAll = async () => {
        let currencies: Currency[] = await getStoreData<Currency>(Stores.Currencies);
        return currencies.sort((a, b) => a.name.localeCompare(b.name));
    }

    public getByIds = async (currency_ids: String[]) => {
        const all = await this.getAll();
        let currencies = all.filter((c) => currency_ids.includes(c.id));
        return Array.from(currencies).sort((a, b) => a.name.localeCompare(b.name));
    }

    public add = async (currency: Currency) => {
        await addData(Stores.Currencies, currency);
    }

    public update = async (currency: Currency) => {
        await updateData(Stores.Currencies, currency.id, currency);
    }

}

