package output

import (
	"encoding/json"
	"fmt"
	"io"
)

// Format represents the output format type
type Format string

const (
	FormatText Format = "text"
	FormatJSON Format = "json"
)

// Formatter handles output formatting for different formats
type Formatter struct {
	format Format
	writer io.Writer
}

// NewFormatter creates a new output formatter
func NewFormatter(format Format, writer io.Writer) *Formatter {
	return &Formatter{
		format: format,
		writer: writer,
	}
}

// Print outputs data in the configured format
func (f *Formatter) Print(data interface{}) error {
	switch f.format {
	case FormatJSON:
		return f.printJSON(data)
	case FormatText:
		return f.printText(data)
	default:
		return fmt.Errorf("unsupported output format: %s", f.format)
	}
}

// printJSON outputs data as indented JSON
func (f *Formatter) printJSON(data interface{}) error {
	encoder := json.NewEncoder(f.writer)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

// printText outputs data as plain text
func (f *Formatter) printText(data interface{}) error {
	switch v := data.(type) {
	case string:
		_, err := fmt.Fprintln(f.writer, v)
		return err
	case fmt.Stringer:
		_, err := fmt.Fprintln(f.writer, v.String())
		return err
	default:
		_, err := fmt.Fprintln(f.writer, v)
		return err
	}
}

// ParseFormat converts a string to a Format
func ParseFormat(s string) (Format, error) {
	switch s {
	case "text", "":
		return FormatText, nil
	case "json":
		return FormatJSON, nil
	default:
		return FormatText, fmt.Errorf("invalid format '%s': must be one of: text, json", s)
	}
}
