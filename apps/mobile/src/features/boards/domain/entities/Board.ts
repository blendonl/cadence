import { ProjectId, Timestamp } from "@core/types";
import { Column } from "./Column";

export interface Board {
  id: string;
  name: string;
  projectId: ProjectId;
  description: string | null;
  columns?: Column[];
  createdAt?: string;
}
