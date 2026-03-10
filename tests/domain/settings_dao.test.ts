import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettingsDao } from '../../src/domain/settings_dao'
import { Settings } from '../../src/domain/model'
import { Stores, getStoreDataById, addData, updateData } from '../../src/domain/db'

// Mock the database operations
vi.mock('../../src/domain/db', () => ({
    Stores: {
        Settings: 'settings'
    },
    getStoreDataById: vi.fn(),
    addData: vi.fn(),
    updateData: vi.fn()
}))

describe('SettingsDao', () => {
    let settingsDao: SettingsDao
    let mockSettings: Settings

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks()
        settingsDao = new SettingsDao()

        // Create test settings
        mockSettings = {
            last_currency_id: 'currency-1'
        }
    })

    describe('getAll', () => {
        it('should return settings by ID', async () => {
            // Setup
            vi.mocked(getStoreDataById).mockResolvedValue(mockSettings)

            // Execute
            const result = await settingsDao.getAll()

            // Verify
            expect(getStoreDataById).toHaveBeenCalledWith(Stores.Settings, settingsDao.SETTINGS_ID)
            expect(result).toEqual(mockSettings)
        })

        it('should return undefined when settings do not exist', async () => {
            // Setup
            vi.mocked(getStoreDataById).mockResolvedValue(undefined)

            // Execute
            const result = await settingsDao.getAll()

            // Verify
            expect(result).toBeUndefined()
        })
    })

    describe('add', () => {
        it('should add new settings', async () => {
            // Setup
            const newSettings: Settings = {
                last_currency_id: 'currency-2'
            }
            vi.mocked(addData).mockResolvedValue(newSettings)

            // Execute
            await settingsDao.add(newSettings)

            // Verify: default_currency_id included (undefined when not provided)
            expect(addData).toHaveBeenCalledWith(Stores.Settings, {
                id: settingsDao.SETTINGS_ID,
                last_currency_id: newSettings.last_currency_id,
                default_currency_id: undefined,
            })
        })

        it('should persist default_currency_id when provided on add', async () => {
            const newSettings: Settings = {
                last_currency_id: 'currency-2',
                default_currency_id: 'EUR',
            }
            vi.mocked(addData).mockResolvedValue(newSettings)

            await settingsDao.add(newSettings)

            expect(addData).toHaveBeenCalledWith(Stores.Settings, {
                id: settingsDao.SETTINGS_ID,
                last_currency_id: 'currency-2',
                default_currency_id: 'EUR',
            })
        })

        it('should handle add errors gracefully', async () => {
            // Setup
            const newSettings: Settings = {
                last_currency_id: 'currency-2'
            }
            vi.mocked(addData).mockResolvedValue('Error adding settings')

            // Execute
            await settingsDao.add(newSettings)

            // Verify
            expect(addData).toHaveBeenCalledWith(Stores.Settings, {
                id: settingsDao.SETTINGS_ID,
                last_currency_id: newSettings.last_currency_id,
                default_currency_id: undefined,
            })
        })
    })

    describe('update', () => {
        it('should update existing settings', async () => {
            // Setup
            const updatedSettings: Settings = {
                last_currency_id: 'currency-3'
            }
            vi.mocked(updateData).mockResolvedValue(updatedSettings)

            // Execute
            await settingsDao.update(updatedSettings)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Settings,
                settingsDao.SETTINGS_ID,
                updatedSettings
            )
        })

        it('should persist default_currency_id when provided on update', async () => {
            const updatedSettings: Settings = {
                last_currency_id: 'currency-3',
                default_currency_id: 'GBP',
            }
            vi.mocked(updateData).mockResolvedValue(updatedSettings)

            await settingsDao.update(updatedSettings)

            expect(updateData).toHaveBeenCalledWith(
                Stores.Settings,
                settingsDao.SETTINGS_ID,
                updatedSettings
            )
        })

        it('should handle update errors gracefully', async () => {
            // Setup
            const updatedSettings: Settings = {
                last_currency_id: 'currency-3'
            }
            vi.mocked(updateData).mockResolvedValue('Error updating settings')

            // Execute
            await settingsDao.update(updatedSettings)

            // Verify
            expect(updateData).toHaveBeenCalledWith(
                Stores.Settings,
                settingsDao.SETTINGS_ID,
                updatedSettings
            )
        })
    })
})
