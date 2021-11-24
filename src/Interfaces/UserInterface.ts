export interface UserInterface {
  username: string;
  id: string;
  // todos: {todo : String, date: Date}[];
}

export interface DatabaseUserInterface {
  username: string;
  password: string;
  _id: string;
  todos : {todo : String, date: Date}[];
}