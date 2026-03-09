import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CSVExporter } from '../../src/services/export'
import { formatDateTime } from '../../src/services/export'

// Mock DAO classes
const mockExpenseDao = {
    getAll: vi.fn(),
    getAllInRange: vi.fn(),
    add: vi.fn(),
    remove: vi.fn()
}

const mockCategoryDao = {
    getAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    update: vi.fn()
}

const mockCurrencyDao = {
    getAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
    getByIds: vi.fn(),
    update: vi.fn()
}

describe('formatDateTime', () => {
    it('should format timestamp correctly in UTC', () => {
        // 1704101696000 = 2024-01-01 09:34:56 UTC (timezone-independent)
        const timestamp = 1704101696000
        const result = formatDateTime(timestamp)
        expect(result).toBe('2024-01-01,09:34:56')
    })
})

describe('CSVExporter', () => {
    let exporter: CSVExporter

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks()
        exporter = new CSVExporter(mockExpenseDao, mockCategoryDao, mockCurrencyDao)
    })

    it('should return empty string when no expenses exist', async () => {
        // Setup
        mockExpenseDao.getAll.mockResolvedValue([])
        mockCategoryDao.getAll.mockResolvedValue([])
        mockCurrencyDao.getAll.mockResolvedValue([])

        // Execute
        const result = await exporter.export()

        // Verify
        expect(result).toBe('')
        expect(mockExpenseDao.getAll).toHaveBeenCalled()
    })

    it('should generate correct CSV format with expenses', async () => {
        // Setup mock data
        const mockExpenses = [{
            id: '1',
            created: 1704101696000, // 2024-01-01 09:34:56 UTC
            category_id: 'cat1',
            value: 100.50,
            currency_id: 'eur'
        }]

        const mockCategories = [{
            id: 'cat1',
            name: 'Groceries',
            color: '#FF0000'
        }]

        const mockCurrencies = [{
            id: 'eur',
            name: 'EUR',
            symbol: '€'
        }]

        // Setup mocks
        mockExpenseDao.getAll.mockResolvedValue(mockExpenses)
        mockCategoryDao.getAll.mockResolvedValue(mockCategories)
        mockCurrencyDao.getAll.mockResolvedValue(mockCurrencies)

        // Execute
        const result = await exporter.export()

        // Verify (times in UTC)
        const expectedCSV = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR`

        expect(result).toBe(expectedCSV)
        expect(mockExpenseDao.getAll).toHaveBeenCalled()
        expect(mockCategoryDao.getAll).toHaveBeenCalledWith(true)
        expect(mockCurrencyDao.getAll).toHaveBeenCalled()
    })

    it('should handle multiple expenses correctly', async () => {
        // Setup mock data
        const mockExpenses = [
            {
                id: '1',
                created: 1704101696000, // 2024-01-01 09:34:56 UTC
                category_id: 'cat1',
                value: 100.50,
                currency_id: 'eur'
            },
            {
                id: '2',
                created: 1704188096000, // 2024-01-02 09:34:56 UTC
                category_id: 'cat2',
                value: 200.75,
                currency_id: 'usd'
            }
        ]

        const mockCategories = [
            {
                id: 'cat1',
                name: 'Groceries',
                color: '#FF0000'
            },
            {
                id: 'cat2',
                name: 'Transport',
                color: '#00FF00'
            }
        ]

        const mockCurrencies = [
            {
                id: 'eur',
                name: 'EUR',
                symbol: '€'
            },
            {
                id: 'usd',
                name: 'USD',
                symbol: '$'
            }
        ]

        // Setup mocks
        mockExpenseDao.getAll.mockResolvedValue(mockExpenses)
        mockCategoryDao.getAll.mockResolvedValue(mockCategories)
        mockCurrencyDao.getAll.mockResolvedValue(mockCurrencies)

        // Execute
        const result = await exporter.export()

        // Verify (times in UTC)
        const expectedCSV = `date,time,category,value,currency
2024-01-01,09:34:56,Groceries,100.5,EUR
2024-01-02,09:34:56,Transport,200.75,USD`

        expect(result).toBe(expectedCSV)
    })
})
