package dto

type TimeLogDto struct {
	ID          string  `json:"id"`
	TaskID      *string `json:"taskId"`
	ProjectID   *string `json:"projectId"`
	StartTime   string  `json:"startTime"`
	EndTime     *string `json:"endTime"`
	Duration    *int    `json:"duration"`
	Description *string `json:"description"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

type TimeLogCreateRequest struct {
	TaskID      *string `json:"taskId,omitempty"`
	ProjectID   *string `json:"projectId,omitempty"`
	StartTime   string  `json:"startTime"`
	EndTime     *string `json:"endTime,omitempty"`
	Duration    *int    `json:"duration,omitempty"`
	Description *string `json:"description,omitempty"`
}
