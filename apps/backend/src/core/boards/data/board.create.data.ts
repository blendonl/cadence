import { BoardColumnCreateData } from './board.column.create.data';

export interface BoardCreateData {
  id?: string;
  name: string;
  description?: string | null;
  projectId: string;
  columns?: BoardColumnCreateData[];
}
