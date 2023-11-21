

export const getFirstDayOfMonth = (year?: number, month?: number): Date => {
    if (!year || !month) {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
    }
    return new Date(year, month, 1);
}

export const getLastDayOfMonth = (year?: number, month?: number): Date => {
    // last second of current month
    if (!year || !month) {
        const now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
    }
    return new Date(getFirstDayOfMonth(year, month + 1).getTime() - 1);
}

export const formatDateTime = (timestamp: number): string => {
    let date = new Date();
    date.setTime(timestamp);
    return date.toLocaleString();
}

export const getMonthName = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long' });
}
