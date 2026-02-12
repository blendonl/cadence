package kanban

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"cadence/internal/application/dto"
	"cadence/internal/daemon"
	"cadence/pkg/editor"
)

type boardRefreshMsg struct {
	board *dto.BoardDetailDto
}

type taskUpdatedMsg struct {
	err error
}

type taskAddedMsg struct {
	err error
}

type taskMovedMsg struct {
	err error
}

type taskDeletedMsg struct {
	err error
}

func checkBoardChange(m Model) tea.Cmd {
	return func() tea.Msg {
		if os.Getenv("TMUX") == "" {
			return nil
		}

		client := daemon.NewClient(m.config)

		if !client.IsHealthy() {
			return nil
		}

		ctx := context.Background()
		activeBoardID, err := client.GetActiveBoard(ctx)
		if err != nil || activeBoardID == "" {
			return nil
		}

		if activeBoardID != m.lastBoardID {
			board, err := client.GetBoard(ctx, activeBoardID)
			if err != nil {
				return nil
			}

			tasksResp, err := client.ListTasks(ctx, activeBoardID, 1, 200)
			if err != nil {
				return nil
			}

			populateBoardTasks(board, tasksResp.Items)
			return boardRefreshMsg{board: board}
		}

		return nil
	}
}

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
			return m, nil
		}
		if m.editingTaskID == "" {
			return m, nil
		}
		content := strings.TrimSpace(msg.Content)
		if content == "" {
			m.editingTaskID = ""
			return m, nil
		}
		title, description := parseTaskContent(content)
		taskID := m.editingTaskID
		m.editingTaskID = ""
		return m, m.updateTask(taskID, title, description)

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
			cmd := m.editTask()
			return m, cmd

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
		availableTaskHeight := m.height - 8
		maxVisibleTasks := availableTaskHeight / 6
		if maxVisibleTasks < 1 {
			maxVisibleTasks = 1
		}
		m.updateScroll(maxVisibleTasks)
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
		availableTaskHeight := m.height - 8
		maxVisibleTasks := availableTaskHeight / 6
		if maxVisibleTasks < 1 {
			maxVisibleTasks = 1
		}
		m.updateScroll(maxVisibleTasks)
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
		availableTaskHeight := m.height - 8
		maxVisibleTasks := availableTaskHeight / 6
		if maxVisibleTasks < 1 {
			maxVisibleTasks = 1
		}
		m.updateScroll(maxVisibleTasks)
	}
}

func (m *Model) moveDown() {
	taskCount := m.currentColumnTaskCount()
	if m.focusedTask < taskCount-1 {
		m.focusedTask++
		availableTaskHeight := m.height - 8
		maxVisibleTasks := availableTaskHeight / 6
		if maxVisibleTasks < 1 {
			maxVisibleTasks = 1
		}
		m.updateScroll(maxVisibleTasks)
	}
}

func (m *Model) moveTask() tea.Cmd {
	if m.board == nil || m.currentColumnTaskCount() == 0 {
		return nil
	}

	if m.focusedColumn >= len(m.board.Columns)-1 {
		return nil
	}

	taskID := m.board.Columns[m.focusedColumn].Tasks[m.focusedTask].ID
	targetColumnID := m.board.Columns[m.focusedColumn+1].ID

	m.focusedColumn++
	m.clampTaskFocus()
	m.updateHorizontalScroll(m.calculateVisibleColumns())

	client := m.daemonClient
	return func() tea.Msg {
		ctx := context.Background()
		_, err := client.MoveTask(ctx, taskID, targetColumnID)
		return taskMovedMsg{err: err}
	}
}

func (m Model) addTask() tea.Cmd {
	if m.board == nil {
		return nil
	}

	columnID := m.board.Columns[m.focusedColumn].ID
	client := m.daemonClient
	return func() tea.Msg {
		ctx := context.Background()
		_, err := client.CreateTask(ctx, "New Task", columnID)
		return taskAddedMsg{err: err}
	}
}

func (m Model) reloadBoard() tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		board, err := fetchBoardWithTasks(ctx, m.daemonClient, m.boardID)
		if err != nil {
			return nil
		}

		return BoardUpdateMsg{board: board}
	}
}

func (m Model) deleteTask() tea.Cmd {
	if m.currentColumnTaskCount() == 0 {
		return nil
	}

	task := m.currentTask()
	if task == nil {
		return nil
	}

	taskID := task.ID
	client := m.daemonClient
	return func() tea.Msg {
		ctx := context.Background()
		err := client.DeleteTask(ctx, taskID)
		return taskDeletedMsg{err: err}
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

func (m *Model) editTask() tea.Cmd {
	task := m.currentTask()
	if task == nil {
		return nil
	}

	m.editingTaskID = task.ID
	content := "# " + task.Title
	if task.Description != nil && *task.Description != "" {
		content += "\n\n" + *task.Description
	} else {
		content += "\n\n"
	}

	return editor.OpenEditor(content, ".md")
}

func (m Model) updateTask(taskID, title, description string) tea.Cmd {
	return func() tea.Msg {
		fields := map[string]interface{}{
			"title": title,
		}
		if description != "" {
			fields["description"] = description
		}
		_, err := m.daemonClient.SendRequest("update_task", map[string]interface{}{
			"board_id": m.board.ID,
			"task_id":  taskID,
			"fields":   fields,
		})
		if err != nil {
			return taskUpdatedMsg{err: err}
		}
		return taskUpdatedMsg{}
	}
}

func parseTaskContent(content string) (string, string) {
	lines := strings.SplitN(content, "\n", 2)
	title := strings.TrimSpace(lines[0])
	title = strings.TrimPrefix(title, "# ")
	title = strings.TrimSpace(title)

	if title == "" {
		title = "Untitled"
	}

	description := ""
	if len(lines) > 1 {
		description = strings.TrimSpace(lines[1])
	}

	return title, description
}

var _ = fmt.Sprintf
