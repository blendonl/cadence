package app

import (
	"github.com/charmbracelet/lipgloss"
)

func (m AppModel) View() string {
	if m.width == 0 {
		return "Loading..."
	}

	tabBarView := m.tabBar.View(m.width)

	var content string
	switch m.activeTab {
	case TabKanban:
		content = m.kanbanModel.View()
		left, right := m.kanbanModel.StatusInfo()
		m.statusBar.SetLeft(left)
		m.statusBar.SetRight(right)
	case TabNotes:
		content = m.notesModel.View()
		left, right := m.notesModel.StatusInfo()
		m.statusBar.SetLeft(left)
		m.statusBar.SetRight(right)
	case TabAgenda:
		content = m.agendaModel.View()
		left, right := m.agendaModel.StatusInfo()
		m.statusBar.SetLeft(left)
		m.statusBar.SetRight(right)
	}

	statusBarView := m.statusBar.View(m.width)

	return lipgloss.JoinVertical(lipgloss.Left, tabBarView, content, statusBarView)
}
