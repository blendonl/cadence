import { Module } from '@nestjs/common';
import { ColumnsCoreModule } from 'src/core/columns/columns.core.module';
import { ProjectsCoreModule } from 'src/core/projects/projects.core.module';
import { ColumnsController } from './controller/columns.controller';

@Module({
  imports: [ColumnsCoreModule, ProjectsCoreModule],
  controllers: [ColumnsController],
})
export class ColumnRestModule {}
