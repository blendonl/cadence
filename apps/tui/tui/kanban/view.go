package kanban

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"cadence/internal/application/dto"
	"cadence/tui/style"
)

func (m Model) View() string {
	if m.width == 0 {
		return "Loading..."
	}

	if m.loading {
		return "Loading board..."
	}

	if m.err != nil {
		return fmt.Sprintf("Error: %v\n\nPress 'r' to retry.", m.err)
	}

	if m.board == nil {
		return "No board loaded."
	}

	totalColumns := len(m.board.Columns)
	if totalColumns == 0 {
		return "No columns"
	}

	const minColumnWidth = 25
	const maxColumnWidth = 60
	const columnSpacing = 2
	const columnOverhead = 6

	indicatorWidth := 5
	availableWidthForColumns := m.width - (indicatorWidth * 2)

	var columnWidth int
	spacingNeeded := columnSpacing * (totalColumns - 1)
	minRenderedWidth := minColumnWidth + columnOverhead
	minSpaceNeeded := (minRenderedWidth * totalColumns) + spacingNeeded

	if availableWidthForColumns >= minSpaceNeeded {
		spaceForColumns := availableWidthForColumns - spacingNeeded
		proposedRenderedWidth := spaceForColumns / totalColumns
		proposedWidth := proposedRenderedWidth - columnOverhead

		if proposedWidth > maxColumnWidth {
			columnWidth = maxColumnWidth
		} else if proposedWidth < minColumnWidth {
			columnWidth = minColumnWidth
		} else {
			columnWidth = proposedWidth
		}
	} else {
		columnWidth = minColumnWidth
	}

	renderedColumnWidth := columnWidth + columnOverhead
	maxVisibleColumns := (availableWidthForColumns + columnSpacing) / (renderedColumnWidth + columnSpacing)
	if maxVisibleColumns < 1 {
		maxVisibleColumns = 1
	}
	if maxVisibleColumns > totalColumns {
		maxVisibleColumns = totalColumns
	}

	startCol := m.horizontalScrollOffset
	endCol := startCol + maxVisibleColumns
	if endCol > totalColumns {
		endCol = totalColumns
	}

	showLeftIndicator := startCol > 0
	showRightIndicator := endCol < totalColumns

	availableTaskHeight := m.height - 8

	var columnsToRender []string

	if showLeftIndicator {
		indicator := lipgloss.NewStyle().
			Foreground(lipgloss.Color("240")).
			Bold(true).
			Height(m.height - 6).
			Width(indicatorWidth).
			AlignVertical(lipgloss.Center).
			Render("\u25C4")
		columnsToRender = append(columnsToRender, indicator)
	}

	for i := startCol; i < endCol; i++ {
		col := m.board.Columns[i]
		columnsToRender = append(columnsToRender, m.renderColumn(col, i, columnWidth, availableTaskHeight))
	}

	if showRightIndicator {
		indicator := lipgloss.NewStyle().
			Foreground(lipgloss.Color("240")).
			Bold(true).
			Height(m.height - 6).
			Width(indicatorWidth).
			AlignVertical(lipgloss.Center).
			Render("\u25BA")
		columnsToRender = append(columnsToRender, indicator)
	}

	board := lipgloss.JoinHorizontal(lipgloss.Top, columnsToRender...)

	numVisibleColumns := endCol - startCol
	totalColumnWidth := (renderedColumnWidth * numVisibleColumns) + (columnSpacing * (numVisibleColumns - 1))

	if showLeftIndicator {
		totalColumnWidth += indicatorWidth
	}
	if showRightIndicator {
		totalColumnWidth += indicatorWidth
	}

	leftMargin := 0
	if totalColumnWidth < m.width {
		remainingSpace := m.width - totalColumnWidth
		leftMargin = remainingSpace / 2
	}

	if leftMargin > 0 {
		marginStyle := lipgloss.NewStyle().PaddingLeft(leftMargin)
		board = marginStyle.Render(board)
	}

	help := m.renderHelp()
	if totalColumns > maxVisibleColumns {
		scrollInfo := fmt.Sprintf("Columns: %d-%d of %d", startCol+1, endCol, totalColumns)
		help = help + "\n" + style.HelpStyle.Faint(true).Render(scrollInfo)
	}

	if leftMargin > 0 {
		marginStyle := lipgloss.NewStyle().PaddingLeft(leftMargin)
		help = marginStyle.Render(help)
	}

	return lipgloss.JoinVertical(lipgloss.Left, board, help)
}

func (m Model) renderColumn(col dto.BoardColumnDto, colIndex int, width int, viewportHeight int) string {
	isFocused := colIndex == m.focusedColumn

	title := style.ColumnTitleStyle.Width(width).Render(col.Name)

	scrollOffset := 0
	if colIndex < len(m.scrollOffsets) {
		scrollOffset = m.scrollOffsets[colIndex]
	}

	maxVisibleTasks := viewportHeight / 6
	if maxVisibleTasks < 1 {
		maxVisibleTasks = 1
	}

	totalTasks := len(col.Tasks)
	startIdx := scrollOffset
	endIdx := scrollOffset + maxVisibleTasks
	if endIdx > totalTasks {
		endIdx = totalTasks
	}

	showUpIndicator := scrollOffset > 0
	showDownIndicator := endIdx < totalTasks

	var tasks []string

	if showUpIndicator {
		indicator := style.ScrollIndicatorStyle.
			Width(width).
			Render("\u25B2 more above \u25B2")
		tasks = append(tasks, indicator)
	}

	for i := startIdx; i < endIdx; i++ {
		task := col.Tasks[i]
		isSelected := isFocused && i == m.focusedTask
		taskCard := renderTaskCard(task, width, isSelected, m.config)
		tasks = append(tasks, taskCard)
	}

	if showDownIndicator {
		indicator := style.ScrollIndicatorStyle.
			Width(width).
			Render("\u25BC more below \u25BC")
		tasks = append(tasks, indicator)
	}

	if len(col.Tasks) == 0 {
		emptyStyle := style.TaskStyle.Width(width)
		if m.config.TUI.Styles.ScrollIndicator.Foreground != "" {
			emptyStyle = emptyStyle.Foreground(lipgloss.Color(m.config.TUI.Styles.ScrollIndicator.Foreground))
		}
		tasks = append(tasks, emptyStyle.Render("(empty)"))
	}

	content := lipgloss.JoinVertical(lipgloss.Left, title, "", strings.Join(tasks, "\n"))

	if isFocused {
		return style.FocusedColumnStyle.Height(m.height - 6).Render(content)
	}
	return style.ColumnStyle.Height(m.height - 6).Render(content)
}

func (m Model) renderHelp() string {
	helpText := []string{
		"Navigation: \u2190/h,\u2192/l (columns)  \u2191/k,\u2193/j (tasks)",
		"Actions: a (add)  e (edit)  d (delete)  m/enter (move)",
	}

	return style.HelpStyle.Render(strings.Join(helpText, "  \u2022  "))
}

func (m Model) statusMessage() string {
	return fmt.Sprintf("Column: %d/%d | Task: %d/%d | Size: %dx%d",
		m.focusedColumn+1, len(m.board.Columns),
		m.focusedTask+1, m.currentColumnTaskCount(),
		m.width, m.height)
}
