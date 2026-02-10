package editor

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

type EditorFinishedMsg struct {
	Content string
	Err     error
}

func OpenEditor(initialContent string, fileExtension string) tea.Cmd {
	tmpFile, err := os.CreateTemp("", "cadence-*"+fileExtension)
	if err != nil {
		return func() tea.Msg {
			return EditorFinishedMsg{Err: fmt.Errorf("failed to create temp file: %w", err)}
		}
	}

	tmpPath := tmpFile.Name()

	if initialContent != "" {
		if _, err := tmpFile.WriteString(initialContent); err != nil {
			tmpFile.Close()
			os.Remove(tmpPath)
			return func() tea.Msg {
				return EditorFinishedMsg{Err: fmt.Errorf("failed to write initial content: %w", err)}
			}
		}
	}
	tmpFile.Close()

	editorName := resolveEditor()
	if editorName == "" {
		os.Remove(tmpPath)
		return func() tea.Msg {
			return EditorFinishedMsg{Err: fmt.Errorf("no editor found: set $EDITOR environment variable")}
		}
	}

	editorArgs := []string{tmpPath}
	parts := strings.Fields(editorName)
	if len(parts) > 1 {
		editorName = parts[0]
		editorArgs = append(parts[1:], tmpPath)
	}

	cmd := exec.Command(editorName, editorArgs...)

	return tea.ExecProcess(cmd, func(err error) tea.Msg {
		defer os.Remove(tmpPath)
		if err != nil {
			return EditorFinishedMsg{Err: fmt.Errorf("editor exited with error: %w", err)}
		}
		content, readErr := os.ReadFile(tmpPath)
		if readErr != nil {
			return EditorFinishedMsg{Err: fmt.Errorf("failed to read edited content: %w", readErr)}
		}
		return EditorFinishedMsg{Content: string(content)}
	})
}

func resolveEditor() string {
	editorName := os.Getenv("EDITOR")
	if editorName == "" {
		editorName = os.Getenv("VISUAL")
	}
	if editorName == "" {
		for _, name := range []string{"vim", "nano", "vi"} {
			if _, err := exec.LookPath(name); err == nil {
				editorName = name
				break
			}
		}
	}
	return editorName
}
