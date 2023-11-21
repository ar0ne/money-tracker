import {v4 as uuidv4} from 'uuid';

export class Category {
  id: string;
  is_removed: boolean;
  constructor(public name: string) {
    this.id = uuidv4();
    this.name = name;
    this.is_removed = false;
  }
}

export class Currency {
  id: string;
  constructor(public name: string, public sign: string) {
    this.id = uuidv4();
    this.name = name;
    this.sign = sign;
  }
}


export class Expense {
  id: string;
  created: number;
  constructor(
    public currency_id: string,
    public value: number,
    public category_id: string
  ) {
    this.id = uuidv4();
    this.currency_id = currency_id;
    this.value = value;
    this.category_id = category_id;
    this.created = new Date().getTime();
  }
}

export type ExpenseDTO = {
  id: string;
  created: number;
  currency: Currency,
  value: number,
  category: Category
}

export type Settings = {
  last_currency_id: string | undefined;
}