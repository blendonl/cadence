package daemon

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"cadence/internal/application/dto"
	"cadence/internal/infrastructure/config"
)

type Client struct {
	config       *config.Config
	subConn      net.Conn
	subMu        sync.Mutex
	notifChan    chan *Notification
	stopChan     chan struct{}
	isSubscribed bool
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		config:    cfg,
		notifChan: make(chan *Notification, 10),
		stopChan:  make(chan struct{}),
	}
}

func (c *Client) Connect() error {
	socketPath := GetSocketPath(c.config)

	conn, err := net.DialTimeout("unix", socketPath, 2*time.Second)
	if err == nil {
		conn.Close()
		return nil
	}

	if err := c.startDaemon(); err != nil {
		return fmt.Errorf("failed to start daemon: %w", err)
	}

	for i := 0; i < 10; i++ {
		time.Sleep(200 * time.Millisecond)
		conn, err = net.DialTimeout("unix", socketPath, 2*time.Second)
		if err == nil {
			conn.Close()
			return nil
		}
	}

	return fmt.Errorf("failed to connect to daemon after starting it: %w", err)
}

func (c *Client) startDaemon() error {
	daemonPath, err := exec.LookPath("cadenced")
	if err != nil {
		exePath, err := os.Executable()
		if err != nil {
			return fmt.Errorf("failed to find cadenced binary: %w", err)
		}
		exeDir := filepath.Dir(exePath)
		daemonPath = filepath.Join(exeDir, "cadenced")

		if _, err := os.Stat(daemonPath); err != nil {
			return fmt.Errorf("cadenced binary not found in PATH or %s", exeDir)
		}
	}

	cmd := exec.Command(daemonPath)
	cmd.Stdout = nil
	cmd.Stderr = nil
	cmd.Stdin = nil

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start daemon process: %w", err)
	}

	if err := cmd.Process.Release(); err != nil {
		return fmt.Errorf("failed to release daemon process: %w", err)
	}

	return nil
}

func (c *Client) Close() error {
	return c.Unsubscribe()
}

func (c *Client) sendRequest(req *Request) (*Response, error) {
	socketPath := GetSocketPath(c.config)

	conn, err := net.DialTimeout("unix", socketPath, 2*time.Second)
	if err != nil {
		if startErr := c.startDaemon(); startErr != nil {
			return nil, fmt.Errorf("failed to start daemon: %w", startErr)
		}

		for i := 0; i < 10; i++ {
			time.Sleep(200 * time.Millisecond)
			conn, err = net.DialTimeout("unix", socketPath, 2*time.Second)
			if err == nil {
				break
			}
		}
		if err != nil {
			return nil, fmt.Errorf("failed to connect to daemon: %w", err)
		}
	}
	defer conn.Close()

	if err := conn.SetWriteDeadline(time.Now().Add(5 * time.Second)); err != nil {
		return nil, fmt.Errorf("failed to set write deadline: %w", err)
	}

	encoder := json.NewEncoder(conn)
	if err := encoder.Encode(req); err != nil {
		return nil, fmt.Errorf("failed to encode request: %w", err)
	}

	if err := conn.SetReadDeadline(time.Now().Add(5 * time.Second)); err != nil {
		return nil, fmt.Errorf("failed to set read deadline: %w", err)
	}

	var resp Response
	decoder := json.NewDecoder(conn)
	if err := decoder.Decode(&resp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !resp.Success {
		return nil, fmt.Errorf("daemon error: %s", resp.Error)
	}

	return &resp, nil
}

func (c *Client) GetBoard(ctx context.Context, boardID string) (*dto.BoardDetailDto, error) {
	resp, err := c.sendRequest(&Request{
		Type:    RequestGetBoard,
		Payload: GetBoardPayload{BoardID: boardID},
	})
	if err != nil {
		return nil, err
	}

	var board dto.BoardDetailDto
	if err := c.decodeResponseData(resp.Data, &board); err != nil {
		return nil, err
	}

	return &board, nil
}

func (c *Client) ListBoards(ctx context.Context) (*dto.PaginatedResponse[dto.BoardDto], error) {
	resp, err := c.sendRequest(&Request{Type: RequestListBoards})
	if err != nil {
		return nil, err
	}

	var boards dto.PaginatedResponse[dto.BoardDto]
	if err := c.decodeResponseData(resp.Data, &boards); err != nil {
		return nil, err
	}

	return &boards, nil
}

func (c *Client) GetActiveBoard(ctx context.Context) (string, error) {
	payload := GetActiveBoardPayload{}
	if sessionName := getCurrentTmuxSession(); sessionName != "" {
		payload.SessionName = sessionName
	}

	resp, err := c.sendRequest(&Request{
		Type:    RequestGetActiveBoard,
		Payload: payload,
	})
	if err != nil {
		return "", err
	}

	var result map[string]string
	if err := c.decodeResponseData(resp.Data, &result); err != nil {
		return "", err
	}

	return result["board_id"], nil
}

func getCurrentTmuxSession() string {
	if os.Getenv("TMUX") == "" {
		return ""
	}

	cmd := exec.Command("tmux", "display-message", "-p", "#{session_name}")
	output, err := cmd.Output()
	if err != nil {
		return ""
	}

	return strings.TrimSpace(string(output))
}

func (c *Client) CreateBoard(ctx context.Context, projectID, name, description string) (*dto.BoardDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestCreateBoard,
		Payload: CreateBoardPayload{
			ProjectID:   projectID,
			Name:        name,
			Description: description,
		},
	})
	if err != nil {
		return nil, err
	}

	var board dto.BoardDto
	if err := c.decodeResponseData(resp.Data, &board); err != nil {
		return nil, err
	}

	return &board, nil
}

