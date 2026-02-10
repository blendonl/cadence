package daemon

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"sync"
	"syscall"
	"time"

	"cadence/internal/application/dto"
	"cadence/internal/domain/service"
	"cadence/internal/infrastructure/auth"
	"cadence/internal/infrastructure/config"
	"cadence/internal/infrastructure/httpclient"
)

type Server struct {
	config              *config.Config
	backendClient       *httpclient.BackendClient
	tokenStore          *auth.TokenStore
	sessionTracker      service.SessionTracker
	vcsProvider         service.VCSProvider
	changeWatcher       service.ChangeWatcher
	sessionManager      *SessionManager
	timeTrackingManager *TimeTrackingManager
	listener            net.Listener
	mu                  sync.RWMutex
	subscribers         map[string]map[net.Conn]chan *Notification
	subMu               sync.RWMutex
}

func NewServer(cfg *config.Config) (*Server, error) {
	timeout := time.Duration(cfg.Backend.Timeout) * time.Second
	client := httpclient.NewBackendClient(cfg.Backend.URL, timeout)

	tokenStore, err := auth.NewTokenStore()
	if err != nil {
		return nil, fmt.Errorf("failed to create token store: %w", err)
	}

	if token, err := tokenStore.Load(); err == nil && token != "" {
		client.SetAuthToken(token)
		fmt.Println("Auth token loaded")
	}

	return &Server{
		config:        cfg,
		backendClient: client,
		tokenStore:    tokenStore,
		subscribers:   make(map[string]map[net.Conn]chan *Notification),
	}, nil
}

func (s *Server) SetSessionTracker(st service.SessionTracker) {
	s.sessionTracker = st
}

func (s *Server) SetVCSProvider(vcs service.VCSProvider) {
	s.vcsProvider = vcs
}

func (s *Server) SetChangeWatcher(cw service.ChangeWatcher) {
	s.changeWatcher = cw
}

func (s *Server) Start() error {
	if err := s.acquireLock(); err != nil {
		return err
	}

	ctx := context.Background()

	if s.sessionTracker != nil && s.changeWatcher != nil {
		s.sessionManager = NewSessionManager(
			s.config,
			s.backendClient,
			s.sessionTracker,
			s.changeWatcher,
			s.vcsProvider,
		)

		if err := s.sessionManager.Start(ctx); err != nil {
			return fmt.Errorf("failed to start session manager: %w", err)
		}
		fmt.Println("Session tracking started")
	}

	if s.config.TimeTracking.Enabled && s.sessionTracker != nil {
		s.timeTrackingManager = NewTimeTrackingManager(
			s.config,
			s.backendClient,
			s.sessionTracker,
			s.vcsProvider,
		)

		if err := s.timeTrackingManager.Start(ctx); err != nil {
			return fmt.Errorf("failed to start time tracking: %w", err)
		}
		fmt.Println("Time tracking started")
	}

	socketDir := s.config.Daemon.SocketDir
	if err := os.MkdirAll(socketDir, 0755); err != nil {
		return fmt.Errorf("failed to create socket directory: %w", err)
	}

	socketPath := filepath.Join(socketDir, s.config.Daemon.SocketName)

	if err := os.RemoveAll(socketPath); err != nil {
		return fmt.Errorf("failed to remove existing socket: %w", err)
	}

	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		return fmt.Errorf("failed to listen on socket: %w", err)
	}

	s.listener = listener
	fmt.Printf("Daemon listening on %s\n", socketPath)

	return s.acceptConnections()
}

func (s *Server) acceptConnections() error {
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			return fmt.Errorf("failed to accept connection: %w", err)
		}

		go s.handleConnection(conn)
	}
}

func (s *Server) handleConnection(conn net.Conn) {
	defer func() {
		s.cleanupSubscriber(conn)
		conn.Close()
	}()

	decoder := json.NewDecoder(conn)
	encoder := json.NewEncoder(conn)

	for {
		var req Request
		if err := decoder.Decode(&req); err != nil {
			return
		}

		if req.Type == RequestSubscribe {
			s.handleSubscribe(conn, encoder, &req)
			return
		}

		resp := s.handleRequest(&req)
		if err := encoder.Encode(resp); err != nil {
			return
		}

		if req.Type != RequestUnsubscribe && req.Type != RequestPing {
			return
		}
	}
}

