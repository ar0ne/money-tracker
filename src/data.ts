
import { Category, Currency, Expense } from "./model";

export const categories: Category[] = [
    { id: "1", name: 'Services'},
    { id: "2", name: 'Enterprise' },
    { id: "3", name: 'Alcohol'},
    { id: "4", name: 'Groceries' },
    { id: "5", name: 'Trips' },
];

export const currencies: Currency[] = [
    { id: "1", sign: '$', name: 'US Dollar' },
    { id: "2", sign: '€', name: 'Euro' },
]


export const expenses: Expense[] = [
    new Expense(
        { id: "1", sign: '$', name: 'US Dollar' },
        21.42,
        { id: "1", name: 'Services'}
    ),
    new Expense(
        { id: "1", sign: '$', name: 'US Dollar' },
        4.1,
        { id: "5", name: 'Trips'}
    ),
    new Expense(
        { id: "2", sign: '€', name: 'Euro' },
        100.01,
        { id: "5", name: 'Trips'}
    ),
]