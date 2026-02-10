package auth

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os/exec"
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

	signInURL := fmt.Sprintf(
		"%s/api/auth/sign-in/social?provider=google&callbackURL=%s",
		f.backendURL,
		callbackURL,
	)

	resultChan := make(chan error, 1)

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		var token string
		for _, cookie := range r.Cookies() {
			if cookie.Name == "better-auth.session_token" {
				token = cookie.Value
				break
			}
		}

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
	if err := exec.Command("xdg-open", signInURL).Start(); err != nil {
		return fmt.Errorf("failed to open browser: %w (please open manually: %s)", err, signInURL)
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
