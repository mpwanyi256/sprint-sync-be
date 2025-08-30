export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
