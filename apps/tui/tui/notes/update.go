package notes

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"

	"cadence/pkg/editor"
)

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case notesLoadedMsg:
		m.loading = false
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.notes = msg.notes
		m.err = nil
		if m.cursor >= len(m.notes) && len(m.notes) > 0 {
			m.cursor = len(m.notes) - 1
		}
		return m, nil

	case noteCreatedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.loading = true
		return m, m.loadNotes()

	case noteUpdatedMsg:
		m.editingID = ""
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.loading = true
		return m, m.loadNotes()

	case noteDeletedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		if m.cursor > 0 {
			m.cursor--
		}
		m.loading = true
		return m, m.loadNotes()

	case editor.EditorFinishedMsg:
		if msg.Err != nil {
			m.err = msg.Err
			m.editingID = ""
			return m, nil
		}
		content := strings.TrimSpace(msg.Content)
		if content == "" {
			m.editingID = ""
			return m, nil
		}

		if m.editingID == "" {
			title, body := parseNoteContent(content)
			return m, m.createNote(title, body)
		}

		title, body := parseNoteContent(content)
		noteID := m.editingID
		return m, m.updateNote(noteID, title, body)

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, key.NewBinding(key.WithKeys("j", "down"))):
			if m.cursor < len(m.notes)-1 {
				m.cursor++
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("k", "up"))):
			if m.cursor > 0 {
				m.cursor--
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("a"))):
			m.editingID = ""
			return m, editor.OpenEditor("# New Note\n\n", ".md")
		case key.Matches(msg, key.NewBinding(key.WithKeys("e", "enter"))):
			if len(m.notes) > 0 && m.cursor < len(m.notes) {
				note := m.notes[m.cursor]
				m.editingID = note.ID
				content := "# " + note.Title + "\n\n" + note.Content
				return m, editor.OpenEditor(content, ".md")
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("d"))):
			if len(m.notes) > 0 && m.cursor < len(m.notes) {
				note := m.notes[m.cursor]
				return m, m.deleteNote(note.ID)
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("r"))):
			m.loading = true
			return m, m.loadNotes()
		}
	}

	return m, nil
}

func parseNoteContent(content string) (string, string) {
	lines := strings.SplitN(content, "\n", 2)
	title := strings.TrimSpace(lines[0])
	title = strings.TrimPrefix(title, "# ")
	title = strings.TrimSpace(title)

	if title == "" {
		title = "Untitled"
	}

	body := ""
	if len(lines) > 1 {
		body = strings.TrimSpace(lines[1])
	}

	return title, body
}
