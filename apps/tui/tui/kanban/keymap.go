package kanban

import (
	"strings"

	"github.com/charmbracelet/bubbles/key"
	"cadence/internal/infrastructure/config"
)

type keyMap struct {
	Up     key.Binding
	Down   key.Binding
	Left   key.Binding
	Right  key.Binding
	Move   key.Binding
	Add    key.Binding
	Delete key.Binding
	Edit   key.Binding
	Quit   key.Binding
}

var keys keyMap

func InitKeybindings(cfg *config.Config) {
	kb := cfg.Keybindings

	keys = keyMap{
		Up: key.NewBinding(
			key.WithKeys(kb.Up...),
			key.WithHelp(formatKeysHelp(kb.Up), "up"),
		),
		Down: key.NewBinding(
			key.WithKeys(kb.Down...),
			key.WithHelp(formatKeysHelp(kb.Down), "down"),
		),
		Left: key.NewBinding(
			key.WithKeys(kb.Left...),
			key.WithHelp(formatKeysHelp(kb.Left), "left"),
		),
		Right: key.NewBinding(
			key.WithKeys(kb.Right...),
			key.WithHelp(formatKeysHelp(kb.Right), "right"),
		),
		Move: key.NewBinding(
			key.WithKeys(kb.Move...),
			key.WithHelp(formatKeysHelp(kb.Move), "move task"),
		),
		Add: key.NewBinding(
			key.WithKeys(kb.Add...),
			key.WithHelp(formatKeysHelp(kb.Add), "add task"),
		),
		Delete: key.NewBinding(
			key.WithKeys(kb.Delete...),
			key.WithHelp(formatKeysHelp(kb.Delete), "delete task"),
		),
		Edit: key.NewBinding(
			key.WithKeys(kb.Edit...),
			key.WithHelp(formatKeysHelp(kb.Edit), "edit task"),
		),
		Quit: key.NewBinding(
			key.WithKeys(kb.Quit...),
			key.WithHelp(formatKeysHelp(kb.Quit), "quit"),
		),
	}
}

func formatKeysHelp(keys []string) string {
	if len(keys) == 0 {
		return ""
	}

	formatted := make([]string, len(keys))
	for i, k := range keys {
		switch k {
		case "up":
			formatted[i] = "\u2191"
		case "down":
			formatted[i] = "\u2193"
		case "left":
			formatted[i] = "\u2190"
		case "right":
			formatted[i] = "\u2192"
		default:
			formatted[i] = k
		}
	}

	return strings.Join(formatted, "/")
}
