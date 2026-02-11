#!/bin/bash
# Installation script for cadence

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default installation prefix
PREFIX="${PREFIX:-/usr/local}"
BINDIR="${PREFIX}/bin"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"
COMPLETIONS_DIR="${PREFIX}/share"

# Print functions
print_info() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}Error:${NC} $1" >&2
}

print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Check if running as root for system-wide install
if [ "$PREFIX" = "/usr" ] || [ "$PREFIX" = "/usr/local" ]; then
    if [ "$EUID" -ne 0 ]; then
        print_error "System-wide installation requires root privileges."
        echo "Please run with sudo or set PREFIX to a user directory:"
        echo "  sudo ./install.sh"
        echo "  PREFIX=\$HOME/.local ./install.sh"
        exit 1
    fi
fi

# Check dependencies
print_info "Checking dependencies..."
if ! command -v go &> /dev/null; then
    print_error "Go is not installed. Please install Go 1.24 or later."
    exit 1
fi

GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
print_info "Found Go version: $GO_VERSION"

# Build binaries
print_info "Building cadence TUI client..."
go build -trimpath -ldflags "-s -w" -o cadence ./cmd/cadence

print_info "Building cadenced daemon..."
go build -trimpath -ldflags "-s -w" -o cadenced ./cmd/cadenced

# Install binaries
print_info "Installing binaries to $BINDIR..."
mkdir -p "$BINDIR"
install -m755 cadence "$BINDIR/cadence"
install -m755 cadenced "$BINDIR/cadenced"

# Generate and install shell completions
print_info "Generating shell completions..."
./cadence completion bash > cadence.bash
./cadence completion zsh > cadence.zsh
./cadence completion fish > cadence.fish

if [ "$EUID" -eq 0 ]; then
    # System-wide completions
    print_info "Installing shell completions (system-wide)..."
    mkdir -p "${PREFIX}/share/bash-completion/completions"
    mkdir -p "${PREFIX}/share/zsh/site-functions"
    mkdir -p "${PREFIX}/share/fish/vendor_completions.d"

    install -m644 cadence.bash "${PREFIX}/share/bash-completion/completions/cadence"
    install -m644 cadence.zsh "${PREFIX}/share/zsh/site-functions/_cadence"
    install -m644 cadence.fish "${PREFIX}/share/fish/vendor_completions.d/cadence.fish"
else
    # User completions
    print_info "Installing shell completions (user)..."
    mkdir -p "${HOME}/.local/share/bash-completion/completions"
    mkdir -p "${HOME}/.local/share/zsh/site-functions"
    mkdir -p "${HOME}/.config/fish/completions"

    install -m644 cadence.bash "${HOME}/.local/share/bash-completion/completions/cadence"
    install -m644 cadence.zsh "${HOME}/.local/share/zsh/site-functions/_cadence"
    install -m644 cadence.fish "${HOME}/.config/fish/completions/cadence.fish"
fi

# Install systemd user service
print_info "Installing systemd user service..."
mkdir -p "$SYSTEMD_USER_DIR"
install -m644 systemd/cadenced.service "$SYSTEMD_USER_DIR/cadenced.service"

# Update systemd user service to use correct binary path
sed -i "s|/usr/bin/cadenced|$BINDIR/cadenced|g" "$SYSTEMD_USER_DIR/cadenced.service"

# Clean up build artifacts
print_info "Cleaning up..."
rm -f cadence.bash cadence.zsh cadence.fish

print_info "Installation complete!"
echo ""
echo "To enable the daemon to start automatically:"
echo "  systemctl --user daemon-reload"
echo "  systemctl --user enable --now cadenced.service"
echo ""
echo "To use cadence:"
echo "  cadence                    # Launch TUI"
echo "  cadence board list         # List boards via CLI"
echo "  cadence task create ...    # Create tasks via CLI"
echo ""
echo "For help:"
echo "  cadence --help"
echo ""

if [ "$BINDIR" != "/usr/bin" ] && [ "$BINDIR" != "/usr/local/bin" ]; then
    print_warning "Binaries installed to $BINDIR"
    echo "Make sure $BINDIR is in your PATH:"
    echo "  export PATH=\"$BINDIR:\$PATH\""
    echo ""
fi
