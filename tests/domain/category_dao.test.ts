import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoryDao } from '../../src/domain/category_dao'
import { Category } from '../../src/domain/model'
import { Stores, getStoreData, addData, updateData } from '../../src/domain/db'

// Mock the database operations
vi.mock('../../src/domain/db', () => ({
    Stores: {
        Categories: 'categories'
    },
    getStoreData: vi.fn(),
    addData: vi.fn(),
    updateData: vi.fn()
}))

describe('CategoryDao', () => {
    let categoryDao: CategoryDao
    let mockCategories: Category[]

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks()
        categoryDao = new CategoryDao()

        // Setup mock data
        mockCategories = [
            new Category('Food'),
            new Category('Transport'),
            new Category('Entertainment')
        ]
    })

    describe('getAll', () => {
        it('should return all non-removed categories sorted by name', async () => {
            // Setup
            const mockCategoriesWithRemoved = [
                ...mockCategories,
                { ...new Category('Deleted'), is_removed: true }
            ]
            vi.mocked(getStoreData).mockResolvedValue(mockCategoriesWithRemoved)

            // Execute
            const result = await categoryDao.getAll()

            // Verify
            expect(getStoreData).toHaveBeenCalledWith(Stores.Categories)
            expect(result).toHaveLength(3)
            expect(result[0].name).toBe('Entertainment')
            expect(result[1].name).toBe('Food')
            expect(result[2].name).toBe('Transport')
            expect(result.every(cat => !cat.is_removed)).toBe(true)
        })

        it('should return all categories including removed ones when all=true', async () => {
            // Setup
            const mockCategoriesWithRemoved = [
                ...mockCategories,
                { ...new Category('Deleted'), is_removed: true }
            ]
            vi.mocked(getStoreData).mockResolvedValue(mockCategoriesWithRemoved)

            // Execute
            const result = await categoryDao.getAll(true)

            // Verify
            expect(getStoreData).toHaveBeenCalledWith(Stores.Categories)
            expect(result).toHaveLength(4)
            expect(result.some(cat => cat.is_removed)).toBe(true)
        })
    })

    describe('add', () => {
        it('should add a new category', async () => {
            // Setup
            const newCategory = new Category('Shopping')
            vi.mocked(addData).mockResolvedValue(newCategory)

            // Execute
            await categoryDao.add(newCategory)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Categories, newCategory)
        })

        it('should handle add errors gracefully', async () => {
            // Setup
            const newCategory = new Category('Shopping')
            vi.mocked(addData).mockResolvedValue('Error adding category')

            // Execute
            await categoryDao.add(newCategory)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Categories, newCategory)
        })
    })

    describe('update', () => {
        it('should update an existing category', async () => {
            // Setup
            const updatedCategory = { ...mockCategories[0], name: 'Updated Food' }
            vi.mocked(updateData).mockResolvedValue(updatedCategory)

            // Execute
            await categoryDao.update(updatedCategory)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Categories,
                updatedCategory.id,
                updatedCategory
            )
        })

        it('should handle update errors gracefully', async () => {
            // Setup
            const updatedCategory = { ...mockCategories[0], name: 'Updated Food' }
            vi.mocked(updateData).mockResolvedValue(null)

            // Execute
            await categoryDao.update(updatedCategory)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Categories,
                updatedCategory.id,
                updatedCategory
            )
        })
    })
})
