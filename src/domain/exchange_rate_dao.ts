import { getStoreData, putData, Stores } from './db'
import type { ExchangeRate } from './model'

export class ExchangeRateDao {
  public getAll = async (base_currency_id: string): Promise<ExchangeRate[]> => {
    const all = await getStoreData<ExchangeRate>(Stores.ExchangeRates)
    return all.filter((r) => r.from_currency_id === base_currency_id)
  }

  public save = async (rate: Omit<ExchangeRate, 'id' | 'updated'>): Promise<void> => {
    const id = `${rate.from_currency_id}_${rate.to_currency_id}`
    const updated = Date.now()
    await putData(Stores.ExchangeRates, { ...rate, id, updated })
  }
}
