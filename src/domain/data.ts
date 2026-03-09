import { Currency, Category } from "./model";

export const DEFAULT_CURRENCIES = [
    new Currency("US Dollar", "$", true),
    new Currency("Euro", "€")
];

export const DEFAULT_CATEGORIES = [
    new Category("Entertaiment"),
    new Category("Groceries"),
    new Category("Transport"),
];


