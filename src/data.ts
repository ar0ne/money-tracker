
import { Category, Currency, Expense } from "./model";

export const categories: Category[] = [
    { name: 'Services'},
    { name: 'Enterprise' },
    { name: 'Alcohol'},
    { name: 'Groceries' },
    { name: 'Trips' },
];

export const currencies: Currency[] = [
    { sign: '$', name: 'US Dollar' },
    { sign: '€', name: 'Euro' },
]


export const expenses: Expense[] = [
    new Expense(
        { sign: '$', name: 'US Dollar' },
        21.42,
        { name: 'Services'}
    ),
    new Expense(
        { sign: '$', name: 'US Dollar' },
        4.1,
        { name: 'Trips'}
    ),
    new Expense(
        { sign: '€', name: 'Euro' },
        100.01,
        { name: 'Trips'}
    ),
]