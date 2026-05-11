#!/bin/bash
# HomyHomegrow - Deployment Script für WebGo
# ============================================

set -e

echo "========================================"
echo "HomyHomegrow - WebGo Deploy Script"
echo "========================================"

# 1. Dependencies installen
echo "[1/6] Dependencies installieren..."
npm install

# 2. Datenbank Schema synchronisieren
echo "[2/6] Datenbank Schema synchronisieren..."
npm run db:push

# 3. Frontend + Backend bauen
echo "[3/6] Frontend + Backend bauen..."
npm run build

# 4. Datenbank migrieren (Seeds etc.)
echo "[4/6] Datenbank migrieren..."
npm run db:migrate 2>/dev/null || echo "Keine Migrationen nötig"

# 5. PM2 Prozess neustarten (falls vorhanden)
echo "[5/6] Server neustarten..."
if command -v pm2 &> /dev/null; then
    pm2 restart homyhomegrow 2>/dev/null || pm2 start dist/boot.js --name homyhomegrow
else
    echo "PM2 nicht gefunden - starte mit node..."
    NODE_ENV=production node dist/boot.js &
fi

echo "========================================"
echo "Deploy fertig!"
echo ""
echo "Logs: pm2 logs homyhomegrow"
echo "Stop: pm2 stop homyhomegrow"
echo "========================================"
