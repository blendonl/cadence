import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';

@Module({
  imports: [AuthModule.forRoot({ auth })],
})
export class AuthCoreModule {}
