import { Module } from '@nestjs/common';
import { BoardsCoreModule } from 'src/core/boards/boards.core.module';
import { ProjectsCoreModule } from 'src/core/projects/projects.core.module';
import { BoardsController } from './controller/boards.controller';

@Module({
  imports: [BoardsCoreModule, ProjectsCoreModule],
  controllers: [BoardsController],
})
export class BoardsRestModule {}
