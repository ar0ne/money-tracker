import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExchangeRateDao } from '../../src/domain/exchange_rate_dao'
import type { ExchangeRate } from '../../src/domain/model'
import { Stores, getStoreData, putData } from '../../src/domain/db'

vi.mock('../../src/domain/db', () => ({
  Stores: {
    ExchangeRates: 'exchange_rates',
  },
  getStoreData: vi.fn(),
  putData: vi.fn(),
}))

describe('ExchangeRateDao', () => {
  let dao: ExchangeRateDao
  const baseId = 'USD'

  beforeEach(() => {
    vi.clearAllMocks()
    dao = new ExchangeRateDao()
  })

  describe('getAll', () => {
    it('returns only rates where from_currency_id equals base_currency_id', async () => {
      const allRates: ExchangeRate[] = [
        { id: 'USD_EUR', from_currency_id: 'USD', to_currency_id: 'EUR', rate: 0.92, updated: 1000 },
        { id: 'USD_GBP', from_currency_id: 'USD', to_currency_id: 'GBP', rate: 0.79, updated: 1001 },
        { id: 'EUR_GBP', from_currency_id: 'EUR', to_currency_id: 'GBP', rate: 0.86, updated: 1002 },
      ]
      vi.mocked(getStoreData).mockResolvedValue(allRates)

      const result = await dao.getAll(baseId)

      expect(getStoreData).toHaveBeenCalledWith(Stores.ExchangeRates)
      expect(result).toHaveLength(2)
      expect(result.map((r) => r.id)).toEqual(['USD_EUR', 'USD_GBP'])
    })

    it('returns empty array when no matching rates', async () => {
      vi.mocked(getStoreData).mockResolvedValue([])

      const result = await dao.getAll(baseId)

      expect(result).toHaveLength(0)
    })

    it('filters out rates for other base currencies', async () => {
      const allRates: ExchangeRate[] = [
        { id: 'EUR_USD', from_currency_id: 'EUR', to_currency_id: 'USD', rate: 1.09, updated: 1000 },
      ]
      vi.mocked(getStoreData).mockResolvedValue(allRates)

      const result = await dao.getAll('USD')

      expect(result).toHaveLength(0)
    })
  })

  describe('save', () => {
    it('calls putData with correct store, id (from_to), and updated timestamp', async () => {
      vi.mocked(putData).mockResolvedValue(null)
      const rate = {
        from_currency_id: 'USD',
        to_currency_id: 'EUR',
        rate: 0.92,
      }

      await dao.save(rate)

      expect(putData).toHaveBeenCalledWith(
        Stores.ExchangeRates,
        expect.objectContaining({
          id: 'USD_EUR',
          from_currency_id: 'USD',
          to_currency_id: 'EUR',
          rate: 0.92,
          updated: expect.any(Number),
        })
      )
    })

    it('upsert creates new record when id does not exist', async () => {
      vi.mocked(putData).mockResolvedValue(null)
      const rate = {
        from_currency_id: 'USD',
        to_currency_id: 'JPY',
        rate: 149,
      }

      await dao.save(rate)

      const call = vi.mocked(putData).mock.calls[0][1] as ExchangeRate
      expect(call.id).toBe('USD_JPY')
      expect(call.updated).toBeGreaterThan(0)
    })

    it('upsert updates existing record (same id)', async () => {
      vi.mocked(putData).mockResolvedValue(null)
      const rate = {
        from_currency_id: 'USD',
        to_currency_id: 'EUR',
        rate: 0.95,
      }

      await dao.save(rate)

      expect(putData).toHaveBeenCalledWith(
        Stores.ExchangeRates,
        expect.objectContaining({
          id: 'USD_EUR',
          rate: 0.95,
        })
      )
    })
  })
})
