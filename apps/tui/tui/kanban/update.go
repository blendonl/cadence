package kanban

import (
	"context"
	"encoding/json"
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
			resp, err := client.SendRequest("get_board", map[string]interface{}{
				"board_id": activeBoardID,
			})
			if err != nil {
				return nil
			}

			data, err := json.Marshal(resp.Data)
			if err != nil {
				return nil
			}

			var board dto.BoardDetailDto
			if err := json.Unmarshal(data, &board); err != nil {
				return nil
			}

			return boardRefreshMsg{board: &board}
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
		if msg.notification.Type == "board_updated" || msg.notification.Type == "task_moved" {
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
			m.moveTask()

		case key.Matches(msg, keys.Add):
			m.addTask()

		case key.Matches(msg, keys.Edit):
			return m, m.editTask()

		case key.Matches(msg, keys.Delete):
			m.deleteTask()
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

func (m *Model) moveTask() {
	if m.board == nil || m.currentColumnTaskCount() == 0 {
		return
	}

	if m.focusedColumn >= len(m.board.Columns)-1 {
		return
	}

	task := m.board.Columns[m.focusedColumn].Tasks[m.focusedTask]
	targetColumnID := m.board.Columns[m.focusedColumn+1].ID

	resp, err := m.daemonClient.SendRequest("move_task", map[string]interface{}{
		"board_id":         m.board.ID,
		"task_id":          task.ID,
		"target_column_id": targetColumnID,
	})
	if err != nil {
		return
	}

	data, jsonErr := json.Marshal(resp.Data)
	if jsonErr != nil {
		return
	}

	var updatedBoard dto.BoardDetailDto
	if jsonErr := json.Unmarshal(data, &updatedBoard); jsonErr != nil {
		return
	}

	m.board = &updatedBoard

	if len(m.scrollOffsets) != len(m.board.Columns) {
		m.scrollOffsets = make([]int, len(m.board.Columns))
	}

	m.focusedColumn++
	m.focusedTask = len(m.board.Columns[m.focusedColumn].Tasks) - 1
	m.clampTaskFocus()

	availableTaskHeight := m.height - 8
	maxVisibleTasks := availableTaskHeight / 6
	if maxVisibleTasks < 1 {
		maxVisibleTasks = 1
	}
	m.updateScroll(maxVisibleTasks)
	m.updateHorizontalScroll(m.calculateVisibleColumns())
}

func (m *Model) addTask() {
	if m.board == nil {
		return
	}

	columnID := m.board.Columns[m.focusedColumn].ID

	resp, err := m.daemonClient.SendRequest("add_task", map[string]interface{}{
		"board_id": m.board.ID,
		"task": map[string]interface{}{
			"title":       "New Task",
			"description": nil,
			"columnId":    columnID,
		},
	})
	if err != nil {
		return
	}

	// Reload the board to get updated state
	reloadResp, err := m.daemonClient.SendRequest("get_board", map[string]interface{}{
		"board_id": m.board.ID,
	})
	if err != nil {
		return
	}

	data, err := json.Marshal(reloadResp.Data)
	if err != nil {
		return
	}

	var updatedBoard dto.BoardDetailDto
	if err := json.Unmarshal(data, &updatedBoard); err != nil {
		return
	}

	_ = resp

	m.board = &updatedBoard

	if len(m.scrollOffsets) != len(m.board.Columns) {
		m.scrollOffsets = make([]int, len(m.board.Columns))
	}

	m.focusedTask = len(m.board.Columns[m.focusedColumn].Tasks) - 1

	availableTaskHeight := m.height - 8
	maxVisibleTasks := availableTaskHeight / 6
	if maxVisibleTasks < 1 {
		maxVisibleTasks = 1
	}
	m.updateScroll(maxVisibleTasks)
}

func (m Model) reloadBoard() tea.Cmd {
	return func() tea.Msg {
		resp, err := m.daemonClient.SendRequest("get_board", map[string]interface{}{
			"board_id": m.boardID,
		})
		if err != nil {
			return nil
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return nil
		}

		var board dto.BoardDetailDto
		if err := json.Unmarshal(data, &board); err != nil {
			return nil
		}

		return BoardUpdateMsg{board: &board}
	}
}

func (m *Model) deleteTask() {
	if m.currentColumnTaskCount() == 0 {
		return
	}

	task := m.currentTask()
	if task == nil {
		return
	}

	_, err := m.daemonClient.SendRequest("delete_task", map[string]interface{}{
		"board_id": m.board.ID,
		"task_id":  task.ID,
	})
	if err != nil {
		return
	}

	// Reload the board
	resp, err := m.daemonClient.SendRequest("get_board", map[string]interface{}{
		"board_id": m.board.ID,
	})
	if err != nil {
		return
	}

	data, err := json.Marshal(resp.Data)
	if err != nil {
		return
	}

	var updatedBoard dto.BoardDetailDto
	if err := json.Unmarshal(data, &updatedBoard); err != nil {
		return
	}

	m.board = &updatedBoard
	if len(m.scrollOffsets) != len(m.board.Columns) {
		m.scrollOffsets = make([]int, len(m.board.Columns))
	}

	m.clampTaskFocus()
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
