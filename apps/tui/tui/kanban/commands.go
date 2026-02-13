package kanban

import (
	"context"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"cadence/pkg/editor"
)

func checkBoardChange(m Model) tea.Cmd {
	return func() tea.Msg {
		if os.Getenv("TMUX") == "" {
			return nil
		}

		client := m.daemonClient

		if !client.IsHealthy() {
			return nil
		}

		ctx := context.Background()
		activeBoardID, err := client.GetActiveBoard(ctx)
		if err != nil || activeBoardID == "" {
			return nil
		}

		if activeBoardID != m.lastBoardID {
			board, err := fetchBoard(ctx, client, activeBoardID)
			if err != nil {
				return nil
			}
			return boardRefreshMsg{board: board}
		}

		return nil
	}
}

func (m *Model) moveTaskRight() tea.Cmd {
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

func (m *Model) moveTaskLeft() tea.Cmd {
	if m.board == nil || m.currentColumnTaskCount() == 0 {
		return nil
	}

	if m.focusedColumn <= 0 {
		return nil
	}

	taskID := m.board.Columns[m.focusedColumn].Tasks[m.focusedTask].ID
	targetColumnID := m.board.Columns[m.focusedColumn-1].ID

	m.focusedColumn--
	m.clampTaskFocus()
	m.updateHorizontalScroll(m.calculateVisibleColumns())

	client := m.daemonClient
	return func() tea.Msg {
		ctx := context.Background()
		_, err := client.MoveTask(ctx, taskID, targetColumnID)
		return taskMovedMsg{err: err}
	}
}

func (m *Model) addTask() tea.Cmd {
	if m.board == nil {
		return nil
	}

	m.addingTask = true
	m.addingColumnID = m.board.Columns[m.focusedColumn].ID
	template := editor.TaskTemplate(nil)
	return editor.OpenEditor(template, ".md", editor.HeadingLine(template))
}

func (m Model) createTask(fields *editor.TaskFields, columnID string) tea.Cmd {
	client := m.daemonClient
	return func() tea.Msg {
		ctx := context.Background()
		_, err := client.CreateTask(ctx, fields.Title, fields.Description, fields.Priority, columnID)
		return taskAddedMsg{err: err}
	}
}

func (m *Model) editTask() tea.Cmd {
	task := m.currentTask()
	if task == nil {
		return nil
	}

	m.editingTaskID = task.ID
	return editor.OpenEditor(editor.TaskTemplate(task), ".md")
}

func (m Model) updateTask(taskID string, tf *editor.TaskFields) tea.Cmd {
	return func() tea.Msg {
		fields := map[string]interface{}{
			"title": tf.Title,
		}
		if tf.Description != "" {
			fields["description"] = tf.Description
		}
		if tf.Priority != "" {
			fields["priority"] = tf.Priority
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

func (m Model) reloadBoard() tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		board, err := fetchBoard(ctx, m.daemonClient, m.boardID)
		if err != nil {
			return nil
		}

		return BoardUpdateMsg{board: board}
	}
}
