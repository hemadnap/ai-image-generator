#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
ENV_FILE=".env.local"
VITE_CONFIG=".env"

show_menu() {
    clear
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  API Environment Switcher${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo "Current .env.local:"
    if [ -f "$ENV_FILE" ]; then
        grep VITE_API_BASE_URL "$ENV_FILE" 2>/dev/null || echo "  (not set - using .env)"
    else
        echo "  (not set - using .env)"
    fi
    echo ""
    echo "Options:"
    echo -e "  ${GREEN}1${NC}) Local Backend (http://localhost:8787/api/v1)"
    echo -e "  ${GREEN}2${NC}) Deployed Worker"
    echo -e "  ${GREEN}3${NC}) Custom URL"
    echo -e "  ${GREEN}4${NC}) Clear Override (use .env)"
    echo -e "  ${GREEN}5${NC}) Show Current Config"
    echo -e "  ${GREEN}0${NC}) Exit"
    echo ""
}

set_local() {
    echo "VITE_API_BASE_URL=http://localhost:8787/api/v1" > "$ENV_FILE"
    echo -e "${GREEN}✓ Switched to Local Backend${NC}"
    echo -e "  URL: http://localhost:8787/api/v1"
    echo ""
    echo "Make sure backend is running:"
    echo "  cd backend && npm run dev"
}

set_deployed() {
    read -p "Enter your Cloudflare username: " username
    
    if [ -z "$username" ]; then
        echo -e "${RED}✗ Username required${NC}"
        return
    fi
    
    echo "VITE_API_BASE_URL=https://image-generator-api.${username}.workers.dev/api/v1" > "$ENV_FILE"
    echo -e "${GREEN}✓ Switched to Deployed Worker${NC}"
    echo -e "  URL: https://image-generator-api.${username}.workers.dev/api/v1"
}

set_custom() {
    read -p "Enter custom API URL (e.g., https://api.example.com/api/v1): " url
    
    if [ -z "$url" ]; then
        echo -e "${RED}✗ URL required${NC}"
        return
    fi
    
    echo "VITE_API_BASE_URL=$url" > "$ENV_FILE"
    echo -e "${GREEN}✓ Switched to Custom URL${NC}"
    echo -e "  URL: $url"
}

clear_override() {
    if [ -f "$ENV_FILE" ]; then
        rm "$ENV_FILE"
        echo -e "${GREEN}✓ Cleared Override${NC}"
        echo "  Now using .env configuration"
    else
        echo -e "${YELLOW}ℹ Override already cleared${NC}"
    fi
}

show_config() {
    echo ""
    echo -e "${BLUE}Current Configuration:${NC}"
    echo ""
    
    if [ -f "$ENV_FILE" ]; then
        echo -e "${GREEN}.env.local:${NC}"
        cat "$ENV_FILE"
        echo ""
    fi
    
    echo -e "${GREEN}.env:${NC}"
    grep VITE_API_BASE_URL "$VITE_CONFIG" 2>/dev/null || echo "  VITE_API_BASE_URL not set"
    
    echo ""
    echo "Priority: .env.local (highest) > .env (lowest)"
}

main_loop() {
    while true; do
        show_menu
        read -p "Select option: " choice
        
        case $choice in
            1)
                set_local
                ;;
            2)
                set_deployed
                ;;
            3)
                set_custom
                ;;
            4)
                clear_override
                ;;
            5)
                show_config
                ;;
            0)
                echo -e "${BLUE}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}✗ Invalid option${NC}"
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main loop
main_loop
