export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface State {
  [key: string] : any
}

export interface Method {
  [key: string] : Function
}
