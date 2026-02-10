package dto

type AgendaItemDto struct {
	ID            string  `json:"id"`
	AgendaID      string  `json:"agendaId"`
	TaskID        *string `json:"taskId"`
	RoutineTaskID *string `json:"routineTaskId"`
	StartAt       *string `json:"startAt"`
	Duration      *int    `json:"duration"`
	Status        string  `json:"status"`
	Position      int     `json:"position"`
	Notes         *string `json:"notes"`
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

type AgendaItemEnrichedDto struct {
	AgendaItemDto
	Task        *TaskInfoDto        `json:"task"`
	RoutineTask *RoutineTaskInfoDto `json:"routineTask"`
}

type TaskInfoDto struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Description *string `json:"description"`
	TaskType    string  `json:"taskType"`
	Priority    *string `json:"priority"`
	ColumnID    string  `json:"columnId"`
	BoardID     string  `json:"boardId"`
	ProjectID   string  `json:"projectId"`
	BoardName   string  `json:"boardName"`
	ProjectName string  `json:"projectName"`
	ColumnName  string  `json:"columnName"`
	GoalID      *string `json:"goalId"`
}

type RoutineTaskInfoDto struct {
	ID            string  `json:"id"`
	RoutineID     string  `json:"routineId"`
	Name          string  `json:"name"`
	RoutineName   string  `json:"routineName"`
	RoutineType   string  `json:"routineType"`
	RoutineTarget *string `json:"routineTarget"`
}

type AgendaItemCreateRequest struct {
	TaskID        *string `json:"taskId,omitempty"`
	RoutineTaskID *string `json:"routineTaskId,omitempty"`
	StartAt       *string `json:"startAt,omitempty"`
	Duration      *int    `json:"duration,omitempty"`
	Notes         *string `json:"notes,omitempty"`
}

type AgendaItemUpdateRequest struct {
	StartAt  *string `json:"startAt,omitempty"`
	Duration *int    `json:"duration,omitempty"`
	Notes    *string `json:"notes,omitempty"`
	Status   *string `json:"status,omitempty"`
}

type AgendaItemCompleteRequest struct {
	CompletedAt *string `json:"completedAt,omitempty"`
}
