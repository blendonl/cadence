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

// RunEditor opens $EDITOR synchronously. For CLI use (not bubbletea).
func RunEditor(initialContent, fileExtension string) (string, error) {
	tmpFile, err := os.CreateTemp("", "cadence-*"+fileExtension)
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath)

	if initialContent != "" {
		if _, err := tmpFile.WriteString(initialContent); err != nil {
			tmpFile.Close()
			return "", fmt.Errorf("failed to write initial content: %w", err)
		}
	}
	tmpFile.Close()

	editorName := resolveEditor()
	if editorName == "" {
		return "", fmt.Errorf("no editor found: set $EDITOR environment variable")
	}

	editorArgs := []string{tmpPath}
	parts := strings.Fields(editorName)
	if len(parts) > 1 {
		editorName = parts[0]
		editorArgs = append(parts[1:], tmpPath)
	}

	cmd := exec.Command(editorName, editorArgs...)
	cleanup, err := attachEditorIO(cmd)
	if err != nil {
		return "", err
	}
	defer cleanup()

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("editor exited with error: %w", err)
	}

	content, err := os.ReadFile(tmpPath)
	if err != nil {
		return "", fmt.Errorf("failed to read edited content: %w", err)
	}

	return string(content), nil
}

// attachEditorIO handles TTY attachment for the editor process.
// When stdin is piped, it opens /dev/tty for interactive use.
func attachEditorIO(cmd *exec.Cmd) (func(), error) {
	stat, err := os.Stdin.Stat()
	if err != nil {
		return nil, err
	}

	if (stat.Mode() & os.ModeCharDevice) != 0 {
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return func() {}, nil
	}

	tty, err := os.OpenFile("/dev/tty", os.O_RDWR, 0)
	if err != nil {
		return nil, fmt.Errorf("no interactive terminal available (run without piping)")
	}

	cmd.Stdin = tty
	cmd.Stdout = tty
	cmd.Stderr = tty

	return func() {
		_ = tty.Close()
	}, nil
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
