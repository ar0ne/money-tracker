export interface Category {
    name: string,
}

export interface Currency {
    name: string,
    sign: string,
}


export class Expense {
    constructor(
      public currency: Currency,
      public value: number,
      public category: Category
    ) {
      this.currency = currency;
      this.value = value;
      this.category = category;
    }
}