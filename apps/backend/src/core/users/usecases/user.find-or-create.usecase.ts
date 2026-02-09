import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../repositories/user.repository';

export interface FindOrCreateUserInput {
  googleId: string;
  email: string;
  name: string;
  image?: string | null;
}

@Injectable()
export class UserFindOrCreateUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: FindOrCreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByGoogleId(input.googleId);

    if (existing) {
      if (existing.name !== input.name || existing.image !== input.image) {
        return this.userRepository.update(existing.id, {
          name: input.name,
          image: input.image,
        });
      }
      return existing;
    }

    return this.userRepository.create({
      googleId: input.googleId,
      email: input.email,
      name: input.name,
      image: input.image,
    });
  }
}