func (c *Client) CreateTask(ctx context.Context, title, columnID string) (*dto.TaskDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestAddTask,
		Payload: AddTaskPayload{
			Title:    title,
			ColumnID: columnID,
		},
	})
	if err != nil {
		return nil, err
	}

	var task dto.TaskDto
	if err := c.decodeResponseData(resp.Data, &task); err != nil {
		return nil, err
	}

	return &task, nil
}

func (c *Client) MoveTask(ctx context.Context, taskID, targetColumnID string) (*dto.TaskDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestMoveTask,
		Payload: MoveTaskPayload{
			TaskID:         taskID,
			TargetColumnID: targetColumnID,
		},
	})
	if err != nil {
		return nil, err
	}

	var task dto.TaskDto
	if err := c.decodeResponseData(resp.Data, &task); err != nil {
		return nil, err
	}

	return &task, nil
}

func (c *Client) UpdateTask(ctx context.Context, taskID string, fields map[string]interface{}) (*dto.TaskDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestUpdateTask,
		Payload: UpdateTaskPayload{
			TaskID: taskID,
			Fields: fields,
		},
	})
	if err != nil {
		return nil, err
	}

	var task dto.TaskDto
	if err := c.decodeResponseData(resp.Data, &task); err != nil {
		return nil, err
	}

	return &task, nil
}

func (c *Client) DeleteTask(ctx context.Context, taskID string) error {
	_, err := c.sendRequest(&Request{
		Type:    RequestDeleteTask,
		Payload: DeleteTaskPayload{TaskID: taskID},
	})
	return err
}

func (c *Client) CreateColumn(ctx context.Context, boardID, name string) error {
	_, err := c.sendRequest(&Request{
		Type: RequestAddColumn,
		Payload: AddColumnPayload{
			BoardID: boardID,
			Name:    name,
		},
	})
	return err
}

func (c *Client) DeleteColumn(ctx context.Context, boardID, columnID string) error {
	_, err := c.sendRequest(&Request{
		Type: RequestDeleteColumn,
		Payload: DeleteColumnPayload{
			BoardID:  boardID,
			ColumnID: columnID,
		},
	})
	return err
}

func (c *Client) ListNotes(ctx context.Context, projectID, noteType string) ([]dto.NoteDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestListNotes,
		Payload: ListNotesPayload{
			ProjectID: projectID,
			NoteType:  noteType,
		},
	})
	if err != nil {
		return nil, err
	}

	var notes []dto.NoteDto
	if err := c.decodeResponseData(resp.Data, &notes); err != nil {
		return nil, err
	}

	return notes, nil
}

func (c *Client) GetNote(ctx context.Context, noteID string) (*dto.NoteDto, error) {
	resp, err := c.sendRequest(&Request{
		Type:    RequestGetNote,
		Payload: GetNotePayload{NoteID: noteID},
	})
	if err != nil {
		return nil, err
	}

	var note dto.NoteDto
	if err := c.decodeResponseData(resp.Data, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) CreateNote(ctx context.Context, noteType, title, content string, tags []string) (*dto.NoteDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestCreateNote,
		Payload: CreateNotePayload{
			Type:    noteType,
			Title:   title,
			Content: content,
			Tags:    tags,
		},
	})
	if err != nil {
		return nil, err
	}

	var note dto.NoteDto
	if err := c.decodeResponseData(resp.Data, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) UpdateNote(ctx context.Context, noteID string, title, content *string, tags []string) (*dto.NoteDto, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestUpdateNote,
		Payload: UpdateNotePayload{
			NoteID:  noteID,
			Title:   title,
			Content: content,
			Tags:    tags,
		},
	})
	if err != nil {
		return nil, err
	}

	var note dto.NoteDto
	if err := c.decodeResponseData(resp.Data, &note); err != nil {
		return nil, err
	}

	return &note, nil
}

func (c *Client) DeleteNote(ctx context.Context, noteID string) error {
	_, err := c.sendRequest(&Request{
		Type:    RequestDeleteNote,
		Payload: DeleteNotePayload{NoteID: noteID},
	})
	return err
}

func (c *Client) GetAgendaView(ctx context.Context, mode, anchorDate, timezone string) (json.RawMessage, error) {
	resp, err := c.sendRequest(&Request{
		Type: RequestGetAgendaView,
		Payload: GetAgendaViewPayload{
			Mode:       mode,
			AnchorDate: anchorDate,
			Timezone:   timezone,
		},
	})
	if err != nil {
		return nil, err
	}

	data, err := json.Marshal(resp.Data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal response data: %w", err)
	}

	return data, nil
}

