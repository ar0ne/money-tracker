import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CurrencyDao } from '../../src/domain/currency_dao'
import { Currency } from '../../src/domain/model'
import { getAllCurrencies, getCurrencyById } from '../../src/data/currencies'

// CurrencyDao uses static data from data/currencies (no db store)
vi.mock('../../src/data/currencies', () => ({
  getAllCurrencies: vi.fn(),
  getCurrencyById: vi.fn(),
}))

describe('CurrencyDao', () => {
  let currencyDao: CurrencyDao

  beforeEach(() => {
    vi.clearAllMocks()
    currencyDao = new CurrencyDao()
  })

  describe('getAll', () => {
    it('should return all currencies sorted by name', async () => {
      const mockCurrencies = [
        new Currency('EUR', 'Euro', '€'),
        new Currency('GBP', 'Pound Sterling', '£'),
        new Currency('USD', 'US Dollar', '$'),
      ]
      vi.mocked(getAllCurrencies).mockReturnValue(mockCurrencies)

      const result = await currencyDao.getAll()

      expect(getAllCurrencies).toHaveBeenCalled()
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('EUR')
      expect(result[0].name).toBe('Euro')
      expect(result[1].id).toBe('GBP')
      expect(result[1].name).toBe('Pound Sterling')
      expect(result[2].id).toBe('USD')
      expect(result[2].name).toBe('US Dollar')
    })

    it('should handle empty currency list', async () => {
      vi.mocked(getAllCurrencies).mockReturnValue([])

      const result = await currencyDao.getAll()

      expect(getAllCurrencies).toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  describe('getByIds', () => {
    it('should return currencies matching the provided IDs', async () => {
      vi.mocked(getCurrencyById)
        .mockReturnValueOnce(new Currency('USD', 'US Dollar', '$'))
        .mockReturnValueOnce(new Currency('GBP', 'Pound Sterling', '£'))

      const result = await currencyDao.getByIds(['USD', 'GBP'])

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('GBP')
      expect(result[0].name).toBe('Pound Sterling')
      expect(result[1].id).toBe('USD')
      expect(result[1].name).toBe('US Dollar')
    })

    it('should return empty array when no matching IDs found', async () => {
      vi.mocked(getCurrencyById).mockReturnValue(undefined)

      const result = await currencyDao.getByIds(['non-existent-id-1', 'non-existent-id-2'])

      expect(result).toHaveLength(0)
    })

    it('should return currencies sorted by name', async () => {
      vi.mocked(getCurrencyById)
        .mockReturnValueOnce(new Currency('USD', 'US Dollar', '$'))
        .mockReturnValueOnce(new Currency('EUR', 'Euro', '€'))
        .mockReturnValueOnce(new Currency('GBP', 'Pound Sterling', '£'))

      const result = await currencyDao.getByIds(['USD', 'EUR', 'GBP'])

      expect(result).toHaveLength(3)
      expect(result[0].name).toBe('Euro')
      expect(result[1].name).toBe('Pound Sterling')
      expect(result[2].name).toBe('US Dollar')
    })
  })
})
