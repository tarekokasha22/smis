#!/bin/bash

# ============================================================
#    SMIS - نظام إدارة الصحة الرياضية المتكامل
#    Sports Medical Information System
# ============================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get the script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "${CYAN}${BOLD}   SMIS - نظام إدارة الصحة الرياضية المتكامل${NC}"
echo -e "${CYAN}${BOLD}   Sports Medical Information System${NC}"
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo ""

# ──────────────────────────────────────────────
#  Step 1: Check prerequisites
# ──────────────────────────────────────────────
echo -e "${BOLD}[1/6] Checking prerequisites...${NC}"

# Check for nvm and load it
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed.${NC}"
    echo "       Install via nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed.${NC}"
    echo "       Install from: https://docs.docker.com/engine/install/"
    exit 1
fi

echo -e "       Node.js : ${GREEN}OK${NC} ($(node -v))"
echo -e "       npm     : ${GREEN}OK${NC} ($(npm -v))"
echo -e "       Docker  : ${GREEN}OK${NC} ($(docker --version | cut -d' ' -f3 | tr -d ','))"
echo ""

# ──────────────────────────────────────────────
#  Step 2: Start MySQL via Docker
# ──────────────────────────────────────────────
echo -e "${BOLD}[2/6] Starting MySQL database via Docker...${NC}"
docker compose up -d
echo -e "       MySQL started on port ${GREEN}3306${NC}"
echo ""

# ──────────────────────────────────────────────
#  Step 3: Install dependencies
# ──────────────────────────────────────────────
echo -e "${BOLD}[3/6] Installing dependencies...${NC}"

echo "       Installing root dependencies..."
npm install --silent 2>&1 | tail -1

echo "       Installing backend dependencies..."
(cd backend && npm install --silent 2>&1 | tail -1)

echo "       Installing frontend dependencies..."
(cd frontend && npm install --silent 2>&1 | tail -1)

echo -e "       ${GREEN}All dependencies installed!${NC}"
echo ""

# ──────────────────────────────────────────────
#  Step 4: Wait for MySQL to be ready
# ──────────────────────────────────────────────
echo -e "${BOLD}[4/6] Waiting for MySQL to be ready...${NC}"
RETRIES=0
MAX_RETRIES=30

until docker exec smis_mysql mysqladmin ping -u root -psmis_root_2024 --silent 2>/dev/null; do
    RETRIES=$((RETRIES + 1))
    if [ $RETRIES -ge $MAX_RETRIES ]; then
        echo -e "${RED}[ERROR] MySQL did not become ready in time.${NC}"
        exit 1
    fi
    echo "       Waiting... (attempt $RETRIES/$MAX_RETRIES)"
    sleep 2
done

echo -e "       ${GREEN}MySQL is ready!${NC}"
echo ""

# ──────────────────────────────────────────────
#  Step 5: Run migrations and seeders
# ──────────────────────────────────────────────
echo -e "${BOLD}[5/6] Running database migrations and seeders...${NC}"

cd backend
npx sequelize-cli db:migrate 2>&1 || echo -e "${YELLOW}[WARNING] Migrations may have already been applied.${NC}"
npx sequelize-cli db:seed:all 2>&1 || echo -e "${YELLOW}[WARNING] Seeds may have already been applied.${NC}"
cd ..

echo -e "       ${GREEN}Database is ready!${NC}"
echo ""

# ──────────────────────────────────────────────
#  Step 6: Start Backend and Frontend
# ──────────────────────────────────────────────
echo -e "${BOLD}[6/6] Starting application servers...${NC}"
echo ""
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo -e "${GREEN}${BOLD}   SMIS is starting up!${NC}"
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo ""
echo -e "   ${BOLD}Frontend${NC} : ${GREEN}http://localhost:5173${NC}"
echo -e "   ${BOLD}Backend${NC}  : ${GREEN}http://localhost:5000${NC}"
echo -e "   ${BOLD}API Docs${NC} : ${GREEN}http://localhost:5000/api/health${NC}"
echo ""
echo -e "   ${BOLD}Demo Login Credentials:${NC}"
echo -e "   ──────────────────────"
echo -e "   Admin     : ${CYAN}admin@hilal.com${NC}   / ${YELLOW}Admin@1234${NC}"
echo -e "   Doctor    : ${CYAN}doctor@hilal.com${NC}  / ${YELLOW}Doctor@1234${NC}"
echo -e "   Physio    : ${CYAN}physio@hilal.com${NC}  / ${YELLOW}Physio@1234${NC}"
echo -e "   Coach     : ${CYAN}coach@hilal.com${NC}   / ${YELLOW}Coach@1234${NC}"
echo -e "   Manager   : ${CYAN}manager@hilal.com${NC} / ${YELLOW}Manager@1234${NC}"
echo ""
echo -e "   Press ${RED}Ctrl+C${NC} to stop all servers."
echo -e "${CYAN}${BOLD}============================================================${NC}"
echo ""

# Trap Ctrl+C to clean up
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill 0
    echo -e "${GREEN}All servers stopped.${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# Start backend and frontend concurrently
npm run dev
