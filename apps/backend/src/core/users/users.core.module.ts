import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { USER_REPOSITORY } from './repositories/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { UserFindOrCreateUseCase } from './usecases/user.find-or-create.usecase';
import { UserGetOneUseCase } from './usecases/user.get-one.usecase';
import { UsersCoreService } from './service/users.core.service';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    UserFindOrCreateUseCase,
    UserGetOneUseCase,
    UsersCoreService,
  ],
  exports: [UsersCoreService, USER_REPOSITORY],
})
export class UsersCoreModule {}
