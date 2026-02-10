package dto

type ColumnDto struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Position  int    `json:"position"`
	BoardID   string `json:"boardId"`
	WipLimit  *int   `json:"wipLimit"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type ColumnCreateRequest struct {
	Name     string `json:"name"`
	BoardID  string `json:"boardId"`
	WipLimit *int   `json:"wipLimit,omitempty"`
}
