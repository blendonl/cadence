package notes

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	noteListStyle = lipgloss.NewStyle().
			Padding(1, 2)

	noteItemStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#CCCCCC"))

	selectedNoteStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#A8DADC")).
				Bold(true)

	notePreviewStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#888888")).
				Padding(1, 2).
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("#444444"))

	noteTagStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#A8DADC")).
			Italic(true)

	noteMetaStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666"))

	noteHelpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666")).
			Italic(true)
)

func (m Model) View() string {
	if m.width == 0 {
		return "Loading..."
	}

	if m.loading {
		return noteListStyle.Render("Loading notes...")
	}

	if m.err != nil {
		return noteListStyle.Render(fmt.Sprintf("Error: %v\n\nPress 'r' to retry.", m.err))
	}

	if len(m.notes) == 0 {
		help := noteHelpStyle.Render("a: new note  r: refresh")
		return noteListStyle.Render("No notes found.\n\n" + help)
	}

	listWidth := m.width / 3
	if listWidth < 20 {
		listWidth = 20
	}
	previewWidth := m.width - listWidth - 6

	maxVisible := m.height - 6
	if maxVisible < 1 {
		maxVisible = 1
	}

	startIdx := 0
	if m.cursor >= maxVisible {
		startIdx = m.cursor - maxVisible + 1
	}
	endIdx := startIdx + maxVisible
	if endIdx > len(m.notes) {
		endIdx = len(m.notes)
	}

	var listItems []string
	for i := startIdx; i < endIdx; i++ {
		note := m.notes[i]
		prefix := "  "
		style := noteItemStyle
		if i == m.cursor {
			prefix = "▸ "
			style = selectedNoteStyle
		}
		title := note.Title
		if len(title) > listWidth-4 {
			title = title[:listWidth-7] + "..."
		}

		line := style.Render(prefix + title)
		if note.Type != "GENERAL" {
			line += " " + noteMetaStyle.Render("["+note.Type+"]")
		}
		listItems = append(listItems, line)
	}

	if startIdx > 0 {
		listItems = append([]string{noteMetaStyle.Render(fmt.Sprintf("  ▲ %d more", startIdx))}, listItems...)
	}
	if endIdx < len(m.notes) {
		listItems = append(listItems, noteMetaStyle.Render(fmt.Sprintf("  ▼ %d more", len(m.notes)-endIdx)))
	}

	counter := noteMetaStyle.Render(fmt.Sprintf("  %d/%d notes", m.cursor+1, len(m.notes)))
	listItems = append(listItems, "", counter)

	list := noteListStyle.Width(listWidth).Render(strings.Join(listItems, "\n"))

	var preview string
	if m.cursor < len(m.notes) {
		note := m.notes[m.cursor]
		content := note.Content
		maxPreviewLen := previewWidth * (m.height - 6)
		if maxPreviewLen > 0 && len(content) > maxPreviewLen {
			content = content[:maxPreviewLen] + "..."
		}

		var previewParts []string
		previewParts = append(previewParts, lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("#A8DADC")).Render(note.Title))

		if len(note.Tags) > 0 {
			previewParts = append(previewParts, noteTagStyle.Render("Tags: "+strings.Join(note.Tags, ", ")))
		}

		previewParts = append(previewParts, noteMetaStyle.Render(note.UpdatedAt))
		previewParts = append(previewParts, "")
		previewParts = append(previewParts, content)

		preview = notePreviewStyle.Width(previewWidth).Height(m.height - 4).Render(
			strings.Join(previewParts, "\n"),
		)
	}

	content := lipgloss.JoinHorizontal(lipgloss.Top, list, preview)
	help := noteHelpStyle.Render("  j/k: navigate  a: new  e/enter: edit  d: delete  r: refresh")

	return lipgloss.JoinVertical(lipgloss.Left, content, help)
}
