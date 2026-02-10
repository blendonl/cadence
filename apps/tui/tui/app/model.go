package app

import (
	tea "github.com/charmbracelet/bubbletea"

	"cadence/internal/daemon"
	"cadence/internal/infrastructure/config"
	"cadence/tui/agenda"
	"cadence/tui/common"
	"cadence/tui/kanban"
	"cadence/tui/notes"
)

const (
	TabKanban = 0
	TabNotes  = 1
	TabAgenda = 2
)

type AppModel struct {
	activeTab    int
	kanbanModel  kanban.Model
	notesModel   notes.Model
	agendaModel  agenda.Model
	tabBar       common.TabBar
	statusBar    common.StatusBar
	daemonClient *daemon.Client
	config       *config.Config
	width        int
	height       int
}

func NewAppModel(cfg *config.Config, daemonClient *daemon.Client, initialTab int) AppModel {
	return AppModel{
		activeTab:    initialTab,
		kanbanModel:  kanban.NewModel(daemonClient, cfg),
		notesModel:   notes.NewModel(daemonClient, cfg),
		agendaModel:  agenda.NewModel(daemonClient, cfg),
		tabBar:       common.NewTabBar([]string{"Kanban", "Notes", "Agenda"}, initialTab),
		statusBar:    common.NewStatusBar(),
		daemonClient: daemonClient,
		config:       cfg,
	}
}

func (m AppModel) Init() tea.Cmd {
	return tea.Batch(
		m.kanbanModel.Init(),
		m.notesModel.Init(),
		m.agendaModel.Init(),
	)
}
