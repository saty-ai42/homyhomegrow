# HomyHomegrow - Migration zu WebGo

> Diese Anleitung zeigt dir Schritt fur Schritt, wie du HomyHomegrow auf deinem WebGo-Server hostest.

---

## Voraussetzungen bei WebGo

- **WebHosting-Paket mit Node.js** (mind. Node 18+)
- **MySQL Datenbank** (im Kundencenter erstellt)
- **SSH/FTP Zugang** zum Server

---

## Schritt 1: Projektdateien auf WebGo ubertragen

### Option A: Per FTP
1. Lade den gesamten Ordner `/mnt/agents/output/app/` herunter
2. Entpacke ihn lokal
3. Lade alle Dateien per FTP in dein WebGo-Verzeichnis (z.B. `/home/www/homyhomegrow/`)

### Option B: Per Git
```bash
git clone [dein-repo-url] /home/www/homyhomegrow/
cd /home/www/homyhomegrow/
```

---

## Schritt 2: MySQL Datenbank erstellen (WebGo Kundencenter)

1. **Kundencenter** → **Datenbanken** → **MySQL-Datenbanken**
2. Auf **Neue Datenbank erstellen** klicken
3. Datenbank-Name, Benutzername und Passwort notieren
4. Deine Daten sehen so aus:
   ```
   Host: localhost (oder s120.goserver.host)
   Datenbank: db123456_homy
   Benutzer: dbu123456
   Passwort: dein-db-passwort
   ```

---

## Schritt 3: .env Datei anpassen

Kopiere die Vorlage:
```bash
cp .env.example .env
```

Editiere `.env` und ersetze die Platzhalter:

```env
# Kimi OAuth (bleibt gleich - kopiere aus aktueller .env)
APP_ID=19e06927-67f2-800e-8000-0000b55a6258
APP_SECRET=zonszVKLbNbXGaokadh6lQLPIKTxSFLw
VITE_APP_ID=19e06927-67f2-800e-8000-0000b55a6258
VITE_KIMI_AUTH_URL=https://auth.kimi.com
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=d5udf1b2ulb3drrerfv0

# WEBGO DATABASE
DATABASE_URL=mysql://dbu123456:dein-db-passwort@localhost:3306/db123456_homy

# WEBGO SMTP (deine aktuellen Daten)
SMTP_HOST=s120.goserver.host
SMTP_PORT=465
SMTP_USER=web76p2
SMTP_PASS=Info1983!
SMTP_FROM=newsletter@homyhomegrow.de
```

**Wichtig:** Die DATABASE_URL anpassen:
- `dbu123456` → dein WebGo DB-Benutzer
- `dein-db-passwort` → dein WebGo DB-Passwort
- `localhost` → dein WebGo DB-Host (meist localhost)
- `db123456_homy` → dein WebGo DB-Name

---

## Schritt 4: Node.js bei WebGo aktivieren

1. **Kundencenter** → **WebHosting** → **deine Domain**
2. Unter **Node.js** auf **Aktivieren** klicken
3. Version: **Node 20** (oder hoher)
4. Einstiegspunkt: `dist/boot.js`
5. Umgebungsvariable: `NODE_ENV=production`

**ODER** per SSH:
```bash
# Bei WebGo einloggen
ssh dein-benutzername@dein-server.de

# Zum Projekt-Ordner
cd /home/www/homyhomegrow

# Node.js aktivieren (falls verfugbar)
module load node/20

# Dependencies installieren
npm install

# Build durchfuhren
npm run build

# Datenbank Schema syncen
npm run db:push

# Mit PM2 starten (falls verfugbar)
npm run start:pm2

# ODER einfach mit node
npm start
```

---

## Schritt 5: Kimi OAuth Callback anpassen

**Wichtig!** Nach dem Umzug muss die Callback-URL in Kimi aktualisiert werden:

1. **Kimi Portal** → **Anwendungen** → **HomyHomegrow**
2. **OAuth-Client** bearbeiten
3. **Callback URL** auf deine neue Domain setzen:
   ```
   https://homyhomegrow.de/api/oauth/callback
   ```
4. Auch die `.env` anpassen:
   ```env
   # In der .env bei WebGo
   KIMI_AUTH_URL=https://auth.kimi.com
   # (bleibt gleich, die Redirect-URL wird von Kimi verwaltet)
   ```

---

## Schritt 6: SSL/HTTPS aktivieren

1. **Kundencenter** → **SSL-Zertifikate**
2. **Let's Encrypt** fur `homyhomegrow.de` aktivieren
3. Auch `www.homyhomegrow.de` hinzufugen
4. Automatische Weiterleitung HTTP → HTTPS aktivieren

---

## Schritt 7: Domain einrichten

1. **Kundencenter** → **Domains** → **deine Domain**
2. Zielverzeichnis auf `/homyhomegrow/` setzen
3. Node.js als Handler aktivieren (falls notig)

---

## Datenbank-Migration (von Kimi zu WebGo)

Falls du bestehende Daten ubernehmen willst:

```bash
# 1. Daten von Kimi-DB exportieren
mysqldump -h kimidbhost -u user -p database > backup.sql

# 2. Daten in WebGo-DB importieren
mysql -h localhost -u dbu123456 -p db123456_homy < backup.sql
```

**ODER** neu anfangen (Seed-Daten):
```bash
cd /home/www/homyhomegrow
npm run db:push
# Seed-Daten werden automatisch erstellt
```

---

## Troubleshooting

### Fehler: "Cannot connect to database"
- Prufe DATABASE_URL in .env
- Datenbank-Host bei WebGo meist `localhost` oder `127.0.0.1`
- Firewall-Regeln im Kundencenter prufen

### Fehler: "Port already in use"
- Anderen Port in der .env setzen: `PORT=8080`
- Oder WebGo-Port im Kundencenter andern

### Fehler: "Permission denied"
- `chmod +x deploy.sh`
- Rechte der Dateien per FTP prufen

### Newsletter-Emails kommen nicht an
- WebGo Firewall: Port 465 (SSL) muss offen sein
- SPF-Record bei WebGo DNS setzen: `v=spf1 include:webgo.de ~all`
- Test: `telnet s120.goserver.host 465`

---

## Nützliche Befehle

```bash
# Logs ansehen
pm2 logs homyhomegrow

# Server neustarten
pm2 restart homyhomegrow

# Server stoppen
pm2 stop homyhomegrow

# Datenbank checken
npm run db:push

# Neu bauen
npm run build
```

---

**Fragen?** Alles was bei Kimi funktioniert, funktioniert identisch bei WebGo - nur die Datenbank-URL und der Server-Host andern sich!
