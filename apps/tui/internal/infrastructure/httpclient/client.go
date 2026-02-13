package httpclient

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"cadence/internal/application/dto"
)

type BackendClient struct {
	baseURL    string
	httpClient *http.Client
	authToken  string
}

func NewBackendClient(baseURL string, timeout time.Duration) *BackendClient {
	return &BackendClient{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: timeout},
	}
}

func (c *BackendClient) SetAuthToken(token string) {
	c.authToken = token
}

func (c *BackendClient) ListProjects(ctx context.Context, page, limit int) (*dto.PaginatedResponse[dto.ProjectDto], error) {
	q := url.Values{}
	q.Set("page", fmt.Sprintf("%d", page))
	q.Set("limit", fmt.Sprintf("%d", limit))
	var result dto.PaginatedResponse[dto.ProjectDto]
	if err := c.doGet(ctx, "/projects", q, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) GetProject(ctx context.Context, id string) (*dto.ProjectDto, error) {
	var result dto.ProjectDto
	if err := c.doGet(ctx, fmt.Sprintf("/projects/%s", id), nil, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CreateProject(ctx context.Context, req dto.ProjectCreateRequest) (*dto.ProjectDto, error) {
	var result dto.ProjectDto
	if err := c.doPost(ctx, "/projects", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) GetBoard(ctx context.Context, id string) (*dto.BoardDetailDto, error) {
	var result dto.BoardDetailDto
	if err := c.doGet(ctx, fmt.Sprintf("/boards/%s", id), nil, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) ListBoards(ctx context.Context, page, limit int, projectID, search string) (*dto.PaginatedResponse[dto.BoardDto], error) {
	q := url.Values{}
	q.Set("page", fmt.Sprintf("%d", page))
	q.Set("limit", fmt.Sprintf("%d", limit))
	if projectID != "" {
		q.Set("projectId", projectID)
	}
	if search != "" {
		q.Set("search", search)
	}
	var result dto.PaginatedResponse[dto.BoardDto]
	if err := c.doGet(ctx, "/boards", q, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CreateBoard(ctx context.Context, req dto.BoardCreateRequest) (*dto.BoardDto, error) {
	var result dto.BoardDto
	if err := c.doPost(ctx, "/boards", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) UpdateBoard(ctx context.Context, id string, req dto.BoardUpdateRequest) (*dto.BoardDto, error) {
	var result dto.BoardDto
	if err := c.doPut(ctx, fmt.Sprintf("/boards/%s", id), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) DeleteBoard(ctx context.Context, id string) error {
	return c.doDelete(ctx, fmt.Sprintf("/boards/%s", id))
}

func (c *BackendClient) ListTasks(ctx context.Context, boardID, columnID string, page, limit int) (*dto.PaginatedResponse[dto.TaskDto], error) {
	q := url.Values{}
	if boardID != "" {
		q.Set("boardId", boardID)
	}
	if columnID != "" {
		q.Set("columnId", columnID)
	}
	q.Set("page", fmt.Sprintf("%d", page))
	q.Set("limit", fmt.Sprintf("%d", limit))
	var result dto.PaginatedResponse[dto.TaskDto]
	if err := c.doGet(ctx, "/tasks", q, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CreateTask(ctx context.Context, req dto.TaskCreateRequest) (*dto.TaskDto, error) {
	var result dto.TaskDto
	if err := c.doPost(ctx, "/tasks", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) QuickCreateTask(ctx context.Context, req dto.TaskQuickCreateRequest) (*dto.TaskDto, error) {
	var result dto.TaskDto
	if err := c.doPost(ctx, "/tasks/quick", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) GetTask(ctx context.Context, id string) (*dto.TaskDto, error) {
	var result dto.TaskDto
	if err := c.doGet(ctx, fmt.Sprintf("/tasks/%s", id), nil, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) UpdateTask(ctx context.Context, id string, req dto.TaskUpdateRequest) (*dto.TaskDto, error) {
	var result dto.TaskDto
	if err := c.doPatch(ctx, fmt.Sprintf("/tasks/%s", id), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) DeleteTask(ctx context.Context, id string) error {
	return c.doDelete(ctx, fmt.Sprintf("/tasks/%s", id))
}

func (c *BackendClient) MoveTask(ctx context.Context, id string, req dto.TaskMoveRequest) (*dto.TaskDto, error) {
	var result dto.TaskDto
	if err := c.doPost(ctx, fmt.Sprintf("/tasks/%s/move", id), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CreateColumn(ctx context.Context, req dto.ColumnCreateRequest) (*dto.ColumnDto, error) {
	var result dto.ColumnDto
	if err := c.doPost(ctx, fmt.Sprintf("/boards/%s/columns", req.BoardID), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) DeleteColumn(ctx context.Context, id string) error {
	return c.doDelete(ctx, fmt.Sprintf("/columns/%s", id))
}

func (c *BackendClient) ListNotes(ctx context.Context, projectID, noteType string) ([]dto.NoteDto, error) {
	q := url.Values{}
	if projectID != "" {
		q.Set("projectId", projectID)
	}
	if noteType != "" {
		q.Set("type", noteType)
	}
	var result []dto.NoteDto
	if err := c.doGet(ctx, "/notes", q, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *BackendClient) GetNote(ctx context.Context, id string) (*dto.NoteDto, error) {
	var result dto.NoteDto
	if err := c.doGet(ctx, fmt.Sprintf("/notes/%s", id), nil, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CreateNote(ctx context.Context, req dto.NoteCreateRequest) (*dto.NoteDto, error) {
	var result dto.NoteDto
	if err := c.doPost(ctx, "/notes", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) UpdateNote(ctx context.Context, id string, req dto.NoteUpdateRequest) (*dto.NoteDto, error) {
	var result dto.NoteDto
	if err := c.doPut(ctx, fmt.Sprintf("/notes/%s", id), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) DeleteNote(ctx context.Context, id string) error {
	return c.doDelete(ctx, fmt.Sprintf("/notes/%s", id))
}

func (c *BackendClient) CreateTimeLog(ctx context.Context, req dto.TimeLogCreateRequest) (*dto.TimeLogDto, error) {
	var result dto.TimeLogDto
	if err := c.doPost(ctx, "/time-logs", req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) ListTimeLogs(ctx context.Context, taskID string) ([]dto.TimeLogDto, error) {
	var result []dto.TimeLogDto
	if err := c.doGet(ctx, fmt.Sprintf("/time-logs/task/%s", taskID), nil, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *BackendClient) GetAgendaView(ctx context.Context, mode, anchorDate, timezone string) (json.RawMessage, error) {
	q := url.Values{}
	q.Set("mode", mode)
	q.Set("anchorDate", anchorDate)
	q.Set("timezone", timezone)
	var result json.RawMessage
	if err := c.doGet(ctx, "/agenda-views", q, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func (c *BackendClient) CreateAgendaItem(ctx context.Context, agendaID string, req dto.AgendaItemCreateRequest) (*dto.AgendaItemDto, error) {
	var result dto.AgendaItemDto
	if err := c.doPost(ctx, fmt.Sprintf("/agendas/%s/items", agendaID), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) UpdateAgendaItem(ctx context.Context, agendaID, itemID string, req dto.AgendaItemUpdateRequest) (*dto.AgendaItemDto, error) {
	var result dto.AgendaItemDto
	if err := c.doPut(ctx, fmt.Sprintf("/agendas/%s/items/%s", agendaID, itemID), req, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) CompleteAgendaItem(ctx context.Context, agendaID, itemID string) (*dto.AgendaItemDto, error) {
	var result dto.AgendaItemDto
	if err := c.doPut(ctx, fmt.Sprintf("/agendas/%s/items/%s/complete", agendaID, itemID), nil, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

func (c *BackendClient) doGet(ctx context.Context, path string, query url.Values, result interface{}) error {
	return c.doRequest(ctx, http.MethodGet, path, query, nil, result)
}

func (c *BackendClient) doPost(ctx context.Context, path string, body, result interface{}) error {
	return c.doRequest(ctx, http.MethodPost, path, nil, body, result)
}

func (c *BackendClient) doPut(ctx context.Context, path string, body, result interface{}) error {
	return c.doRequest(ctx, http.MethodPut, path, nil, body, result)
}

func (c *BackendClient) doPatch(ctx context.Context, path string, body, result interface{}) error {
	return c.doRequest(ctx, http.MethodPatch, path, nil, body, result)
}

func (c *BackendClient) doDelete(ctx context.Context, path string) error {
	return c.doRequest(ctx, http.MethodDelete, path, nil, nil, nil)
}

func (c *BackendClient) doRequest(ctx context.Context, method, path string, query url.Values, body, result interface{}) error {
	fullURL, err := url.JoinPath(c.baseURL, path)
	if err != nil {
		return &ConnectionError{Err: fmt.Errorf("invalid URL path %s: %w", path, err)}
	}

	if query != nil && len(query) > 0 {
		parsed, parseErr := url.Parse(fullURL)
		if parseErr != nil {
			return &ConnectionError{Err: fmt.Errorf("failed to parse URL %s: %w", fullURL, parseErr)}
		}
		parsed.RawQuery = query.Encode()
		fullURL = parsed.String()
	}

	var bodyReader io.Reader
	if body != nil {
		jsonBytes, marshalErr := json.Marshal(body)
		if marshalErr != nil {
			return fmt.Errorf("failed to marshal request body: %w", marshalErr)
		}
		bodyReader = bytes.NewReader(jsonBytes)
	}

	req, err := http.NewRequestWithContext(ctx, method, fullURL, bodyReader)
	if err != nil {
		return &ConnectionError{Err: fmt.Errorf("failed to create request: %w", err)}
	}

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Accept", "application/json")
	if c.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.authToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return &ConnectionError{Err: err}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return &ConnectionError{Err: fmt.Errorf("failed to read response body: %w", err)}
	}

	if resp.StatusCode >= 400 {
		return c.handleErrorResponse(resp.StatusCode, respBody, path)
	}

	if result != nil && len(respBody) > 0 {
		if err := json.Unmarshal(respBody, result); err != nil {
			return fmt.Errorf("failed to unmarshal response: %w", err)
		}
	}

	return nil
}

func (c *BackendClient) handleErrorResponse(statusCode int, body []byte, path string) error {
	var errResp struct {
		Message string            `json:"message"`
		Error   string            `json:"error"`
		Fields  map[string]string `json:"fields"`
	}
	_ = json.Unmarshal(body, &errResp)

	message := errResp.Message
	if message == "" {
		message = errResp.Error
	}
	if message == "" {
		message = string(body)
	}

	switch statusCode {
	case http.StatusUnauthorized:
		return &UnauthorizedError{Message: message}
	case http.StatusNotFound:
		return &NotFoundError{Resource: path, ID: ""}
	case http.StatusBadRequest, http.StatusUnprocessableEntity:
		return &ValidationError{Message: message, Fields: errResp.Fields}
	case http.StatusConflict:
		return &ConflictError{Message: message}
	default:
		return &ServerError{StatusCode: statusCode, Message: message}
	}
}