func (s *Server) handleRequest(req *Request) *Response {
	ctx := context.Background()

	switch req.Type {
	case RequestGetBoard:
		return s.handleGetBoard(ctx, req)
	case RequestListBoards:
		return s.handleListBoards(ctx)
	case RequestCreateBoard:
		return s.handleCreateBoard(ctx, req)
	case RequestAddTask:
		return s.handleAddTask(ctx, req)
	case RequestMoveTask:
		return s.handleMoveTask(ctx, req)
	case RequestUpdateTask:
		return s.handleUpdateTask(ctx, req)
	case RequestDeleteTask:
		return s.handleDeleteTask(ctx, req)
	case RequestAddColumn:
		return s.handleAddColumn(ctx, req)
	case RequestDeleteColumn:
		return s.handleDeleteColumn(ctx, req)
	case RequestGetActiveBoard:
		return s.handleGetActiveBoard(ctx, req)
	case RequestPing:
		return &Response{Success: true, Data: "pong"}

	case RequestStartTimer:
		return s.handleStartTimer(ctx, req)
	case RequestStopTimer:
		return s.handleStopTimer(ctx, req)
	case RequestGetActiveTimers:
		return s.handleGetActiveTimers(ctx)

	case RequestListProjects:
		return s.handleListProjects(ctx)
	case RequestGetProject:
		return s.handleGetProject(ctx, req)

	case RequestListNotes:
		return s.handleListNotes(ctx, req)
	case RequestGetNote:
		return s.handleGetNote(ctx, req)
	case RequestCreateNote:
		return s.handleCreateNote(ctx, req)
	case RequestUpdateNote:
		return s.handleUpdateNote(ctx, req)
	case RequestDeleteNote:
		return s.handleDeleteNote(ctx, req)

	case RequestGetAgendaView:
		return s.handleGetAgendaView(ctx, req)
	case RequestCreateAgendaItem:
		return s.handleCreateAgendaItem(ctx, req)
	case RequestUpdateAgendaItem:
		return s.handleUpdateAgendaItem(ctx, req)
	case RequestCompleteAgendaItem:
		return s.handleCompleteAgendaItem(ctx, req)

	case RequestReloadToken:
		return s.handleReloadToken()

	default:
		return &Response{
			Success: false,
			Error:   fmt.Sprintf("unknown request type: %s", req.Type),
		}
	}
}

func (s *Server) handleGetBoard(ctx context.Context, req *Request) *Response {
	var payload GetBoardPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	board, err := s.backendClient.GetBoard(ctx, payload.BoardID)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: board}
}

func (s *Server) handleListBoards(ctx context.Context) *Response {
	boards, err := s.backendClient.ListBoards(ctx, 1, 100, "", "")
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: boards}
}

func (s *Server) handleCreateBoard(ctx context.Context, req *Request) *Response {
	var payload CreateBoardPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	createReq := dto.BoardCreateRequest{
		Name:      payload.Name,
		ProjectID: payload.ProjectID,
	}
	desc := payload.Description
	if desc != "" {
		createReq.Description = &desc
	}

	board, err := s.backendClient.CreateBoard(ctx, createReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: board}
}

