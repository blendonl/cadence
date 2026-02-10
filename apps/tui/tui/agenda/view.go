package agenda

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"

	"cadence/internal/application/dto"
)

var (
	agendaStyle = lipgloss.NewStyle().
			Padding(1, 2)

	headerStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#A8DADC"))

	modeStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#888888")).
			Bold(true)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666")).
			Italic(true)

	timeStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#A8DADC")).
			Bold(true).
			Width(7)

	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#CCCCCC"))

	completedTitleStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#666666")).
				Strikethrough(true)

	metaStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#888888")).
			Italic(true)

	statusPendingStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FFE66D"))

	statusCompletedStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#95E1D3"))

	statusSkippedStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#FF6B6B"))

	emptyStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#666666")).
			Italic(true)
)

func (m Model) View() string {
	if m.width == 0 {
		return "Loading..."
	}

	if m.loading {
		return agendaStyle.Render("Loading agenda...")
	}

	if m.err != nil {
		return agendaStyle.Render(fmt.Sprintf("Error: %v\n\nPress 'r' to retry.", m.err))
	}

	modeLabel := strings.ToUpper(m.mode)
	header := headerStyle.Render(fmt.Sprintf("Agenda — %s", m.anchorDate.Format("Monday, January 2, 2006"))) +
		"  " + modeStyle.Render(fmt.Sprintf("[%s]", modeLabel))

	contentHeight := m.height - 6
	if contentHeight < 1 {
		contentHeight = 1
	}

	var content string
	if len(m.items) == 0 {
		content = emptyStyle.Render("No agenda items for this date.")
	} else {
		content = m.renderItems(contentHeight)
	}

	help := helpStyle.Render("j/k: navigate  n/p: next/prev  t: today  r: refresh  c: complete  a: add task  d: day  w: week")

	return agendaStyle.Width(m.width - 4).Render(
		lipgloss.JoinVertical(lipgloss.Left, header, "", content, "", help),
	)
}

func (m Model) renderItems(maxHeight int) string {
	itemHeight := 3
	maxVisible := maxHeight / itemHeight
	if maxVisible < 1 {
		maxVisible = 1
	}

	startIdx := 0
	if m.cursor >= maxVisible {
		startIdx = m.cursor - maxVisible + 1
	}
	endIdx := startIdx + maxVisible
	if endIdx > len(m.items) {
		endIdx = len(m.items)
	}

	contentWidth := m.width - 8
	if contentWidth < 40 {
		contentWidth = 40
	}

	var rows []string

	for i := startIdx; i < endIdx; i++ {
		item := m.items[i]
		isSelected := i == m.cursor
		rows = append(rows, m.renderItem(item, isSelected, contentWidth))
	}

	if startIdx > 0 {
		rows = append([]string{metaStyle.Render(fmt.Sprintf("  ▲ %d more above", startIdx))}, rows...)
	}
	if endIdx < len(m.items) {
		rows = append(rows, metaStyle.Render(fmt.Sprintf("  ▼ %d more below", len(m.items)-endIdx)))
	}

	return strings.Join(rows, "\n")
}

func (m Model) renderItem(item dto.AgendaItemEnrichedDto, isSelected bool, width int) string {
	timeStr := "      "
	if item.StartAt != nil {
		t := *item.StartAt
		if len(t) >= 16 {
			timeStr = t[11:16]
		}
		timeStr = fmt.Sprintf("%-6s", timeStr)
	}

	statusIcon := getStatusIcon(item.Status)

	title := getItemTitle(item)

	var titleRendered string
	if item.Status == dto.AgendaItemStatusCompleted {
		titleRendered = completedTitleStyle.Render(title)
	} else {
		titleRendered = titleStyle.Render(title)
	}

	line1 := timeStyle.Render(timeStr) + " " + statusIcon + " " + titleRendered

	var metaParts []string
	if item.Duration != nil && *item.Duration > 0 {
		metaParts = append(metaParts, fmt.Sprintf("%dm", *item.Duration))
	}
	if item.Task != nil {
		metaParts = append(metaParts, item.Task.ProjectName+" / "+item.Task.BoardName)
		if item.Task.Priority != nil {
			metaParts = append(metaParts, *item.Task.Priority)
		}
	}
	if item.RoutineTask != nil {
		metaParts = append(metaParts, item.RoutineTask.RoutineName)
	}

	line2 := ""
	if len(metaParts) > 0 {
		line2 = metaStyle.Render("         " + strings.Join(metaParts, " · "))
	}

	var content string
	if line2 != "" {
		content = line1 + "\n" + line2
	} else {
		content = line1
	}

	cursor := "  "
	if isSelected {
		cursor = "▸ "
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("#A8DADC")).
			Render(cursor) + content
	}

	return cursor + content
}

func getStatusIcon(status string) string {
	switch status {
	case dto.AgendaItemStatusCompleted:
		return statusCompletedStyle.Render("✓")
	case dto.AgendaItemStatusSkipped:
		return statusSkippedStyle.Render("✗")
	case dto.AgendaItemStatusUnfinished:
		return statusSkippedStyle.Render("◑")
	default:
		return statusPendingStyle.Render("○")
	}
}

func getItemTitle(item dto.AgendaItemEnrichedDto) string {
	if item.Task != nil {
		return item.Task.Title
	}
	if item.RoutineTask != nil {
		return item.RoutineTask.Name
	}
	if item.Notes != nil && *item.Notes != "" {
		return *item.Notes
	}
	return "(untitled)"
}
