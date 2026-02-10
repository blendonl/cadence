package dto

type BoardDto struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Description *string `json:"description"`
	Color       string  `json:"color"`
	ProjectID   string  `json:"projectId"`
	FilePath    *string `json:"filePath"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type BoardDetailDto struct {
	BoardDto
	Columns     []BoardColumnDto `json:"columns"`
	ProjectName string           `json:"projectName"`
}

type BoardColumnDto struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Position  int       `json:"position"`
	Color     string    `json:"color"`
	WipLimit  *int      `json:"wipLimit"`
	Tasks     []TaskDto `json:"tasks"`
	TaskCount int       `json:"taskCount"`
}

type BoardCreateRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Color       *string `json:"color,omitempty"`
	ProjectID   string  `json:"projectId"`
}

type BoardUpdateRequest struct {
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
	Color       *string `json:"color,omitempty"`
}