func (s *Server) handleAddTask(ctx context.Context, req *Request) *Response {
	var payload AddTaskPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	createReq := dto.TaskCreateRequest{
		Title:    payload.Title,
		ColumnID: payload.ColumnID,
	}

	task, err := s.backendClient.CreateTask(ctx, createReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	s.notifySubscribers(task.BoardID, &Notification{
		Type:    NotificationTaskCreated,
		BoardID: task.BoardID,
		Data:    task,
	})

	return &Response{Success: true, Data: task}
}

func (s *Server) handleMoveTask(ctx context.Context, req *Request) *Response {
	var payload MoveTaskPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	moveReq := dto.TaskMoveRequest{
		TargetColumnID: payload.TargetColumnID,
	}

	task, err := s.backendClient.MoveTask(ctx, payload.TaskID, moveReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	s.notifySubscribers(task.BoardID, &Notification{
		Type:    NotificationTaskMoved,
		BoardID: task.BoardID,
		Data:    task,
	})

	return &Response{Success: true, Data: task}
}

func (s *Server) handleUpdateTask(ctx context.Context, req *Request) *Response {
	var payload UpdateTaskPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	updateReq := dto.TaskUpdateRequest{}
	if v, ok := payload.Fields["title"]; ok {
		if str, ok := v.(string); ok {
			updateReq.Title = &str
		}
	}
	if v, ok := payload.Fields["description"]; ok {
		if str, ok := v.(string); ok {
			updateReq.Description = &str
		}
	}
	if v, ok := payload.Fields["priority"]; ok {
		if str, ok := v.(string); ok {
			updateReq.Priority = &str
		}
	}
	if v, ok := payload.Fields["status"]; ok {
		if str, ok := v.(string); ok {
			updateReq.Status = &str
		}
	}

	task, err := s.backendClient.UpdateTask(ctx, payload.TaskID, updateReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	s.notifySubscribers(task.BoardID, &Notification{
		Type:    NotificationTaskUpdated,
		BoardID: task.BoardID,
		Data:    task,
	})

	return &Response{Success: true, Data: task}
}

func (s *Server) handleDeleteTask(ctx context.Context, req *Request) *Response {
	var payload DeleteTaskPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	if err := s.backendClient.DeleteTask(ctx, payload.TaskID); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: "task deleted"}
}

func (s *Server) handleAddColumn(ctx context.Context, req *Request) *Response {
	var payload AddColumnPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	createReq := dto.ColumnCreateRequest{
		Name:    payload.Name,
		BoardID: payload.BoardID,
	}

	col, err := s.backendClient.CreateColumn(ctx, createReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: col}
}

func (s *Server) handleDeleteColumn(ctx context.Context, req *Request) *Response {
	var payload DeleteColumnPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	if err := s.backendClient.DeleteColumn(ctx, payload.ColumnID); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: "column deleted"}
}

func (s *Server) handleGetActiveBoard(ctx context.Context, req *Request) *Response {
	if s.sessionManager == nil {
		return &Response{Success: false, Error: "session tracking not available"}
	}

	activeSession := s.sessionManager.GetActiveSession()
	if activeSession == nil {
		return &Response{Success: true, Data: map[string]string{"board_id": ""}}
	}

	boardID, _ := activeSession.GetMetadata("board_id")
	return &Response{Success: true, Data: map[string]string{"board_id": boardID}}
}

func (s *Server) handleStartTimer(ctx context.Context, req *Request) *Response {
	if s.timeTrackingManager == nil {
		return &Response{Success: false, Error: "time tracking not available"}
	}

	var payload StartTimerPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	log, err := s.timeTrackingManager.StartTimer(ctx, payload.ProjectID, payload.TaskID, payload.Description)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: map[string]interface{}{
		"id":         log.ID(),
		"project_id": log.ProjectID(),
		"start_time": log.StartTime(),
		"running":    log.IsRunning(),
	}}
}

func (s *Server) handleStopTimer(ctx context.Context, req *Request) *Response {
	if s.timeTrackingManager == nil {
		return &Response{Success: false, Error: "time tracking not available"}
	}

	var payload StopTimerPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	log, err := s.timeTrackingManager.StopTimer(ctx, payload.ProjectID, payload.TaskID)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: map[string]interface{}{
		"id":         log.ID(),
		"project_id": log.ProjectID(),
		"start_time": log.StartTime(),
		"end_time":   log.EndTime(),
		"duration":   log.Duration().Seconds(),
	}}
}

