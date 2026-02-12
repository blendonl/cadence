package kanban

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"cadence/pkg/editor"
)

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case boardLoadedMsg:
		m.loading = false
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.board = msg.board
		m.boardID = msg.board.ID
		m.lastBoardID = msg.board.ID
		m.scrollOffsets = make([]int, len(m.board.Columns))
		return m, tea.Batch(
			m.subscribeToBoard(),
			m.waitForNotification(),
		)

	case NotificationMsg:
		if msg.notification.Type == "board_updated" ||
			msg.notification.Type == "task_moved" ||
			msg.notification.Type == "task_created" ||
			msg.notification.Type == "task_updated" {
			return m, m.reloadBoard()
		}
		return m, m.waitForNotification()

	case BoardUpdateMsg:
		m.board = msg.board
		if len(m.scrollOffsets) != len(m.board.Columns) {
			m.scrollOffsets = make([]int, len(m.board.Columns))
		}
		m.clampTaskFocus()
		return m, m.waitForNotification()

	case boardRefreshMsg:
		m.board = msg.board
		m.boardID = msg.board.ID
		m.lastBoardID = msg.board.ID
		if len(m.scrollOffsets) != len(m.board.Columns) {
			m.scrollOffsets = make([]int, len(m.board.Columns))
		}
		m.clampTaskFocus()
		return m, nil

	case editor.EditorFinishedMsg:
		if msg.Err != nil {
			m.err = msg.Err
			m.editingTaskID = ""
			m.addingTask = false
			m.addingColumnID = ""
			return m, nil
		}
		content := strings.TrimSpace(msg.Content)
		if content == "" {
			m.editingTaskID = ""
			m.addingTask = false
			m.addingColumnID = ""
			return m, nil
		}
		fields, err := editor.ParseTaskDoc(content)
		if err != nil {
			m.err = err
			m.editingTaskID = ""
			m.addingTask = false
			m.addingColumnID = ""
			return m, nil
		}
		if m.addingTask {
			columnID := m.addingColumnID
			m.addingTask = false
			m.addingColumnID = ""
			return m, m.createTask(fields, columnID)
		}
		if m.editingTaskID != "" {
			taskID := m.editingTaskID
			m.editingTaskID = ""
			return m, m.updateTask(taskID, fields)
		}
		return m, nil

	case taskUpdatedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		return m, m.reloadBoard()

	case taskAddedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		return m, m.reloadBoard()

	case taskMovedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		return m, m.reloadBoard()

	case taskDeletedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		return m, m.reloadBoard()

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		if m.board != nil {
			m.updateHorizontalScroll(m.calculateVisibleColumns())
		}
		return m, nil

	case tea.KeyMsg:
		if m.board == nil {
			if key.Matches(msg, key.NewBinding(key.WithKeys("r"))) {
				m.loading = true
				m.err = nil
				return m, m.loadActiveBoard()
			}
			return m, nil
		}

		switch {
		case key.Matches(msg, keys.Left):
			m.moveLeft()

		case key.Matches(msg, keys.Right):
			m.moveRight()

		case key.Matches(msg, keys.Up):
			m.moveUp()

		case key.Matches(msg, keys.Down):
			m.moveDown()

		case key.Matches(msg, keys.Move):
			return m, m.moveTask()

		case key.Matches(msg, keys.Add):
			return m, m.addTask()

		case key.Matches(msg, keys.Edit):
			return m, m.editTask()

		case key.Matches(msg, keys.Delete):
			return m, m.deleteTask()
		}
	}

	return m, nil
}

func (m *Model) moveLeft() {
	if m.focusedColumn > 0 {
		m.focusedColumn--
		m.focusedTask = 0
		m.clampTaskFocus()
		m.updateScroll(m.maxVisibleTasks())
		m.updateHorizontalScroll(m.calculateVisibleColumns())
	}
}

func (m *Model) moveRight() {
	if m.board == nil {
		return
	}
	if m.focusedColumn < len(m.board.Columns)-1 {
		m.focusedColumn++
		m.focusedTask = 0
		m.clampTaskFocus()
		m.updateScroll(m.maxVisibleTasks())
		m.updateHorizontalScroll(m.calculateVisibleColumns())
	}
}

func (m *Model) calculateVisibleColumns() int {
	const minColumnWidth = 30
	const columnSpacing = 2
	columnWidthWithSpacing := minColumnWidth + columnSpacing
	indicatorWidth := 5
	availableWidthForColumns := m.width - (indicatorWidth * 2)
	maxVisibleColumns := availableWidthForColumns / columnWidthWithSpacing
	if maxVisibleColumns < 1 {
		maxVisibleColumns = 1
	}
	return maxVisibleColumns
}

func (m *Model) moveUp() {
	if m.focusedTask > 0 {
		m.focusedTask--
		m.updateScroll(m.maxVisibleTasks())
	}
}

func (m *Model) moveDown() {
	taskCount := m.currentColumnTaskCount()
	if m.focusedTask < taskCount-1 {
		m.focusedTask++
		m.updateScroll(m.maxVisibleTasks())
	}
}

func (m *Model) clampTaskFocus() {
	taskCount := m.currentColumnTaskCount()
	if taskCount == 0 {
		m.focusedTask = 0
	} else if m.focusedTask >= taskCount {
		m.focusedTask = taskCount - 1
	}
}
