export class QueryParams {
  readonly type?: string;

  readonly name?: string;

  constructor(type: string, name: string){
    this.type = type;
    this.name = name;
  }
}
