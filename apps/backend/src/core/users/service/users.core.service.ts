import { Injectable } from '@nestjs/common';
import {
  UserFindOrCreateUseCase,
  FindOrCreateUserInput,
} from '../usecases/user.find-or-create.usecase';
import { UserGetOneUseCase } from '../usecases/user.get-one.usecase';

@Injectable()
export class UsersCoreService {
  constructor(
    private readonly findOrCreateUseCase: UserFindOrCreateUseCase,
    private readonly getOneUseCase: UserGetOneUseCase,
  ) {}

  async findOrCreate(input: FindOrCreateUserInput) {
    return this.findOrCreateUseCase.execute(input);
  }

  async getById(id: string) {
    return this.getOneUseCase.execute(id);
  }
}
