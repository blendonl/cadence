package agenda

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"cadence/internal/application/dto"
	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
)

type agendaLoadedMsg struct {
	items []dto.AgendaItemEnrichedDto
	err   error
}

type Model struct {
	daemonClient *daemon.Client
	config       *config.Config
	anchorDate   time.Time
	mode         string
	items        []dto.AgendaItemEnrichedDto
	cursor       int
	width        int
	height       int
	loading      bool
	err          error
}

func NewModel(daemonClient *daemon.Client, cfg *config.Config) Model {
	return Model{
		daemonClient: daemonClient,
		config:       cfg,
		anchorDate:   time.Now(),
		mode:         "day",
		loading:      true,
	}
}

func (m Model) Init() tea.Cmd {
	return m.loadAgenda()
}

func (m Model) StatusInfo() (string, string) {
	left := fmt.Sprintf("Agenda — %s", m.anchorDate.Format("Jan 2, 2006"))
	right := ""
	if len(m.items) > 0 {
		completed := 0
		for _, item := range m.items {
			if item.Status == "COMPLETED" {
				completed++
			}
		}
		right = fmt.Sprintf("%d/%d completed", completed, len(m.items))
	}
	return left, right
}

func resolveTimezone() string {
	tz := time.Now().Location().String()
	if tz != "Local" {
		return tz
	}

	if env := os.Getenv("TZ"); env != "" {
		return env
	}

	if target, err := os.Readlink("/etc/localtime"); err == nil {
		if idx := strings.Index(target, "/zoneinfo/"); idx != -1 {
			return target[idx+len("/zoneinfo/"):]
		}
	}

	if data, err := os.ReadFile("/etc/timezone"); err == nil {
		if tz := strings.TrimSpace(string(data)); tz != "" {
			return tz
		}
	}

	// Check Windows symlink path for WSL
	if target, err := filepath.EvalSymlinks("/etc/localtime"); err == nil {
		if idx := strings.Index(target, "/zoneinfo/"); idx != -1 {
			return target[idx+len("/zoneinfo/"):]
		}
	}

	return "UTC"
}

func (m Model) loadAgenda() tea.Cmd {
	return func() tea.Msg {
		dateStr := m.anchorDate.Format("2006-01-02")
		tz := resolveTimezone()

		resp, err := m.daemonClient.SendRequest("get_agenda_view", map[string]interface{}{
			"mode":        m.mode,
			"anchor_date": dateStr,
			"timezone":    tz,
		})
		if err != nil {
			return agendaLoadedMsg{err: err}
		}

		data, err := json.Marshal(resp.Data)
		if err != nil {
			return agendaLoadedMsg{err: fmt.Errorf("failed to marshal agenda data: %w", err)}
		}

		var items []dto.AgendaItemEnrichedDto
		if err := json.Unmarshal(data, &items); err != nil {
			var singleItem dto.AgendaItemEnrichedDto
			if err2 := json.Unmarshal(data, &singleItem); err2 == nil {
				items = []dto.AgendaItemEnrichedDto{singleItem}
			} else {
				var wrapper struct {
					Items []dto.AgendaItemEnrichedDto `json:"items"`
				}
				if err3 := json.Unmarshal(data, &wrapper); err3 == nil {
					items = wrapper.Items
				}
			}
		}

		return agendaLoadedMsg{items: items}
	}
}
