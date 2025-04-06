import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ExpenseDao } from '../../src/domain/expense_dao'
import { Expense } from '../../src/domain/model'
import { Stores, getStoreData, addData, deleteData } from '../../src/domain/db'

// Mock the database operations
vi.mock('../../src/domain/db', () => ({
    Stores: {
        Expenses: 'expenses'
    },
    getStoreData: vi.fn(),
    addData: vi.fn(),
    deleteData: vi.fn()
}))

describe('ExpenseDao', () => {
    let expenseDao: ExpenseDao
    let mockExpenses: Expense[]
    const mockCurrencyId = 'currency-1'
    const mockCategoryId = 'category-1'

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks()
        expenseDao = new ExpenseDao()

        // Create test data with different timestamps
        const now = new Date().getTime()
        mockExpenses = [
            new Expense(mockCurrencyId, 100, mockCategoryId),
            new Expense(mockCurrencyId, 200, mockCategoryId),
            new Expense(mockCurrencyId, 300, mockCategoryId)
        ]

        // Set specific creation times for testing
        mockExpenses[0].created = now - 3000 // Oldest
        mockExpenses[1].created = now - 2000 // Middle
        mockExpenses[2].created = now - 1000 // Newest
    })

    describe('getAll', () => {
        it('should return all expenses sorted by creation date', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue(mockExpenses)

            // Execute
            const result = await expenseDao.getAll()

            // Verify
            expect(getStoreData).toHaveBeenCalledWith(Stores.Expenses)
            expect(result).toHaveLength(3)
            // Verify sorting (oldest to newest)
            expect(result[0].created).toBe(mockExpenses[0].created)
            expect(result[1].created).toBe(mockExpenses[1].created)
            expect(result[2].created).toBe(mockExpenses[2].created)
        })

        it('should return empty array when no expenses exist', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue([])

            // Execute
            const result = await expenseDao.getAll()

            // Verify
            expect(result).toHaveLength(0)
        })
    })

    describe('getAllInRange', () => {
        it('should return expenses within date range', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue(mockExpenses)
            const fromDate = new Date(mockExpenses[0].created + 500) // After first expense
            const toDate = new Date(mockExpenses[2].created - 500)   // Before last expense

            // Execute
            const result = await expenseDao.getAllInRange(fromDate, toDate)

            // Verify
            expect(result).toHaveLength(1)
            expect(result[0].created).toBe(mockExpenses[1].created)
        })

        it('should return expenses from start date', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue(mockExpenses)
            const fromDate = new Date(mockExpenses[1].created)

            // Execute
            const result = await expenseDao.getAllInRange(fromDate, undefined)

            // Verify
            expect(result).toHaveLength(2)
            expect(result[0].created).toBe(mockExpenses[1].created)
            expect(result[1].created).toBe(mockExpenses[2].created)
        })

        it('should return expenses until end date', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue(mockExpenses)
            const toDate = new Date(mockExpenses[1].created)

            // Execute
            const result = await expenseDao.getAllInRange(undefined, toDate)

            // Verify
            expect(result).toHaveLength(2)
            expect(result[0].created).toBe(mockExpenses[0].created)
            expect(result[1].created).toBe(mockExpenses[1].created)
        })

        it('should return all expenses when no date range specified', async () => {
            // Setup
            vi.mocked(getStoreData).mockResolvedValue(mockExpenses)

            // Execute
            const result = await expenseDao.getAllInRange(undefined, undefined)

            // Verify
            expect(result).toHaveLength(3)
        })
    })

    describe('add', () => {
        it('should add a new expense', async () => {
            // Setup
            const newExpense = new Expense(mockCurrencyId, 400, mockCategoryId)
            vi.mocked(addData).mockResolvedValue(newExpense)

            // Execute
            await expenseDao.add(newExpense)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Expenses, newExpense)
        })

        it('should handle add errors gracefully', async () => {
            // Setup
            const newExpense = new Expense(mockCurrencyId, 400, mockCategoryId)
            vi.mocked(addData).mockResolvedValue('Error adding expense')

            // Execute
            await expenseDao.add(newExpense)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Expenses, newExpense)
        })
    })

    describe('remove', () => {
        it('should remove an existing expense', async () => {
            // Setup
            const expenseId = mockExpenses[0].id
            vi.mocked(deleteData).mockResolvedValue(true)

            // Execute
            await expenseDao.remove(expenseId)

            // Verify
            expect(deleteData).toHaveBeenCalledWith(Stores.Expenses, expenseId)
        })

        it('should handle remove errors gracefully', async () => {
            // Setup
            const expenseId = 'non-existent-id'
            vi.mocked(deleteData).mockResolvedValue(false)

            // Execute
            await expenseDao.remove(expenseId)

            // Verify
            expect(deleteData).toHaveBeenCalledWith(Stores.Expenses, expenseId)
        })
    })
})
