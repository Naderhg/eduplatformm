import { Request } from 'express';

export interface IUserRequest extends Request {
  user: {
    id: string;
    role: string;
  };
}

export interface IOptionalUserRequest extends Omit<Request, 'user'> {
  user?: {
    id: string;
    role: string;
  };
}
