package auth

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type tokenData struct {
	SessionToken string `json:"session_token"`
}

type TokenStore struct {
	filePath string
}

func NewTokenStore() (*TokenStore, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	return &TokenStore{
		filePath: filepath.Join(homeDir, ".local", "share", "cadence", "auth.json"),
	}, nil
}

func (s *TokenStore) Save(token string) error {
	dir := filepath.Dir(s.filePath)
	if err := os.MkdirAll(dir, 0700); err != nil {
		return fmt.Errorf("failed to create auth directory: %w", err)
	}

	data, err := json.Marshal(tokenData{SessionToken: token})
	if err != nil {
		return fmt.Errorf("failed to marshal token: %w", err)
	}

	if err := os.WriteFile(s.filePath, data, 0600); err != nil {
		return fmt.Errorf("failed to write token file: %w", err)
	}

	return nil
}

func (s *TokenStore) Load() (string, error) {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read token file: %w", err)
	}

	var td tokenData
	if err := json.Unmarshal(data, &td); err != nil {
		return "", fmt.Errorf("failed to parse token file: %w", err)
	}

	return td.SessionToken, nil
}

func (s *TokenStore) Clear() error {
	if err := os.Remove(s.filePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove token file: %w", err)
	}
	return nil
}

func (s *TokenStore) Exists() bool {
	_, err := os.Stat(s.filePath)
	return err == nil
}
