import {v4 as uuidv4} from 'uuid';

export class Category {
  id: string;
  constructor(public name: string) {
    this.id = uuidv4();
    this.name = name;
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
    public currency: Currency,
    public value: number,
    public category: Category
  ) {
    this.id = uuidv4();
    this.currency = currency;
    this.value = value;
    this.category = category;
    this.created = new Date().getTime();
  }

  public getTimestamp() {
    let date = new Date();
    date.setTime(this.created);
    return date.toLocaleDateString('en-GB');
  }

}