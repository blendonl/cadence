package dto

const (
	TaskStatusTodo       = "TODO"
	TaskStatusInProgress = "IN_PROGRESS"
	TaskStatusDone       = "DONE"
	TaskStatusBlocked    = "BLOCKED"
	TaskStatusCancelled  = "CANCELLED"

	TaskPriorityLow    = "LOW"
	TaskPriorityMedium = "MEDIUM"
	TaskPriorityHigh   = "HIGH"
	TaskPriorityUrgent = "URGENT"

	TaskTypeTask    = "TASK"
	TaskTypeSubtask = "SUBTASK"
	TaskTypeMeeting = "MEETING"

	AgendaItemStatusPending    = "PENDING"
	AgendaItemStatusCompleted  = "COMPLETED"
	AgendaItemStatusUnfinished = "UNFINISHED"
	AgendaItemStatusSkipped    = "SKIPPED"

	NoteTypeGeneral = "GENERAL"
	NoteTypeMeeting = "MEETING"
	NoteTypeDaily   = "DAILY"
	NoteTypeTask    = "TASK"
)
