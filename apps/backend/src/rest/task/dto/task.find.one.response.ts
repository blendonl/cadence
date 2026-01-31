import { ColumnDto } from 'shared-types';
import { TaskFindOneData } from 'src/core/tasks/data/task.find.one.data';
import { ColumnMapper } from 'src/rest/column/column.mapper';

export class TaskFindOneResponse {
  id: string;
  title: string;
  slug: string;
  taskNumber: number;
  description: string | null;
  columnId: string;
  parentId: string | null;
  type: string;
  priority: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  column: ColumnDto;

  public static fromDomain(data: TaskFindOneData): TaskFindOneResponse {
    const response = new TaskFindOneResponse();
    response.id = data.id;
    response.title = data.title;
    response.slug = data.slug;
    response.taskNumber = data.taskNumber;
    response.description = data.description;
    response.columnId = data.columnId;
    response.parentId = data.parentId;
    response.type = data.type;
    response.priority = data.priority;
    response.position = data.position;
    response.createdAt = data.createdAt;
    response.updatedAt = data.updatedAt;
    response.column = ColumnMapper.toResponse(data.column);

    return response;
  }
}
