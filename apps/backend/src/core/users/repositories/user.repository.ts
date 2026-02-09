import { User } from '../domain/user';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    email: string;
    name: string;
    image?: string | null;
    googleId: string;
  }): Promise<User>;
  update(
    id: string,
    data: { name?: string; image?: string | null },
  ): Promise<User>;
}
