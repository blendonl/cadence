import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user.repository';

@Injectable()
export class UserGetOneUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}
