import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CurrencyDao } from '../../src/domain/currency_dao'
import { Currency } from '../../src/domain/model'
import { Stores, getStoreData, addData, updateData } from '../../src/domain/db'

// Mock the database operations to avoid actual database calls during testing
vi.mock('../../src/domain/db', () => ({
    // Mock the Stores enum with just the Currencies store
    Stores: {
        Currencies: 'currencies'
    },
    // Mock the database operation functions
    getStoreData: vi.fn(),
    addData: vi.fn(),
    updateData: vi.fn()
}))

// Main test suite for CurrencyDao
describe('CurrencyDao', () => {
    // Variables to hold the DAO instance and test data
    let currencyDao: CurrencyDao
    let mockCurrencies: Currency[]

    // Setup that runs before each test
    beforeEach(() => {
        // Reset all mocks to ensure clean state for each test
        vi.clearAllMocks()
        // Create a new instance of CurrencyDao for each test
        currencyDao = new CurrencyDao()

        // Create test data with sample currencies
        mockCurrencies = [
            new Currency('US Dollar', '$'),
            new Currency('Euro', '€'),
            new Currency('British Pound', '£')
        ]
    })

    // Test suite for the getAll method
    describe('getAll', () => {
        // Test that getAll returns currencies sorted by name
        it('should return all currencies sorted by name', async () => {
            // Setup: Mock the database to return our test currencies
            vi.mocked(getStoreData).mockResolvedValue(mockCurrencies)

            // Execute: Call the method we're testing
            const result = await currencyDao.getAll()

            // Verify: Check that the method worked as expected
            expect(getStoreData).toHaveBeenCalledWith(Stores.Currencies)
            expect(result).toHaveLength(3)
            expect(result[0].name).toBe('British Pound') // Verify sorting
            expect(result[1].name).toBe('Euro')
            expect(result[2].name).toBe('US Dollar')
        })

        // Test handling of empty currency list
        it('should handle empty currency list', async () => {
            // Setup: Mock empty result
            vi.mocked(getStoreData).mockResolvedValue([])

            // Execute
            const result = await currencyDao.getAll()

            // Verify
            expect(getStoreData).toHaveBeenCalledWith(Stores.Currencies)
            expect(result).toHaveLength(0)
        })
    })

    // Test suite for the getByIds method
    describe('getByIds', () => {
        // Test retrieving specific currencies by their IDs
        it('should return currencies matching the provided IDs', async () => {
            // Setup: Mock database and create target IDs
            vi.mocked(getStoreData).mockResolvedValue(mockCurrencies)
            const targetIds = [mockCurrencies[0].id, mockCurrencies[2].id]

            // Execute
            const result = await currencyDao.getByIds(targetIds)

            // Verify
            expect(result).toHaveLength(2)
            expect(result[0].name).toBe('British Pound')
            expect(result[1].name).toBe('US Dollar')
        })

        // Test handling of non-existent IDs
        it('should return empty array when no matching IDs found', async () => {
            // Setup: Mock database and create non-existent IDs
            vi.mocked(getStoreData).mockResolvedValue(mockCurrencies)
            const nonExistentIds = ['non-existent-id-1', 'non-existent-id-2']

            // Execute
            const result = await currencyDao.getByIds(nonExistentIds)

            // Verify
            expect(result).toHaveLength(0)
        })

        // Test that returned currencies are sorted by name
        it('should return currencies sorted by name', async () => {
            // Setup: Mock database and create target IDs
            vi.mocked(getStoreData).mockResolvedValue(mockCurrencies)
            const targetIds = [mockCurrencies[0].id, mockCurrencies[1].id, mockCurrencies[2].id]

            // Execute
            const result = await currencyDao.getByIds(targetIds)

            // Verify
            expect(result).toHaveLength(3)
            expect(result[0].name).toBe('British Pound')
            expect(result[1].name).toBe('Euro')
            expect(result[2].name).toBe('US Dollar')
        })
    })

    // Test suite for the add method
    describe('add', () => {
        // Test successful currency addition
        it('should add a new currency', async () => {
            // Setup: Create new currency and mock successful addition
            const newCurrency = new Currency('Yen', '¥')
            vi.mocked(addData).mockResolvedValue(newCurrency)

            // Execute
            await currencyDao.add(newCurrency)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Currencies, newCurrency)
        })

        // Test error handling during addition
        it('should handle add errors gracefully', async () => {
            // Setup: Create new currency and mock error response
            const newCurrency = new Currency('Yen', '¥')
            vi.mocked(addData).mockResolvedValue('Error adding currency')

            // Execute
            await currencyDao.add(newCurrency)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Currencies, newCurrency)
        })
    })

    // Test suite for the update method
    describe('update', () => {
        // Test successful currency update
        it('should update an existing currency', async () => {
            // Setup: Create updated currency and mock successful update
            const updatedCurrency = { ...mockCurrencies[0], name: 'Updated Dollar' }
            vi.mocked(updateData).mockResolvedValue(updatedCurrency)

            // Execute
            await currencyDao.update(updatedCurrency)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Currencies,
                updatedCurrency.id,
                updatedCurrency
            )
        })

        // Test error handling during update
        it('should handle update errors gracefully', async () => {
            // Setup: Create updated currency and mock error response
            const updatedCurrency = { ...mockCurrencies[0], name: 'Updated Dollar' }
            vi.mocked(updateData).mockResolvedValue(null)

            // Execute
            await currencyDao.update(updatedCurrency)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Currencies,
                updatedCurrency.id,
                updatedCurrency
            )
        })
    })
})
