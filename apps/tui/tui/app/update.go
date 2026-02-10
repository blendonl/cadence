package app

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"

	"cadence/tui/agenda"
	"cadence/tui/kanban"
	"cadence/tui/notes"
)

type tabKeyMap struct {
	Tab      key.Binding
	ShiftTab key.Binding
	One      key.Binding
	Two      key.Binding
	Three    key.Binding
	Quit     key.Binding
}

var tabKeys = tabKeyMap{
	Tab:      key.NewBinding(key.WithKeys("tab")),
	ShiftTab: key.NewBinding(key.WithKeys("shift+tab")),
	One:      key.NewBinding(key.WithKeys("1")),
	Two:      key.NewBinding(key.WithKeys("2")),
	Three:    key.NewBinding(key.WithKeys("3")),
	Quit:     key.NewBinding(key.WithKeys("ctrl+c")),
}

func (m AppModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		contentHeight := msg.Height - 4
		contentMsg := tea.WindowSizeMsg{Width: msg.Width, Height: contentHeight}

		var cmds []tea.Cmd
		var cmd tea.Cmd

		km, cmd := m.kanbanModel.Update(contentMsg)
		m.kanbanModel = km.(kanban.Model)
		cmds = append(cmds, cmd)

		nm, cmd := m.notesModel.Update(contentMsg)
		m.notesModel = nm.(notes.Model)
		cmds = append(cmds, cmd)

		am, cmd := m.agendaModel.Update(contentMsg)
		m.agendaModel = am.(agenda.Model)
		cmds = append(cmds, cmd)

		return m, tea.Batch(cmds...)

	case tea.KeyMsg:
		switch {
		case key.Matches(msg, tabKeys.Quit):
			return m, tea.Quit
		case key.Matches(msg, tabKeys.Tab):
			m.activeTab = (m.activeTab + 1) % 3
			m.tabBar.SetActive(m.activeTab)
			return m, nil
		case key.Matches(msg, tabKeys.ShiftTab):
			m.activeTab = (m.activeTab + 2) % 3
			m.tabBar.SetActive(m.activeTab)
			return m, nil
		case key.Matches(msg, tabKeys.One):
			m.activeTab = TabKanban
			m.tabBar.SetActive(m.activeTab)
			return m, nil
		case key.Matches(msg, tabKeys.Two):
			m.activeTab = TabNotes
			m.tabBar.SetActive(m.activeTab)
			return m, nil
		case key.Matches(msg, tabKeys.Three):
			m.activeTab = TabAgenda
			m.tabBar.SetActive(m.activeTab)
			return m, nil
		}
	}

	var cmd tea.Cmd
	switch m.activeTab {
	case TabKanban:
		updated, c := m.kanbanModel.Update(msg)
		m.kanbanModel = updated.(kanban.Model)
		cmd = c
	case TabNotes:
		updated, c := m.notesModel.Update(msg)
		m.notesModel = updated.(notes.Model)
		cmd = c
	case TabAgenda:
		updated, c := m.agendaModel.Update(msg)
		m.agendaModel = updated.(agenda.Model)
		cmd = c
	}

	return m, cmd
}
