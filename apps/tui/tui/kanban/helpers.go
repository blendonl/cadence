package kanban

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"cadence/internal/application/dto"
	"cadence/internal/infrastructure/config"
	"cadence/tui/style"
)

func getPriorityIcon(priority *string) string {
	if priority == nil {
		return "\u26AA"
	}
	switch strings.ToLower(*priority) {
	case "high", "medium", "low":
		return "\u26AB"
	default:
		return "\u26AA"
	}
}

func getPriorityColor(priority *string, cfg *config.Config) lipgloss.Color {
	priorityColors := cfg.TUI.Styles.Priority
	if priority == nil {
		return lipgloss.Color(priorityColors.Default)
	}
	switch strings.ToLower(*priority) {
	case "high":
		return lipgloss.Color(priorityColors.High)
	case "medium":
		return lipgloss.Color(priorityColors.Medium)
	case "low":
		return lipgloss.Color(priorityColors.Low)
	default:
		return lipgloss.Color(priorityColors.Default)
	}
}

func formatDueDate(dueDate *string, cfg *config.Config) (string, lipgloss.Color) {
	if dueDate == nil {
		return "", lipgloss.Color("")
	}

	dueDateColors := cfg.TUI.Styles.DueDateUrgency
	return fmt.Sprintf("Due: %s", *dueDate), lipgloss.Color(dueDateColors.Upcoming)
}

func formatTags(tags []string, maxWidth int) string {
	if len(tags) == 0 {
		return ""
	}

	prefix := "Tags: "
	availableWidth := maxWidth - len(prefix)

	if availableWidth <= 10 {
		return ""
	}

	var displayTags []string
	currentLength := 0

	for i, tag := range tags {
		tagLen := len(tag) + 2
		if currentLength+tagLen > availableWidth {
			if i == 0 {
				truncated := tag[:min(len(tag), availableWidth-3)] + "..."
				displayTags = append(displayTags, truncated)
			} else {
				remaining := len(tags) - i
				displayTags = append(displayTags, fmt.Sprintf("+%d", remaining))
			}
			break
		}
		displayTags = append(displayTags, tag)
		currentLength += tagLen
	}

	return prefix + strings.Join(displayTags, "  ")
}

func truncateDescription(desc string, maxLen int) string {
	if desc == "" {
		return ""
	}

	lines := strings.Split(desc, "\n")
	firstLine := strings.TrimSpace(lines[0])

	if firstLine == "" && len(lines) > 1 {
		firstLine = strings.TrimSpace(lines[1])
	}

	if len(firstLine) > maxLen {
		return firstLine[:maxLen-3] + "..."
	}

	return firstLine
}

func renderTaskCard(task dto.TaskDto, width int, isSelected bool, cfg *config.Config) string {
	var lines []string

	contentWidth := width - 4
	if contentWidth < 20 {
		contentWidth = 20
	}

	priorityIcon := getPriorityIcon(task.Priority)
	titleMaxWidth := contentWidth - 3
	title := task.Title
	if len(title) > titleMaxWidth {
		title = title[:titleMaxWidth-3] + "..."
	}

	priorityColor := getPriorityColor(task.Priority, cfg)
	titleLine := lipgloss.NewStyle().
		Foreground(priorityColor).
		Bold(true).
		Render(priorityIcon) + " " +
		lipgloss.NewStyle().Bold(true).Render(title)

	lines = append(lines, titleLine)

	if task.Description != nil && *task.Description != "" {
		descMaxLen := contentWidth
		desc := truncateDescription(*task.Description, descMaxLen)
		if desc != "" {
			descLine := style.DescriptionStyle.
				Width(contentWidth).
				Render(desc)
			lines = append(lines, descLine)
		}
	}

	if task.DueDate != nil {
		dueDateStr, dueDateColor := formatDueDate(task.DueDate, cfg)
		if dueDateStr != "" {
			dueDateStyle := style.DueDateStyle.Foreground(dueDateColor)
			dueLine := dueDateStyle.
				Width(contentWidth).
				Render(dueDateStr)
			lines = append(lines, dueLine)
		}
	}

	cardContent := strings.Join(lines, "\n")

	if isSelected {
		return style.SelectedTaskCardStyle.Width(width).Render(cardContent)
	}

	return style.TaskCardStyle.Width(width).Render(cardContent)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