func (s *Server) handleGetActiveTimers(ctx context.Context) *Response {
	if s.timeTrackingManager == nil {
		return &Response{Success: false, Error: "time tracking not available"}
	}

	timers := s.timeTrackingManager.GetActiveTimers()
	result := make([]map[string]interface{}, 0, len(timers))

	for _, t := range timers {
		entry := map[string]interface{}{
			"id":         t.ID(),
			"project_id": t.ProjectID(),
			"source":     t.Source().String(),
			"start_time": t.StartTime(),
			"duration":   t.Duration().Seconds(),
		}
		if t.TaskID() != "" {
			entry["task_id"] = t.TaskID()
		}
		result = append(result, entry)
	}

	return &Response{Success: true, Data: result}
}

func (s *Server) handleListProjects(ctx context.Context) *Response {
	projects, err := s.backendClient.ListProjects(ctx, 1, 100)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: projects}
}

func (s *Server) handleGetProject(ctx context.Context, req *Request) *Response {
	var payload struct {
		ProjectID string `json:"project_id"`
	}
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	project, err := s.backendClient.GetProject(ctx, payload.ProjectID)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: project}
}

func (s *Server) handleListNotes(ctx context.Context, req *Request) *Response {
	var payload ListNotesPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	notes, err := s.backendClient.ListNotes(ctx, payload.ProjectID, payload.NoteType)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: notes}
}

func (s *Server) handleGetNote(ctx context.Context, req *Request) *Response {
	var payload GetNotePayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	note, err := s.backendClient.GetNote(ctx, payload.NoteID)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: note}
}

func (s *Server) handleCreateNote(ctx context.Context, req *Request) *Response {
	var payload CreateNotePayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	createReq := dto.NoteCreateRequest{
		Type:    payload.Type,
		Title:   payload.Title,
		Content: payload.Content,
		Tags:    payload.Tags,
	}

	note, err := s.backendClient.CreateNote(ctx, createReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: note}
}

func (s *Server) handleUpdateNote(ctx context.Context, req *Request) *Response {
	var payload UpdateNotePayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	updateReq := dto.NoteUpdateRequest{
		Title:   payload.Title,
		Content: payload.Content,
		Tags:    payload.Tags,
	}

	note, err := s.backendClient.UpdateNote(ctx, payload.NoteID, updateReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: note}
}

func (s *Server) handleDeleteNote(ctx context.Context, req *Request) *Response {
	var payload DeleteNotePayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	if err := s.backendClient.DeleteNote(ctx, payload.NoteID); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: "note deleted"}
}

func (s *Server) handleGetAgendaView(ctx context.Context, req *Request) *Response {
	var payload GetAgendaViewPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	view, err := s.backendClient.GetAgendaView(ctx, payload.Mode, payload.AnchorDate, payload.Timezone)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: view}
}

func (s *Server) handleCreateAgendaItem(ctx context.Context, req *Request) *Response {
	var payload CreateAgendaItemPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	createReq := dto.AgendaItemCreateRequest{
		TaskID:        payload.TaskID,
		RoutineTaskID: payload.RoutineTaskID,
		StartAt:       payload.StartAt,
		Duration:      payload.Duration,
		Notes:         payload.Notes,
	}

	item, err := s.backendClient.CreateAgendaItem(ctx, payload.AgendaID, createReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: item}
}

func (s *Server) handleUpdateAgendaItem(ctx context.Context, req *Request) *Response {
	var payload UpdateAgendaItemPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	updateReq := dto.AgendaItemUpdateRequest{
		StartAt:  payload.StartAt,
		Duration: payload.Duration,
		Notes:    payload.Notes,
		Status:   payload.Status,
	}

	item, err := s.backendClient.UpdateAgendaItem(ctx, payload.AgendaID, payload.ItemID, updateReq)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: item}
}

func (s *Server) handleCompleteAgendaItem(ctx context.Context, req *Request) *Response {
	var payload CompleteAgendaItemPayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	item, err := s.backendClient.CompleteAgendaItem(ctx, payload.AgendaID, payload.ItemID)
	if err != nil {
		return &Response{Success: false, Error: err.Error()}
	}

	return &Response{Success: true, Data: item}
}

