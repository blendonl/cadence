package common

import (
	"strings"

	"github.com/charmbracelet/lipgloss"
)

var (
	activeTabStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#A8DADC")).
			Background(lipgloss.Color("#2D2D2D")).
			Padding(0, 2)

	inactiveTabStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("#666666")).
				Padding(0, 2)

	tabBarStyle = lipgloss.NewStyle().
			BorderBottom(true).
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("#333333"))
)

type TabBar struct {
	tabs   []string
	active int
}

func NewTabBar(tabs []string, active int) TabBar {
	return TabBar{tabs: tabs, active: active}
}

func (t *TabBar) SetActive(idx int) {
	t.active = idx
}

func (t TabBar) View(width int) string {
	var rendered []string
	for i, tab := range t.tabs {
		label := tab
		if i == t.active {
			rendered = append(rendered, activeTabStyle.Render(label))
		} else {
			rendered = append(rendered, inactiveTabStyle.Render(label))
		}
	}

	row := strings.Join(rendered, " ")
	return tabBarStyle.Width(width).Render(row)
}
