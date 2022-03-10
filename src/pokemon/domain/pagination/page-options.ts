export class PageOptions {
  readonly order?: string;

  readonly page?: number;

  readonly take?: number;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  constructor(order: string, page: number, take: number){
    this.order = order;
    this.page = page;
    this.take = take;
  }
}