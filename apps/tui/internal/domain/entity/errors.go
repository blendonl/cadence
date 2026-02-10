package entity

import "errors"

var (
	ErrSessionNotFound    = errors.New("session not found")
	ErrEmptySessionName   = errors.New("session name cannot be empty")
	ErrInvalidSessionType = errors.New("invalid session type")
	ErrEmptyWorkingDir    = errors.New("working directory cannot be empty")

	ErrTimeLogNotFound       = errors.New("time log not found")
	ErrInvalidTimeLogID      = errors.New("invalid time log ID")
	ErrEmptyProjectID        = errors.New("project ID cannot be empty")
	ErrInvalidTimeLogSource  = errors.New("invalid time log source")
	ErrTimeLogAlreadyStopped = errors.New("time log already stopped")
	ErrInvalidEndTime        = errors.New("end time must be after start time")
	ErrInvalidDuration       = errors.New("duration must be non-negative")
)
