import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  parseCSV,
  parseDateTime,
  CSVImporter,
} from '../../src/services/import'
import { Stores } from '../../src/domain/db'

// Hoisted so vi.mock factory can use it (factories are hoisted before imports)
const mockClearStore = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../../src/domain/db', async () => {
  const actual = await vi.importActual<typeof import('../../src/domain/db')>(
    '../../src/domain/db'
  )
  return {
    ...actual,
    clearStore: mockClearStore,
  }
})

const mockExpenseDao = {
  getAll: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
}

const mockCategoryDao = {
  getAll: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
}

const mockCurrencyDao = {
  getAll: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  getByIds: vi.fn(),
  update: vi.fn(),
}

describe('parseDateTime', () => {
  it('parses valid date and time to UTC timestamp', () => {
    const ts = parseDateTime('2024-01-01', '09:34:56')
    expect(ts).toBe(1704101696000)
  })

  it('throws on invalid date', () => {
    expect(() => parseDateTime('2024-13-01', '09:34:56')).toThrow(
      'Invalid date/time'
    )
    expect(() => parseDateTime('invalid', '09:34:56')).toThrow('Invalid date/time')
  })

  it('throws on invalid time (non-numeric)', () => {
    expect(() => parseDateTime('2024-01-01', 'ab:00:00')).toThrow(
      'Invalid date/time'
    )
  })
})

describe('parseCSV', () => {
  it('returns empty result for empty string', () => {
    const result = parseCSV('')
    expect(result).toEqual({
      categories: [],
      currencies: [],
      rows: [],
    })
  })

  it('returns empty result for whitespace-only string', () => {
    const result = parseCSV('   \n  ')
    expect(result.rows).toHaveLength(0)
    expect(result.categories).toHaveLength(0)
    expect(result.currencies).toHaveLength(0)
  })

  it('throws on wrong header', () => {
    expect(() => parseCSV('wrong,header\n')).toThrow('Invalid CSV header')
  })

  it('parses valid single row (export format)', () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR`
    const result = parseCSV(csv)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toEqual({
      date: '2024-01-01',
      time: '09:34:56',
      category: 'Groceries',
      value: 100.5,
      currency: 'EUR',
    })
    expect(result.categories).toEqual(['Groceries'])
    expect(result.currencies).toEqual(['EUR'])
  })

  it('parses valid multiple rows', () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR
2024-01-02,09:34:56,Transport,200.75,USD`
    const result = parseCSV(csv)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[1].category).toBe('Transport')
    expect(result.rows[1].value).toBe(200.75)
    expect(result.categories.sort()).toEqual(['Groceries', 'Transport'])
    expect(result.currencies.sort()).toEqual(['EUR', 'USD'])
  })

  it('throws on row with wrong number of columns', () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries`
    expect(() => parseCSV(csv)).toThrow('expected 5 columns')
  })

  it('throws on invalid value', () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,notanumber,EUR`
    expect(() => parseCSV(csv)).toThrow('Invalid value')
  })

  it('skips empty lines', () => {
    const csv = `date,time,category,value,currency

2024-01-01,09:34:56,Groceries,100.5,EUR
`
    const result = parseCSV(csv)
    expect(result.rows).toHaveLength(1)
  })
})

describe('CSVImporter', () => {
  let importer: CSVImporter

  beforeEach(() => {
    vi.clearAllMocks()
    mockClearStore.mockResolvedValue(undefined)
    mockCategoryDao.add.mockResolvedValue(undefined)
    mockCurrencyDao.add.mockResolvedValue(undefined)
    mockCurrencyDao.getAll.mockResolvedValue([])
    mockExpenseDao.add.mockResolvedValue(undefined)
    importer = new CSVImporter(
      mockExpenseDao as any,
      mockCategoryDao as any,
      mockCurrencyDao as any
    )
  })

  it('calls clearStore for expenses and categories only (not currencies)', async () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR`
    await importer.import(csv)

    expect(mockClearStore).toHaveBeenCalledWith(Stores.Expenses)
    expect(mockClearStore).toHaveBeenCalledWith(Stores.Categories)
    expect(mockClearStore).not.toHaveBeenCalledWith(Stores.Currencies)
    expect(mockClearStore).toHaveBeenCalledTimes(2)
  })

  it('creates categories from unique names in CSV', async () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR
2024-01-02,09:34:56,Transport,50,EUR`
    await importer.import(csv)

    expect(mockCategoryDao.add).toHaveBeenCalledTimes(2)
    const addedCategories = mockCategoryDao.add.mock.calls.map((c: any[]) => c[0])
    const names = addedCategories.map((c: any) => c.name).sort()
    expect(names).toEqual(['Groceries', 'Transport'])
  })

  it('adds only missing currencies (preserves existing)', async () => {
    const existingEur = { id: 'eur-1', name: 'EUR', sign: '€' }
    mockCurrencyDao.getAll.mockResolvedValue([existingEur])

    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR
2024-01-02,09:34:56,Groceries,50,USD`
    await importer.import(csv)

    // EUR already exists, only USD should be added
    expect(mockCurrencyDao.add).toHaveBeenCalledTimes(1)
    expect(mockCurrencyDao.add.mock.calls[0][0].name).toBe('USD')
  })

  it('creates expenses with correct timestamps and references', async () => {
    const csv = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR`
    await importer.import(csv)

    expect(mockExpenseDao.add).toHaveBeenCalledTimes(1)
    const expense = mockExpenseDao.add.mock.calls[0][0]
    expect(expense.created).toBe(1704101696000)
    expect(expense.value).toBe(100.5)
    expect(expense.category_id).toBeDefined()
    expect(expense.currency_id).toBeDefined()
    expect(expense.id).toBeDefined()
  })

  it('does not clear or import when parse fails', async () => {
    mockClearStore.mockClear()

    await expect(
      importer.import('wrong,header\n1,2,3,4,5')
    ).rejects.toThrow('Invalid CSV header')

    expect(mockClearStore).not.toHaveBeenCalled()
    expect(mockExpenseDao.add).not.toHaveBeenCalled()
  })

  it('handles empty CSV (clears then adds nothing)', async () => {
    await importer.import('')

    expect(mockClearStore).toHaveBeenCalledWith(Stores.Expenses)
    expect(mockClearStore).toHaveBeenCalledWith(Stores.Categories)
    expect(mockCategoryDao.add).not.toHaveBeenCalled()
    expect(mockCurrencyDao.add).not.toHaveBeenCalled()
    expect(mockExpenseDao.add).not.toHaveBeenCalled()
  })
})
