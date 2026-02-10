package dto

type TaskDto struct {
	ID               string     `json:"id"`
	Slug             string     `json:"slug"`
	Title            string     `json:"title"`
	Description      *string    `json:"description"`
	TaskType         string     `json:"taskType"`
	Status           string     `json:"status"`
	Priority         *string    `json:"priority"`
	ColumnID         string     `json:"columnId"`
	Column           *ColumnDto `json:"column,omitempty"`
	BoardID          string     `json:"boardId"`
	ProjectID        string     `json:"projectId"`
	GoalID           *string    `json:"goalId"`
	Position         int        `json:"position"`
	DueDate          *string    `json:"dueDate"`
	EstimatedMinutes *int       `json:"estimatedMinutes"`
	ActualMinutes    *int       `json:"actualMinutes"`
	FilePath         *string    `json:"filePath"`
	CompletedAt      *string    `json:"completedAt"`
	ParentID         *string    `json:"parentId"`
	CreatedAt        string     `json:"createdAt"`
	UpdatedAt        string     `json:"updatedAt"`
}

type TaskCreateRequest struct {
	Title       string  `json:"title"`
	Description *string `json:"description,omitempty"`
	TaskType    *string `json:"taskType,omitempty"`
	Priority    *string `json:"priority,omitempty"`
	ColumnID    string  `json:"columnId"`
	DueDate     *string `json:"dueDate,omitempty"`
	ParentID    *string `json:"parentId,omitempty"`
}

type TaskQuickCreateRequest struct {
	Title    string `json:"title"`
	ColumnID string `json:"columnId"`
}

type TaskUpdateRequest struct {
	Title            *string `json:"title,omitempty"`
	Description      *string `json:"description,omitempty"`
	Priority         *string `json:"priority,omitempty"`
	Status           *string `json:"status,omitempty"`
	DueDate          *string `json:"dueDate,omitempty"`
	EstimatedMinutes *int    `json:"estimatedMinutes,omitempty"`
}

type TaskMoveRequest struct {
	TargetColumnID string `json:"targetColumnId"`
}