func (s *Server) handleReloadToken() *Response {
	token, err := s.tokenStore.Load()
	if err != nil {
		return &Response{Success: false, Error: fmt.Sprintf("failed to load token: %v", err)}
	}

	s.backendClient.SetAuthToken(token)
	return &Response{Success: true, Data: "token reloaded"}
}

func (s *Server) decodePayload(payload interface{}, target interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	return nil
}

func (s *Server) Stop() error {
	if s.timeTrackingManager != nil {
		if err := s.timeTrackingManager.Stop(); err != nil {
			fmt.Printf("Error stopping time tracking manager: %v\n", err)
		}
	}

	if s.sessionManager != nil {
		if err := s.sessionManager.Stop(); err != nil {
			fmt.Printf("Error stopping session manager: %v\n", err)
		}
	}

	s.releaseLock()

	if s.listener != nil {
		return s.listener.Close()
	}
	return nil
}

func (s *Server) lockFilePath() string {
	return filepath.Join(s.config.Daemon.SocketDir, "cadence.pid")
}

func (s *Server) acquireLock() error {
	lockPath := s.lockFilePath()

	if err := os.MkdirAll(s.config.Daemon.SocketDir, 0755); err != nil {
		return fmt.Errorf("failed to create socket directory: %w", err)
	}

	data, err := os.ReadFile(lockPath)
	if err == nil {
		var pid int
		if _, err := fmt.Sscanf(string(data), "%d", &pid); err == nil {
			if s.isProcessRunning(pid) {
				return fmt.Errorf("daemon already running (pid %d)", pid)
			}
		}
		os.Remove(lockPath)
	}

	pid := os.Getpid()
	if err := os.WriteFile(lockPath, []byte(fmt.Sprintf("%d", pid)), 0644); err != nil {
		return fmt.Errorf("failed to write lock file: %w", err)
	}

	return nil
}

func (s *Server) releaseLock() {
	os.Remove(s.lockFilePath())
}

func (s *Server) isProcessRunning(pid int) bool {
	process, err := os.FindProcess(pid)
	if err != nil {
		return false
	}
	err = process.Signal(syscall.Signal(0))
	return err == nil
}

func GetSocketPath(cfg *config.Config) string {
	return filepath.Join(cfg.Daemon.SocketDir, cfg.Daemon.SocketName)
}

func (s *Server) handleSubscribe(conn net.Conn, encoder *json.Encoder, req *Request) {
	var payload SubscribePayload
	if err := s.decodePayload(req.Payload, &payload); err != nil {
		encoder.Encode(&Response{Success: false, Error: err.Error()})
		return
	}

	notifChan := make(chan *Notification, 10)

	s.subMu.Lock()
	if _, exists := s.subscribers[payload.BoardID]; !exists {
		s.subscribers[payload.BoardID] = make(map[net.Conn]chan *Notification)
	}
	s.subscribers[payload.BoardID][conn] = notifChan
	s.subMu.Unlock()

	resp := &Response{Success: true, Data: "subscribed"}
	if err := encoder.Encode(resp); err != nil {
		s.cleanupSubscriber(conn)
		return
	}

	for notification := range notifChan {
		if err := encoder.Encode(notification); err != nil {
			s.cleanupSubscriber(conn)
			return
		}
	}
}

func (s *Server) notifySubscribers(boardID string, notification *Notification) {
	s.subMu.RLock()
	defer s.subMu.RUnlock()

	subscribers, exists := s.subscribers[boardID]
	if !exists {
		return
	}

	for _, ch := range subscribers {
		select {
		case ch <- notification:
		default:
		}
	}
}

func (s *Server) cleanupSubscriber(conn net.Conn) {
	s.subMu.Lock()
	defer s.subMu.Unlock()

	for boardID, subscribers := range s.subscribers {
		if ch, exists := subscribers[conn]; exists {
			close(ch)
			delete(subscribers, conn)

			if len(subscribers) == 0 {
				delete(s.subscribers, boardID)
			}
		}
	}
}
