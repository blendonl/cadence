package notes

import (
	"encoding/json"
	"fmt"

	tea "github.com/charmbracelet/bubbletea"

	"cadence/internal/application/dto"
	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
)

type notesLoadedMsg struct {
	notes []dto.NoteDto
	err   error
}

type noteCreatedMsg struct {
	note *dto.NoteDto
	err  error
}

type noteUpdatedMsg struct {
	note *dto.NoteDto
	err  error
}

type noteDeletedMsg struct {
	err error
}

type Model struct {
	daemonClient *daemon.Client
	config       *config.Config
	notes        []dto.NoteDto
	cursor       int
	width        int
	height       int
	loading      bool
	err          error
	editingID    string
}

func NewModel(daemonClient *daemon.Client, cfg *config.Config) Model {
	return Model{
		daemonClient: daemonClient,
		config:       cfg,
		loading:      true,
	}
}

func (m Model) Init() tea.Cmd {
	return m.loadNotes()
}

func (m Model) StatusInfo() (string, string) {
	if len(m.notes) == 0 {
		return "Notes", ""
	}
	left := "Notes"
	right := fmt.Sprintf("%d/%d", m.cursor+1, len(m.notes))
	return left, right
}

func (m Model) loadNotes() tea.Cmd {
	return func() tea.Msg {
		resp, err := m.daemonClient.SendRequest("list_notes", map[string]interface{}{})
		if err != nil {
			return notesLoadedMsg{err: err}
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return notesLoadedMsg{err: err}
		}

		var notes []dto.NoteDto
		if err := json.Unmarshal(data, &notes); err != nil {
			return notesLoadedMsg{err: fmt.Errorf("failed to parse notes: %w", err)}
		}

		return notesLoadedMsg{notes: notes}
	}
}

func (m Model) createNote(title, content string) tea.Cmd {
	return func() tea.Msg {
		resp, err := m.daemonClient.SendRequest("create_note", map[string]interface{}{
			"type":    dto.NoteTypeGeneral,
			"title":   title,
			"content": content,
		})
		if err != nil {
			return noteCreatedMsg{err: err}
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return noteCreatedMsg{err: err}
		}

		var note dto.NoteDto
		if err := json.Unmarshal(data, &note); err != nil {
			return noteCreatedMsg{err: err}
		}

		return noteCreatedMsg{note: &note}
	}
}

func (m Model) updateNote(noteID, title, content string) tea.Cmd {
	return func() tea.Msg {
		resp, err := m.daemonClient.SendRequest("update_note", map[string]interface{}{
			"note_id": noteID,
			"title":   &title,
			"content": &content,
		})
		if err != nil {
			return noteUpdatedMsg{err: err}
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return noteUpdatedMsg{err: err}
		}

		var note dto.NoteDto
		if err := json.Unmarshal(data, &note); err != nil {
			return noteUpdatedMsg{err: err}
		}

		return noteUpdatedMsg{note: &note}
	}
}

func (m Model) deleteNote(noteID string) tea.Cmd {
	return func() tea.Msg {
		_, err := m.daemonClient.SendRequest("delete_note", map[string]interface{}{
			"note_id": noteID,
		})
		if err != nil {
			return noteDeletedMsg{err: err}
		}
		return noteDeletedMsg{}
	}
}
