package agenda

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"

	"cadence/internal/application/dto"
)

type agendaItemCompletedMsg struct {
	err error
}

type agendaItemCreatedMsg struct {
	err error
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case agendaLoadedMsg:
		m.loading = false
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.items = msg.items
		m.err = nil
		if m.cursor >= len(m.items) {
			m.cursor = max(0, len(m.items)-1)
		}
		return m, nil

	case agendaItemCompletedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.loading = true
		return m, m.loadAgenda()

	case agendaItemCreatedMsg:
		if msg.err != nil {
			m.err = msg.err
			return m, nil
		}
		m.loading = true
		return m, m.loadAgenda()

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		return m, nil

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, key.NewBinding(key.WithKeys("j", "down"))):
			if m.cursor < len(m.items)-1 {
				m.cursor++
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("k", "up"))):
			if m.cursor > 0 {
				m.cursor--
			}
		case key.Matches(msg, key.NewBinding(key.WithKeys("n"))):
			switch m.mode {
			case "week":
				m.anchorDate = m.anchorDate.Add(7 * 24 * time.Hour)
			case "month":
				m.anchorDate = m.anchorDate.AddDate(0, 1, 0)
			default:
				m.anchorDate = m.anchorDate.Add(24 * time.Hour)
			}
			m.loading = true
			m.cursor = 0
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("p"))):
			switch m.mode {
			case "week":
				m.anchorDate = m.anchorDate.Add(-7 * 24 * time.Hour)
			case "month":
				m.anchorDate = m.anchorDate.AddDate(0, -1, 0)
			default:
				m.anchorDate = m.anchorDate.Add(-24 * time.Hour)
			}
			m.loading = true
			m.cursor = 0
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("t"))):
			m.anchorDate = time.Now()
			m.loading = true
			m.cursor = 0
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("r"))):
			m.loading = true
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("c"))):
			return m, m.completeItem()
		case key.Matches(msg, key.NewBinding(key.WithKeys("d"))):
			m.mode = "day"
			m.loading = true
			m.cursor = 0
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("w"))):
			m.mode = "week"
			m.loading = true
			m.cursor = 0
			return m, m.loadAgenda()
		case key.Matches(msg, key.NewBinding(key.WithKeys("a"))):
			m.loading = true
			return m, m.addNewTask()
		}
	}

	return m, nil
}

func (m Model) completeItem() tea.Cmd {
	if len(m.items) == 0 || m.cursor >= len(m.items) {
		return nil
	}

	item := m.items[m.cursor]
	if item.Status == dto.AgendaItemStatusCompleted {
		return nil
	}

	return func() tea.Msg {
		_, err := m.daemonClient.SendRequest("complete_agenda_item", map[string]interface{}{
			"agenda_id": item.AgendaID,
			"item_id":   item.ID,
		})
		if err != nil {
			return agendaItemCompletedMsg{err: err}
		}
		return agendaItemCompletedMsg{}
	}
}

func (m Model) addNewTask() tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()

		// Get the active board to find a column for the new task
		activeBoardID, err := m.daemonClient.GetActiveBoard(ctx)
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to get active board: %w", err)}
		}
		if activeBoardID == "" {
			return agendaItemCreatedMsg{err: fmt.Errorf("no active board found")}
		}

		// Get the board details to find the first column
		boardResp, err := m.daemonClient.SendRequest("get_board", map[string]interface{}{
			"board_id": activeBoardID,
		})
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to get board: %w", err)}
		}

		data, err := json.Marshal(boardResp.Data)
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to marshal board data: %w", err)}
		}

		var board dto.BoardDetailDto
		if err := json.Unmarshal(data, &board); err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to unmarshal board: %w", err)}
		}

		if len(board.Columns) == 0 {
			return agendaItemCreatedMsg{err: fmt.Errorf("board has no columns")}
		}

		columnID := board.Columns[0].ID

		// Create a new task in the first column
		taskResp, err := m.daemonClient.SendRequest("add_task", map[string]interface{}{
			"title":    "New Task",
			"columnId": columnID,
		})
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to create task: %w", err)}
		}

		taskData, err := json.Marshal(taskResp.Data)
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to marshal task data: %w", err)}
		}

		var task dto.TaskDto
		if err := json.Unmarshal(taskData, &task); err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to unmarshal task: %w", err)}
		}

		// Create an agenda item for this task on the current anchor date
		// The backend accepts a date string as agendaId and will auto-create the agenda
		dateStr := m.anchorDate.Format("2006-01-02")
		_, err = m.daemonClient.SendRequest("create_agenda_item", map[string]interface{}{
			"agenda_id": dateStr,
			"task_id":   task.ID,
		})
		if err != nil {
			return agendaItemCreatedMsg{err: fmt.Errorf("failed to create agenda item: %w", err)}
		}

		return agendaItemCreatedMsg{}
	}
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

