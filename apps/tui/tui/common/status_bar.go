package common

import (
	"github.com/charmbracelet/lipgloss"
)

var statusBarStyle = lipgloss.NewStyle().
	Foreground(lipgloss.Color("#888888")).
	Background(lipgloss.Color("#1A1A1A")).
	Padding(0, 1)

type StatusBar struct {
	left  string
	right string
}

func NewStatusBar() StatusBar {
	return StatusBar{
		left: "Tab/Shift+Tab: switch views | 1/2/3: jump to view | Ctrl+C: quit",
	}
}

func (s *StatusBar) SetLeft(msg string) {
	s.left = msg
}

func (s *StatusBar) SetRight(msg string) {
	s.right = msg
}

func (s StatusBar) View(width int) string {
	left := statusBarStyle.Render(s.left)
	right := statusBarStyle.Render(s.right)

	leftWidth := lipgloss.Width(left)
	rightWidth := lipgloss.Width(right)
	gap := width - leftWidth - rightWidth
	if gap < 0 {
		gap = 0
	}

	filler := statusBarStyle.Width(gap).Render("")

	return lipgloss.JoinHorizontal(lipgloss.Top, left, filler, right)
}
