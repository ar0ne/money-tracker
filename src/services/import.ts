import { v4 as uuidv4 } from 'uuid'
import { clearStore, Stores } from '../domain/db'
import { ExpenseDao } from '../domain/expense_dao'
import { CategoryDao } from '../domain/category_dao'
import { CurrencyDao } from '../domain/currency_dao'
import { Category, Currency, Expense } from '../domain/model'

export interface ParsedRow {
  date: string
  time: string
  category: string
  value: number
  currency: string
}

export interface ParseResult {
  categories: string[]
  currencies: string[]
  rows: ParsedRow[]
}

const EXPECTED_HEADER = 'date,time,category,value,currency'


const CURRENCY_SIGN_MAP: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  RUB: '₽',
}


export function parseDateTime(dateStr: string, timeStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min, s] = timeStr.split(':').map(Number)
  if (
    [y, m, d, h, min, s].some((n) => n === undefined || isNaN(n)) ||
    m < 1 ||
    m > 12 ||
    d < 1 ||
    d > 31
  ) {
    throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`)
  }
  const date = new Date(Date.UTC(y, m - 1, d, h, min, s))
  return date.getTime()
}


export function parseCSV(csvText: string): ParseResult {
  const trimmed = csvText.trim()
  if (trimmed === '') {
    return { categories: [], currencies: [], rows: [] }
  }

  const lines = trimmed.split(/\r?\n/)
  if (lines.length < 1) return { categories: [], currencies: [], rows: [] }

  const header = lines[0].trim()
  if (header !== EXPECTED_HEADER) {
    throw new Error(`Invalid CSV header. Expected: ${EXPECTED_HEADER}`)
  }

  const rows: ParsedRow[] = []
  const categorySet = new Set<string>()
  const currencySet = new Set<string>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') continue

    const parts = line.split(',')
    if (parts.length !== 5) {
      throw new Error(`Invalid row ${i + 1}: expected 5 columns`)
    }

    const [date, time, category, valueStr, currency] = parts
    const value = parseFloat(valueStr)
    if (isNaN(value)) {
      throw new Error(`Invalid value in row ${i + 1}: ${valueStr}`)
    }

    rows.push({ date, time, category, value, currency })
    categorySet.add(category)
    currencySet.add(currency)
  }

  return {
    categories: Array.from(categorySet),
    currencies: Array.from(currencySet),
    rows,
  }
}

export class CSVImporter {
  constructor(
    private readonly _expenseDao: ExpenseDao,
    private readonly _categoryDao: CategoryDao,
    private readonly _currencyDao: CurrencyDao
  ) {}


  public import = async (csvText: string): Promise<void> => {
    const parsed = parseCSV(csvText)

    // Clear only expenses and categories; currencies are preserved
    await clearStore(Stores.Expenses)
    await clearStore(Stores.Categories)

    // Build category name -> id and currency name -> id maps
    const categoryByName = new Map<string, Category>()
    for (const name of parsed.categories) {
      const cat = new Category(name)
      await this._categoryDao.add(cat)
      categoryByName.set(name, cat)
    }

    const existingCurrencies = await this._currencyDao.getAll()
    const currencyByName = new Map<string, Currency>(
      existingCurrencies.map((c) => [c.name, c])
    )

    // Add only currencies from CSV that don't exist yet
    for (const name of parsed.currencies) {
      if (!currencyByName.has(name)) {
        const sign = CURRENCY_SIGN_MAP[name] ?? ''
        const cur = new Currency(name, sign)
        await this._currencyDao.add(cur)
        currencyByName.set(name, cur)
      }
    }

    for (const row of parsed.rows) {
      const category = categoryByName.get(row.category)
      const currency = currencyByName.get(row.currency)
      if (!category || !currency) continue // defensive

      const created = parseDateTime(row.date, row.time)
      const expense: Expense = {
        id: uuidv4(),
        created,
        currency_id: currency.id,
        value: row.value,
        category_id: category.id,
      }
      await this._expenseDao.add(expense)
    }
  }
}
