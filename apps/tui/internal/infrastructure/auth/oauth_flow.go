package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os/exec"
	"strings"
	"time"
)

type OAuthFlow struct {
	backendURL string
	tokenStore *TokenStore
}

func NewOAuthFlow(backendURL string, tokenStore *TokenStore) *OAuthFlow {
	return &OAuthFlow{
		backendURL: backendURL,
		tokenStore: tokenStore,
	}
}

func (f *OAuthFlow) Execute() error {
	listener, err := net.Listen("tcp", "localhost:0")
	if err != nil {
		return fmt.Errorf("failed to start callback server: %w", err)
	}
	defer listener.Close()

	port := listener.Addr().(*net.TCPAddr).Port
	callbackURL := fmt.Sprintf("http://localhost:%d/callback", port)

	// Make POST request to initiate OAuth flow
	signInURL, err := f.initiateOAuth(callbackURL)
	if err != nil {
		return fmt.Errorf("failed to initiate OAuth: %w", err)
	}

	// Route through the expo authorization proxy so the browser gets the
	// signed state cookie (the Go HTTP client received it above, but the
	// browser needs it for the callback validation).
	proxyURL := fmt.Sprintf("%s/api/auth/expo-authorization-proxy?authorizationURL=%s",
		f.backendURL, url.QueryEscape(signInURL))

	resultChan := make(chan error, 1)

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		// The backend's cliAuth plugin appends the session cookie as a
		// "cookie" query parameter on localhost callback redirects.
		token := parseSessionToken(r.URL.Query().Get("cookie"))

		if token == "" {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusBadRequest)
			fmt.Fprint(w, "<html><body><h2>Login failed</h2><p>No session token received. Please try again.</p></body></html>")
			resultChan <- fmt.Errorf("no session token received in callback")
			return
		}

		if err := f.tokenStore.Save(token); err != nil {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprint(w, "<html><body><h2>Login failed</h2><p>Could not save session. Please try again.</p></body></html>")
			resultChan <- fmt.Errorf("failed to save token: %w", err)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, "<html><body><h2>Login successful!</h2><p>You can close this tab and return to the terminal.</p></body></html>")
		resultChan <- nil
	})

	server := &http.Server{Handler: mux}

	go func() {
		if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
			resultChan <- fmt.Errorf("callback server error: %w", err)
		}
	}()

	fmt.Printf("Opening browser for authentication...\n")
	if err := exec.Command("xdg-open", proxyURL).Start(); err != nil {
		return fmt.Errorf("failed to open browser: %w (please open manually: %s)", err, proxyURL)
	}

	select {
	case err := <-resultChan:
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		server.Shutdown(ctx)
		return err
	case <-time.After(60 * time.Second):
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		server.Shutdown(ctx)
		return fmt.Errorf("login timed out after 60 seconds")
	}
}

func (f *OAuthFlow) initiateOAuth(callbackURL string) (string, error) {
	reqBody := map[string]interface{}{
		"provider":    "google",
		"callbackURL": callbackURL,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/api/auth/sign-in/social", f.backendURL)
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OAuth initiation failed with status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		URL      string `json:"url"`
		Redirect bool   `json:"redirect"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if !result.Redirect || result.URL == "" {
		return "", fmt.Errorf("invalid OAuth response: no redirect URL provided")
	}

	return result.URL, nil
}

// parseSessionToken extracts the session token value from a raw Set-Cookie
// header string. The backend appends this as a "cookie" query parameter on
// localhost callback redirects. The format is one or more Set-Cookie values,
// e.g. "better-auth.session_token=abc123; Path=/; HttpOnly, other=...".
func parseSessionToken(rawCookie string) string {
	if rawCookie == "" {
		return ""
	}
	for _, part := range strings.Split(rawCookie, ",") {
		trimmed := strings.TrimSpace(part)
		if idx := strings.Index(trimmed, "session_token="); idx != -1 {
			value := trimmed[idx+len("session_token="):]
			if semi := strings.Index(value, ";"); semi != -1 {
				value = value[:semi]
			}
			return strings.TrimSpace(value)
		}
	}
	return ""
}
