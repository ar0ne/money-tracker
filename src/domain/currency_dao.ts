import { Currency } from "./model"
import { getCurrencyById, getAllCurrencies } from "../data/currencies"


export class CurrencyDao {
  public getAll = async (): Promise<Currency[]> => {
    return getAllCurrencies();
  }

  public getById = async (id: string): Promise<Currency | undefined> => {
    return getCurrencyById(id);
  }

  public getByIds = async (currency_ids: string[]): Promise<Currency[]> => {
    const result: Currency[] = []
    for (const id of currency_ids) {
      const w = getCurrencyById(id)
      if (w) result.push(w)
    }
    return result.sort((a, b) => a.name.localeCompare(b.name))
  }

}
