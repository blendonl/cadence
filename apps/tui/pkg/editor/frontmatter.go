package editor

import (
	"fmt"
	"strings"

	"cadence/internal/application/dto"

	"gopkg.in/yaml.v3"
)

// FrontmatterDoc represents a markdown document with YAML frontmatter
type FrontmatterDoc struct {
	Metadata map[string]interface{}
	Title    string // extracted from first # heading
	Body     string // content after heading
}

// ParseFrontmatter parses a markdown document with YAML frontmatter
func ParseFrontmatter(data string) (*FrontmatterDoc, error) {
	data = strings.TrimSpace(data)
	doc := &FrontmatterDoc{
		Metadata: make(map[string]interface{}),
	}

	if !strings.HasPrefix(data, "---") {
		doc.Title, doc.Body = extractTitle(data)
		return doc, nil
	}

	// Find the closing ---
	rest := data[3:]
	idx := strings.Index(rest, "\n---")
	if idx < 0 {
		doc.Title, doc.Body = extractTitle(data)
		return doc, nil
	}

	frontmatter := strings.TrimSpace(rest[:idx])
	content := strings.TrimSpace(rest[idx+4:])

	if err := yaml.Unmarshal([]byte(frontmatter), &doc.Metadata); err != nil {
		return nil, fmt.Errorf("failed to parse frontmatter: %w", err)
	}

	doc.Title, doc.Body = extractTitle(content)
	return doc, nil
}

func extractTitle(content string) (title, body string) {
	lines := strings.SplitN(content, "\n", 2)
	if len(lines) == 0 {
		return "", ""
	}

	firstLine := strings.TrimSpace(lines[0])
	if strings.HasPrefix(firstLine, "# ") {
		title = strings.TrimPrefix(firstLine, "# ")
		if len(lines) > 1 {
			body = strings.TrimSpace(lines[1])
		}
		return title, body
	}

	return "", content
}

// SerializeFrontmatter creates a markdown document with YAML frontmatter
func SerializeFrontmatter(metadata map[string]interface{}, title, body string) string {
	var b strings.Builder

	if len(metadata) > 0 {
		b.WriteString("---\n")
		data, err := yaml.Marshal(metadata)
		if err == nil {
			b.Write(data)
		}
		b.WriteString("---\n")
	}

	if title != "" {
		b.WriteString("# " + title + "\n")
	}

	if body != "" {
		b.WriteString("\n" + body + "\n")
	}

	return b.String()
}

// TaskTemplate generates a markdown template for task creation/editing
func TaskTemplate(task *dto.TaskDto) string {
	metadata := map[string]interface{}{
		"priority": "MEDIUM",
		"type":     "TASK",
	}

	title := ""
	body := ""

	if task != nil {
		title = task.Title
		if task.Priority != nil {
			metadata["priority"] = *task.Priority
		}
		metadata["type"] = task.TaskType
		metadata["tags"] = []string{}
		if task.DueDate != nil {
			metadata["due"] = *task.DueDate
		}
		if task.EstimatedMinutes != nil {
			metadata["estimated_minutes"] = *task.EstimatedMinutes
		}
		if task.Description != nil {
			body = *task.Description
		}
	} else {
		metadata["priority"] = "LOW"
		metadata["tags"] = []string{}
		body = ""
	}

	result := SerializeFrontmatter(metadata, title, body)
	if task == nil {
		result += "# \n"
	}
	return result
}

func HeadingLine(content string) int {
	for i, line := range strings.Split(content, "\n") {
		if strings.HasPrefix(line, "# ") {
			return i + 1
		}
	}
	return 0
}

type TaskFields struct {
	Title            string
	Description      string
	Priority         string
	Due              string
	EstimatedMinutes int
}

func ParseTaskDoc(content string) (*TaskFields, error) {
	doc, err := ParseFrontmatter(content)
	if err != nil {
		return nil, err
	}

	title := doc.Title
	if title == "" {
		title = "Untitled"
	}

	fields := &TaskFields{
		Title:       title,
		Description: doc.Body,
	}

	if p, ok := doc.Metadata["priority"].(string); ok {
		fields.Priority = strings.ToUpper(p)
	}
	if d, ok := doc.Metadata["due"].(string); ok {
		fields.Due = d
	}
	if e, ok := doc.Metadata["estimated_minutes"].(int); ok {
		fields.EstimatedMinutes = e
	}

	return fields, nil
}

// NoteTemplate generates a markdown template for note creation/editing
func NoteTemplate(note *dto.NoteDto) string {
	metadata := map[string]interface{}{
		"type": "GENERAL",
	}

	title := ""
	body := ""

	if note != nil {
		title = note.Title
		metadata["type"] = note.Type
		if len(note.Tags) > 0 {
			metadata["tags"] = note.Tags
		}
		body = note.Content
	} else {
		metadata["tags"] = []string{}
		body = "Content here."
	}

	return SerializeFrontmatter(metadata, title, body)
}