func (c *Client) StartTimer(ctx context.Context, projectID, taskID, description string) (*Response, error) {
	return c.sendRequest(&Request{
		Type: RequestStartTimer,
		Payload: StartTimerPayload{
			ProjectID:   projectID,
			TaskID:      taskID,
			Description: description,
		},
	})
}

func (c *Client) StopTimer(ctx context.Context, projectID, taskID string) (*Response, error) {
	return c.sendRequest(&Request{
		Type: RequestStopTimer,
		Payload: StopTimerPayload{
			ProjectID: projectID,
			TaskID:    taskID,
		},
	})
}

func (c *Client) GetActiveTimers(ctx context.Context) (*Response, error) {
	return c.sendRequest(&Request{Type: RequestGetActiveTimers})
}

func (c *Client) ListProjects(ctx context.Context) (*Response, error) {
	return c.sendRequest(&Request{Type: RequestListProjects})
}

func (c *Client) IsHealthy() bool {
	socketPath := GetSocketPath(c.config)

	if _, err := os.Stat(socketPath); os.IsNotExist(err) {
		return false
	}

	conn, err := net.DialTimeout("unix", socketPath, 1*time.Second)
	if err != nil {
		return false
	}
	conn.Close()

	return true
}

func (c *Client) Subscribe(boardID string) error {
	c.subMu.Lock()
	defer c.subMu.Unlock()

	if c.isSubscribed {
		return fmt.Errorf("already subscribed")
	}

	socketPath := GetSocketPath(c.config)

	conn, err := net.Dial("unix", socketPath)
	if err != nil {
		if err := c.startDaemon(); err != nil {
			return fmt.Errorf("failed to start daemon: %w", err)
		}

		time.Sleep(500 * time.Millisecond)
		conn, err = net.Dial("unix", socketPath)
		if err != nil {
			return fmt.Errorf("failed to connect to daemon: %w", err)
		}
	}

	c.subConn = conn

	encoder := json.NewEncoder(conn)
	decoder := json.NewDecoder(conn)

	req := &Request{
		Type:    RequestSubscribe,
		Payload: SubscribePayload{BoardID: boardID},
	}

	if err := encoder.Encode(req); err != nil {
		conn.Close()
		c.subConn = nil
		return fmt.Errorf("failed to send subscribe request: %w", err)
	}

	var resp Response
	if err := decoder.Decode(&resp); err != nil {
		conn.Close()
		c.subConn = nil
		return fmt.Errorf("failed to read subscribe response: %w", err)
	}

	if !resp.Success {
		conn.Close()
		c.subConn = nil
		return fmt.Errorf("subscription failed: %s", resp.Error)
	}

	c.isSubscribed = true
	go c.listenForNotifications(decoder)

	return nil
}

func (c *Client) listenForNotifications(decoder *json.Decoder) {
	for {
		select {
		case <-c.stopChan:
			return
		default:
			var notif Notification
			if err := decoder.Decode(&notif); err != nil {
				c.subMu.Lock()
				c.isSubscribed = false
				c.subMu.Unlock()
				return
			}

			select {
			case c.notifChan <- &notif:
			default:
			}
		}
	}
}

func (c *Client) Unsubscribe() error {
	c.subMu.Lock()
	defer c.subMu.Unlock()

	if !c.isSubscribed {
		return nil
	}

	close(c.stopChan)
	c.stopChan = make(chan struct{})

	if c.subConn != nil {
		c.subConn.Close()
		c.subConn = nil
	}

	c.isSubscribed = false
	return nil
}

func (c *Client) Notifications() <-chan *Notification {
	return c.notifChan
}

func (c *Client) SendRequest(reqType string, payload interface{}) (*Response, error) {
	return c.sendRequest(&Request{
		Type:    reqType,
		Payload: payload,
	})
}

func (c *Client) decodeResponseData(data interface{}, target interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal response data: %w", err)
	}

	if err := json.Unmarshal(jsonData, target); err != nil {
		return fmt.Errorf("failed to unmarshal response data: %w", err)
	}

	return nil
}

func (c *Client) ListProjectsTyped(ctx context.Context) (*dto.PaginatedResponse[dto.ProjectDto], error) {
	resp, err := c.sendRequest(&Request{Type: RequestListProjects})
	if err != nil {
		return nil, err
	}

	var projects dto.PaginatedResponse[dto.ProjectDto]
	if err := c.decodeResponseData(resp.Data, &projects); err != nil {
		return nil, err
	}

	return &projects, nil
}

func (c *Client) GetProject(ctx context.Context, projectID string) (*dto.ProjectDto, error) {
	resp, err := c.sendRequest(&Request{
		Type:    RequestGetProject,
		Payload: GetProjectPayload{ProjectID: projectID},
	})
	if err != nil {
		return nil, err
	}

	var project dto.ProjectDto
	if err := c.decodeResponseData(resp.Data, &project); err != nil {
		return nil, err
	}

	return &project, nil
}
