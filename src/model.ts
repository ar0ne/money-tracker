export interface Category {
  id: string,
  name: string,
}

export interface Currency {
  id: string,
  name: string,
  sign: string,
}


export class Expense {
  id: string;
  created: number;
  constructor(
    public currency: Currency,
    public value: number,
    public category: Category
  ) {
    this.id = "";
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