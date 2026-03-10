import { describe, it, expect, vi } from 'vitest'
import {
    getFirstDayOfMonth,
    getLastDayOfMonth,
    getFirstDayOfLastMonth,
    getLastDayOfLastMonth,
    formatDateTime,
    getMonthName,
    getColorClass
} from '../src/utils'

describe('Date Utility Functions', () => {
    describe('getFirstDayOfMonth', () => {
        it('should return first day of current month when no parameters provided', () => {
            const result = getFirstDayOfMonth()
            const now = new Date()
            expect(result.getFullYear()).toBe(now.getFullYear())
            expect(result.getMonth()).toBe(now.getMonth())
            expect(result.getDate()).toBe(1)
            expect(result.getHours()).toBe(0)
            expect(result.getMinutes()).toBe(0)
            expect(result.getSeconds()).toBe(0)
            expect(result.getMilliseconds()).toBe(0)
        })

        it('should return first day of specified month', () => {
            const result = getFirstDayOfMonth(2023, 5) // June 2023
            expect(result.getFullYear()).toBe(2023)
            expect(result.getMonth()).toBe(5)
            expect(result.getDate()).toBe(1)
        })
    })

    describe('getLastDayOfMonth', () => {
        it('should return last day of current month when no parameters provided', () => {
            const result = getLastDayOfMonth()
            const now = new Date()
            const expected = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
            expect(result.getTime()).toBe(expected.getTime())
        })

        it('should return last day of specified month', () => {
            const result = getLastDayOfMonth(2023, 5) // June 2023
            const expected = new Date(2023, 6, 0, 23, 59, 59, 999) // Last day of June
            expect(result.getTime()).toBe(expected.getTime())
        })
    })

    describe('getFirstDayOfLastMonth', () => {
        it('returns first day of previous calendar month', () => {
            // March 10, 2025 -> Feb 1, 2025 00:00:00
            vi.useFakeTimers({ now: new Date(2025, 2, 10).getTime() })
            const result = getFirstDayOfLastMonth()
            expect(result.getFullYear()).toBe(2025)
            expect(result.getMonth()).toBe(1)
            expect(result.getDate()).toBe(1)
            expect(result.getHours()).toBe(0)
            expect(result.getMinutes()).toBe(0)
            expect(result.getSeconds()).toBe(0)
            vi.useRealTimers()
        })

        it('handles year rollover (e.g. Jan 15 -> Dec 1 previous year)', () => {
            vi.useFakeTimers({ now: new Date(2025, 0, 15).getTime() })
            const result = getFirstDayOfLastMonth()
            expect(result.getFullYear()).toBe(2024)
            expect(result.getMonth()).toBe(11)
            expect(result.getDate()).toBe(1)
            vi.useRealTimers()
        })
    })

    describe('getLastDayOfLastMonth', () => {
        it('returns last second of previous calendar month', () => {
            // March 10, 2025 -> Feb 28 23:59:59.999
            vi.useFakeTimers({ now: new Date(2025, 2, 10).getTime() })
            const result = getLastDayOfLastMonth()
            expect(result.getFullYear()).toBe(2025)
            expect(result.getMonth()).toBe(1)
            expect(result.getDate()).toBe(28)
            expect(result.getHours()).toBe(23)
            expect(result.getMinutes()).toBe(59)
            expect(result.getSeconds()).toBe(59)
            expect(result.getMilliseconds()).toBe(999)
            vi.useRealTimers()
        })

        it('handles year rollover', () => {
            vi.useFakeTimers({ now: new Date(2025, 0, 15).getTime() })
            const result = getLastDayOfLastMonth()
            expect(result.getFullYear()).toBe(2024)
            expect(result.getMonth()).toBe(11)
            expect(result.getDate()).toBe(31)
            vi.useRealTimers()
        })
    })

    describe('formatDateTime', () => {
        it('should format timestamp to local date string', () => {
            const timestamp = 1686000000000 // June 5, 2023
            const result = formatDateTime(timestamp)
            expect(result).toBe(new Date(timestamp).toLocaleString())
        })
    })

    describe('getMonthName', () => {
        it('should return full month name', () => {
            const date = new Date(2023, 5) // June
            const result = getMonthName(date)
            expect(result).toBe('June')
        })
    })
})

describe('Color Utility Functions', () => {
    describe('getColorClass', () => {
        it('should return color-0 for index -1', () => {
            expect(getColorClass(-1)).toBe('color-0')
        })

        it('should return color class for index within range', () => {
            expect(getColorClass(5)).toBe('color-5')
        })

        it('should wrap index greater than 10', () => {
            expect(getColorClass(15)).toBe('color-5')
            expect(getColorClass(20)).toBe('color-0')
        })
    })
})
