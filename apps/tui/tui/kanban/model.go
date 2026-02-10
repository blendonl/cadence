package kanban

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"cadence/internal/application/dto"
	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
)

type Model struct {
	board                  *dto.BoardDetailDto
	daemonClient           *daemon.Client
	config                 *config.Config
	boardID                string
	focusedColumn          int
	focusedTask            int
	scrollOffsets          []int
	horizontalScrollOffset int
	width                  int
	height                 int
	lastBoardID            string
	loading                bool
	err                    error
	editingTaskID          string
}

type BoardUpdateMsg struct {
	board *dto.BoardDetailDto
}

type NotificationMsg struct {
	notification *daemon.Notification
}

type boardLoadedMsg struct {
	board *dto.BoardDetailDto
	err   error
}

type tickMsg time.Time

func NewModel(daemonClient *daemon.Client, cfg *config.Config) Model {
	return Model{
		daemonClient: daemonClient,
		config:       cfg,
		loading:      true,
	}
}

func doTick() tea.Cmd {
	return tea.Tick(time.Second*2, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

func (m Model) Init() tea.Cmd {
	return m.loadActiveBoard()
}

func (m Model) loadActiveBoard() tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		activeBoardID, err := m.daemonClient.GetActiveBoard(ctx)
		if err != nil {
			return boardLoadedMsg{err: fmt.Errorf("failed to get active board: %w", err)}
		}

		if activeBoardID == "" {
			return boardLoadedMsg{err: fmt.Errorf("no active board found")}
		}

		resp, err := m.daemonClient.SendRequest("get_board", map[string]interface{}{
			"board_id": activeBoardID,
		})
		if err != nil {
			return boardLoadedMsg{err: fmt.Errorf("failed to get board: %w", err)}
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return boardLoadedMsg{err: fmt.Errorf("failed to marshal board data: %w", err)}
		}

		var board dto.BoardDetailDto
		if err := json.Unmarshal(data, &board); err != nil {
			return boardLoadedMsg{err: fmt.Errorf("failed to unmarshal board: %w", err)}
		}

		return boardLoadedMsg{board: &board}
	}
}

func (m Model) subscribeToBoard() tea.Cmd {
	return func() tea.Msg {
		if err := m.daemonClient.Subscribe(m.boardID); err != nil {
			return nil
		}
		return nil
	}
}

func (m Model) waitForNotification() tea.Cmd {
	return func() tea.Msg {
		notif := <-m.daemonClient.Notifications()
		return NotificationMsg{notification: notif}
	}
}

func (m Model) currentColumnTaskCount() int {
	if m.board == nil || m.focusedColumn < 0 || m.focusedColumn >= len(m.board.Columns) {
		return 0
	}
	return len(m.board.Columns[m.focusedColumn].Tasks)
}

func (m Model) currentTask() *dto.TaskDto {
	count := m.currentColumnTaskCount()
	if count == 0 || m.focusedTask < 0 || m.focusedTask >= count {
		return nil
	}
	task := m.board.Columns[m.focusedColumn].Tasks[m.focusedTask]
	return &task
}

func (m Model) currentScrollOffset() int {
	if m.focusedColumn < 0 || m.focusedColumn >= len(m.scrollOffsets) {
		return 0
	}
	return m.scrollOffsets[m.focusedColumn]
}

func (m *Model) updateScroll(viewportHeight int) {
	if m.focusedColumn < 0 || m.focusedColumn >= len(m.scrollOffsets) {
		return
	}

	taskCount := m.currentColumnTaskCount()
	if taskCount == 0 {
		m.scrollOffsets[m.focusedColumn] = 0
		return
	}

	scrollOffset := m.scrollOffsets[m.focusedColumn]

	if m.focusedTask < scrollOffset {
		m.scrollOffsets[m.focusedColumn] = m.focusedTask
	} else if m.focusedTask >= scrollOffset+viewportHeight {
		m.scrollOffsets[m.focusedColumn] = m.focusedTask - viewportHeight + 1
	}

	maxScroll := taskCount - viewportHeight
	if maxScroll < 0 {
		maxScroll = 0
	}
	if m.scrollOffsets[m.focusedColumn] > maxScroll {
		m.scrollOffsets[m.focusedColumn] = maxScroll
	}
	if m.scrollOffsets[m.focusedColumn] < 0 {
		m.scrollOffsets[m.focusedColumn] = 0
	}
}

func (m Model) StatusInfo() (string, string) {
	if m.board == nil {
		return "", ""
	}
	left := fmt.Sprintf("%s / %s", m.board.ProjectName, m.board.Name)
	right := fmt.Sprintf("Col %d/%d  Task %d/%d",
		m.focusedColumn+1, len(m.board.Columns),
		m.focusedTask+1, m.currentColumnTaskCount())
	return left, right
}

func (m *Model) updateHorizontalScroll(visibleColumns int) {
	if visibleColumns <= 0 {
		visibleColumns = 1
	}

	if m.board == nil {
		m.horizontalScrollOffset = 0
		return
	}

	totalColumns := len(m.board.Columns)
	if totalColumns == 0 {
		m.horizontalScrollOffset = 0
		return
	}

	if m.focusedColumn < m.horizontalScrollOffset {
		m.horizontalScrollOffset = m.focusedColumn
	} else if m.focusedColumn >= m.horizontalScrollOffset+visibleColumns {
		m.horizontalScrollOffset = m.focusedColumn - visibleColumns + 1
	}

	maxScroll := totalColumns - visibleColumns
	if maxScroll < 0 {
		maxScroll = 0
	}
	if m.horizontalScrollOffset > maxScroll {
		m.horizontalScrollOffset = maxScroll
	}
	if m.horizontalScrollOffset < 0 {
		m.horizontalScrollOffset = 0
	}
}
