import { describe, it, expect } from 'vitest'
import {
    getFirstDayOfMonth,
    getLastDayOfMonth,
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
