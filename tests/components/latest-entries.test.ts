/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getLatestExpenses } from '../../src/components/latest-entries';
import type { ExpenseDTO } from '../../src/domain/model';
import { Category } from '../../src/domain/model';
import { Currency } from '../../src/domain/model';

// --- Helper tests (no mocks) ---

describe('getLatestExpenses', () => {
  const makeDTO = (id: string, created: number): ExpenseDTO => ({
    id,
    created,
    currency: new Currency('USD', '$'),
    value: 100,
    category: new Category('Food'),
  });

  it('returns empty array when input is empty', () => {
    expect(getLatestExpenses([], 3)).toEqual([]);
  });

  it('returns at most 3 items when input has 5', () => {
    const now = Date.now();
    const expenses: ExpenseDTO[] = [
      makeDTO('1', now - 4000),
      makeDTO('2', now - 3000),
      makeDTO('3', now - 2000),
      makeDTO('4', now - 1000),
      makeDTO('5', now),
    ];
    const result = getLatestExpenses(expenses, 3);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.id)).toEqual(['5', '4', '3']);
  });

  it('returns items in correct order (newest first)', () => {
    const now = Date.now();
    const expenses: ExpenseDTO[] = [
      makeDTO('a', now - 2000),
      makeDTO('b', now - 1000),
      makeDTO('c', now),
    ];
    const result = getLatestExpenses(expenses, 3);
    expect(result[0].id).toBe('c');
    expect(result[1].id).toBe('b');
    expect(result[2].id).toBe('a');
  });

  it('returns all items when input has fewer than 3', () => {
    const now = Date.now();
    const expenses: ExpenseDTO[] = [
      makeDTO('x', now - 1000),
      makeDTO('y', now),
    ];
    const result = getLatestExpenses(expenses, 3);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('y');
    expect(result[1].id).toBe('x');
  });
});

// --- Component tests (mocked DAOs and initDB) ---

const mockGetAllInRange = vi.fn();
const mockGetAllCategories = vi.fn();
const mockGetAllCurrencies = vi.fn();

vi.mock('../../src/domain/db', () => ({
  initDB: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../src/domain/expense_dao', () => ({
  ExpenseDao: vi.fn().mockImplementation(() => ({
    getAllInRange: mockGetAllInRange,
  })),
}));

vi.mock('../../src/domain/category_dao', () => ({
  CategoryDao: vi.fn().mockImplementation(() => ({
    getAll: mockGetAllCategories,
  })),
}));

vi.mock('../../src/domain/currency_dao', () => ({
  CurrencyDao: vi.fn().mockImplementation(() => ({
    getAll: mockGetAllCurrencies,
  })),
}));

describe('app-latest-entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllCategories.mockResolvedValue([]);
    mockGetAllCurrencies.mockResolvedValue([]);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders nothing (no sl-card) when no records for current month', async () => {
    mockGetAllInRange.mockResolvedValue([]);
    await import('../../src/components/latest-entries');
    const el = document.createElement('app-latest-entries');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.shadowRoot?.querySelector('sl-card')).toBeNull();
  });

  it('renders "Latest Spending" heading and up to 3 entries when records exist', async () => {
    const cat = new Category('Food');
    const cur = new Currency('USD', '$');
    const now = Date.now();
    mockGetAllInRange.mockResolvedValue([
      { id: 'e1', created: now - 2000, currency_id: cur.id, category_id: cat.id, value: 10 },
      { id: 'e2', created: now - 1000, currency_id: cur.id, category_id: cat.id, value: 20 },
    ]);
    mockGetAllCategories.mockResolvedValue([cat]);
    mockGetAllCurrencies.mockResolvedValue([cur]);
    await import('../../src/components/latest-entries');
    const el = document.createElement('app-latest-entries');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    // Wait for async loadLatestEntries to finish and trigger re-render
    await new Promise((r) => setTimeout(r, 50));
    await (el as any).updateComplete;
    const card = el.shadowRoot?.querySelector('sl-card');
    expect(card).not.toBeNull();
    const heading = el.shadowRoot?.querySelector('h3');
    expect(heading?.textContent?.trim()).toBe('Latest Spending');
    const items = el.shadowRoot?.querySelectorAll('.expense-list-item');
    expect(items?.length).toBe(2);
  });

  it('re-fetches when refreshTrigger prop changes', async () => {
    mockGetAllInRange.mockResolvedValue([]);
    await import('../../src/components/latest-entries');
    const el = document.createElement('app-latest-entries') as any;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(mockGetAllInRange).toHaveBeenCalledTimes(1);
    el.refreshTrigger = 1;
    await el.updateComplete;
    expect(mockGetAllInRange).toHaveBeenCalledTimes(2);
  });
});
