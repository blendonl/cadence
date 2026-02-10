package daemon

const (
	RequestGetBoard       = "get_board"
	RequestListBoards     = "list_boards"
	RequestCreateBoard    = "create_board"
	RequestAddTask        = "add_task"
	RequestMoveTask       = "move_task"
	RequestUpdateTask     = "update_task"
	RequestDeleteTask     = "delete_task"
	RequestAddColumn      = "add_column"
	RequestDeleteColumn   = "delete_column"
	RequestGetActiveBoard = "get_active_board"

	RequestListNotes  = "list_notes"
	RequestGetNote    = "get_note"
	RequestCreateNote = "create_note"
	RequestUpdateNote = "update_note"
	RequestDeleteNote = "delete_note"

	RequestGetAgendaView      = "get_agenda_view"
	RequestCreateAgendaItem   = "create_agenda_item"
	RequestUpdateAgendaItem   = "update_agenda_item"
	RequestCompleteAgendaItem = "complete_agenda_item"

	RequestSubscribe   = "subscribe"
	RequestUnsubscribe = "unsubscribe"
	RequestPing        = "ping"

	RequestStartTimer      = "start_timer"
	RequestStopTimer       = "stop_timer"
	RequestGetActiveTimers = "get_active_timers"

	RequestListProjects = "list_projects"
	RequestGetProject   = "get_project"
	RequestReloadToken  = "reload_token"

	NotificationBoardUpdated = "board_updated"
	NotificationTaskCreated  = "task_created"
	NotificationTaskUpdated  = "task_updated"
	NotificationTaskMoved    = "task_moved"
	NotificationTaskDeleted  = "task_deleted"
	NotificationPong         = "pong"
)

type Request struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload,omitempty"`
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type Notification struct {
	Type    string      `json:"type"`
	BoardID string      `json:"board_id,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

type GetBoardPayload struct {
	BoardID string `json:"board_id"`
}

type CreateBoardPayload struct {
	ProjectID   string `json:"projectId"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type AddTaskPayload struct {
	Title    string `json:"title"`
	ColumnID string `json:"columnId"`
}

type MoveTaskPayload struct {
	TaskID         string `json:"task_id"`
	TargetColumnID string `json:"target_column_id"`
}

type UpdateTaskPayload struct {
	TaskID string                 `json:"task_id"`
	Fields map[string]interface{} `json:"fields"`
}

type DeleteTaskPayload struct {
	TaskID string `json:"task_id"`
}

type AddColumnPayload struct {
	BoardID string `json:"board_id"`
	Name    string `json:"name"`
}

type DeleteColumnPayload struct {
	BoardID  string `json:"board_id"`
	ColumnID string `json:"column_id"`
}

type SubscribePayload struct {
	BoardID string `json:"board_id"`
}

type GetActiveBoardPayload struct {
	SessionName string `json:"session_name,omitempty"`
}

type StartTimerPayload struct {
	ProjectID   string `json:"project_id"`
	TaskID      string `json:"task_id,omitempty"`
	Description string `json:"description,omitempty"`
}

type StopTimerPayload struct {
	ProjectID string `json:"project_id"`
	TaskID    string `json:"task_id,omitempty"`
}

type ListNotesPayload struct {
	ProjectID string `json:"project_id,omitempty"`
	NoteType  string `json:"note_type,omitempty"`
}

type GetNotePayload struct {
	NoteID string `json:"note_id"`
}

type CreateNotePayload struct {
	Type    string   `json:"type"`
	Title   string   `json:"title"`
	Content string   `json:"content"`
	Tags    []string `json:"tags,omitempty"`
}

type UpdateNotePayload struct {
	NoteID  string   `json:"note_id"`
	Title   *string  `json:"title,omitempty"`
	Content *string  `json:"content,omitempty"`
	Tags    []string `json:"tags,omitempty"`
}

type DeleteNotePayload struct {
	NoteID string `json:"note_id"`
}

type GetAgendaViewPayload struct {
	Mode       string `json:"mode"`
	AnchorDate string `json:"anchor_date"`
	Timezone   string `json:"timezone"`
}

type CreateAgendaItemPayload struct {
	AgendaID      string  `json:"agenda_id"`
	TaskID        *string `json:"task_id,omitempty"`
	RoutineTaskID *string `json:"routine_task_id,omitempty"`
	StartAt       *string `json:"start_at,omitempty"`
	Duration      *int    `json:"duration,omitempty"`
	Notes         *string `json:"notes,omitempty"`
}

type UpdateAgendaItemPayload struct {
	AgendaID string  `json:"agenda_id"`
	ItemID   string  `json:"item_id"`
	StartAt  *string `json:"start_at,omitempty"`
	Duration *int    `json:"duration,omitempty"`
	Notes    *string `json:"notes,omitempty"`
	Status   *string `json:"status,omitempty"`
}

type CompleteAgendaItemPayload struct {
	AgendaID string `json:"agenda_id"`
	ItemID   string `json:"item_id"`
}

type GetProjectPayload struct {
	ProjectID string `json:"project_id"`
}
