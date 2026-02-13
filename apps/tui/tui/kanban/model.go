package kanban

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"cadence/internal/application/dto"
	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
)

const tasksPerPage = 10

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
	addingTask             bool
	addingColumnID         string
	columnPages            map[string]int
	columnTotals           map[string]int
	subscribed             bool
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

type columnTasksLoadedMsg struct {
	columnID string
	tasks    []dto.TaskDto
	total    int
	page     int
	err      error
}

type batchColumnTasksMsg []columnTasksLoadedMsg

const taskCardHeight = 6
const verticalChrome = 8

func NewModel(daemonClient *daemon.Client, cfg *config.Config) Model {
	return Model{
		daemonClient: daemonClient,
		config:       cfg,
		loading:      true,
		columnPages:  make(map[string]int),
		columnTotals: make(map[string]int),
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

		board, err := fetchBoard(ctx, m.daemonClient, activeBoardID)
		if err != nil {
			return boardLoadedMsg{err: err}
		}

		return boardLoadedMsg{board: board}
	}
}

func fetchBoard(ctx context.Context, client *daemon.Client, boardID string) (*dto.BoardDetailDto, error) {
	board, err := client.GetBoard(ctx, boardID)
	if err != nil {
		return nil, fmt.Errorf("failed to get board: %w", err)
	}
	return board, nil
}

func (m Model) fetchAllColumnTasks() tea.Cmd {
	if m.board == nil {
		return nil
	}

	client := m.daemonClient
	columns := m.board.Columns
	pages := m.columnPages

	return func() tea.Msg {
		ctx := context.Background()
		type result struct {
			columnID string
			tasks    []dto.TaskDto
			total    int
			page     int
			err      error
		}

		results := make([]result, len(columns))
		var wg sync.WaitGroup

		for i, col := range columns {
			wg.Add(1)
			go func(idx int, colID string) {
				defer wg.Done()
				page := pages[colID]
				if page == 0 {
					page = 1
				}
				resp, err := client.ListTasks(ctx, colID, page, tasksPerPage)
				if err != nil {
					results[idx] = result{columnID: colID, err: err}
					return
				}
				sort.Slice(resp.Items, func(a, b int) bool {
					return resp.Items[a].Position < resp.Items[b].Position
				})
				results[idx] = result{
					columnID: colID,
					tasks:    resp.Items,
					total:    resp.Total,
					page:     page,
				}
			}(i, col.ID)
		}

		wg.Wait()

		msgs := make([]columnTasksLoadedMsg, len(results))
		for i, r := range results {
			msgs[i] = columnTasksLoadedMsg{
				columnID: r.columnID,
				tasks:    r.tasks,
				total:    r.total,
				page:     r.page,
				err:      r.err,
			}
		}
		return batchColumnTasksMsg(msgs)
	}
}

func fetchColumnTasks(client *daemon.Client, columnID string, page int) tea.Cmd {
	return func() tea.Msg {
		ctx := context.Background()
		resp, err := client.ListTasks(ctx, columnID, page, tasksPerPage)
		if err != nil {
			return columnTasksLoadedMsg{columnID: columnID, err: err}
		}
		sort.Slice(resp.Items, func(a, b int) bool {
			return resp.Items[a].Position < resp.Items[b].Position
		})
		return columnTasksLoadedMsg{
			columnID: columnID,
			tasks:    resp.Items,
			total:    resp.Total,
			page:     page,
		}
	}
}

func (m *Model) applyColumnTasks(msg columnTasksLoadedMsg) {
	if msg.err != nil || m.board == nil {
		return
	}
	m.columnPages[msg.columnID] = msg.page
	m.columnTotals[msg.columnID] = msg.total
	for i := range m.board.Columns {
		if m.board.Columns[i].ID == msg.columnID {
			m.board.Columns[i].Tasks = msg.tasks
			m.board.Columns[i].TaskCount = msg.total
			break
		}
	}
}

func (m Model) columnHasMore(colIndex int) bool {
	if m.board == nil || colIndex < 0 || colIndex >= len(m.board.Columns) {
		return false
	}
	col := m.board.Columns[colIndex]
	total := m.columnTotals[col.ID]
	page := m.columnPages[col.ID]
	return page*tasksPerPage < total
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

func (m Model) maxVisibleTasks() int {
	available := m.height - verticalChrome
	visible := available / taskCardHeight
	if visible < 1 {
		visible = 1
	}
	return visible
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
