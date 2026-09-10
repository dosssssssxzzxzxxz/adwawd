# SA-MP PC Checker — Complete Anti-Cheat Platform

Modern, lightweight web-based GTA San Andreas Multiplayer cheat detection system. No traditional installation required for players.

## Features

✅ **Web-Based Scanner** — Open browser, enter name, click check  
✅ **Portable Helper** — Optional Windows executable for deep system access  
✅ **ASI Detection** — Hash comparison against signature database  
✅ **MoonLoader Scanning** — Lua/Luac script detection  
✅ **CLEO Detection** — CS/CSA script classification  
✅ **Loaded Modules** — Real-time DLL/ASI injection detection  
✅ **Hidden Files** — Windows attribute inspection  
✅ **Process Monitoring** — Detect debuggers and cheat tools  
✅ **Discord Webhook** — Markdown-formatted scan reports  
✅ **Admin Dashboard** — Full scan history and filtering  
✅ **Cosmetic Mods Ignored** — No false positives on skins/textures  
✅ **Privacy-Focused** — Only GTA/SA-MP directories scanned  

## Project Structure

```
samp-pc-checker/
├── frontend/                 # React web interface
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── helper/                   # Windows C# scanner
│   ├── SampChecker/
│   │   ├── Program.cs
│   │   ├── GtaScanner.cs
│   │   ├── ProcessInspector.cs
│   │   ├── FileHasher.cs
│   │   ├── HelperLocalServer.cs
│   │   └── SampChecker.csproj
│
├── database/
│   ├── schema.sql
│   └── seeds/
│       ├── signatures.json
│       └── whitelist.json
│
└── docs/
    ├── SETUP.md
    ├── API.md
    └── CONFIG.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 3. Helper (Windows)

```bash
cd helper
dotnet build -c Release
# Output: bin/Release/SampChecker.exe
```

### 4. Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p samp_checker < database/seeds/signatures.json
```

## Environment Variables

Create `.env` in backend/:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=samp_checker

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# JWT
JWT_SECRET=your-secret-key-here

# CORS
FRONTEND_URL=http://localhost:3000
HELPER_PORT=9999
```

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

This starts:
- React frontend on `http://localhost:3000`
- Node API on `http://localhost:3001`
- MySQL database on `localhost:3306`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ with nginx/apache
```

**Backend:**
```bash
cd backend
npm run build
pm2 start dist/app.js
```

**Helper:**
- Distribute `SampChecker.exe` as portable executable
- No installation needed
- Runs on localhost:9999

## API Endpoints

### Public
- `POST /api/check/start` — Start new scan
- `GET /api/check/status/:scanId` — Poll scan progress
- `GET /api/signatures` — Get cheat signature hashes

### Protected (Requires Auth)
- `GET /api/dashboard/scans` — Scan history
- `POST /api/whitelist` — Add hash to whitelist
- `DELETE /api/whitelist/:hash` — Remove from whitelist

## Scanner Classification

```
CLEAN              — No detections
WHITELISTED        — Hash is in whitelist
UNKNOWN            — File not recognized
SUSPICIOUS         — Pattern matches suspicious behavior
KNOWN_CHEAT        — Hash matches known cheat database
```

## Discord Webhook Format

Reports sent as embeds with:
- Player name & scan ID
- Overall result (✅ CLEAN / ⚠️ UNKNOWN / ❌ CHEAT DETECTED)
- Detection breakdown by type
- Loaded module status
- Hidden file inventory
- Cosmetic mods (ignored)
- Process tools active

## Player Experience

```
1. Visit website
2. Enter SA-MP player name
3. Click "START PC CHECK"
4. System auto-detects Helper availability
5. Browser performs file/path checks
6. Helper (if available) performs deep scans
7. Results displayed in real-time
8. Report sent to Discord
9. Player receives PASS/REVIEW/BAN notification
```

## Security Notes

- All communications between helper and backend use HTTPS/TLS
- Scan results are not logged locally on player machines
- Helper does NOT establish persistence
- Helper does NOT require admin rights (scanned directories do)
- Only GTA/SA-MP relevant paths are inspected
- No keylogging, credential theft, or arbitrary file access
- Markdown in Discord messages is properly escaped to prevent injection

## Configuration

### Add Cheat Signatures

```json
{
  "hash": "SHA256_HASH_HERE",
  "type": "asi",
  "name": "Example Cheat v1.0",
  "severity": "HIGH",
  "action": "BAN",
  "detection_reason": "Known malicious ASI"
}
```

### Whitelist Legitimate Mods

```sql
INSERT INTO whitelist (hash, file_name, file_type, reason)
VALUES (
  'SHA256_HASH',
  'legitmod.asi',
  'asi',
  'Approved server mod'
);
```

### Customize Cosmetic Ignore List

Edit in `backend/src/services/DetectionDB.ts`:

```typescript
const cosmetic_extensions = [
  '.txd',     // Textures
  '.ide',     // Models
  '.col',     // Collision
  '.dff',     // Model files
];
```

## Support & Documentation

- **API Docs:** See `docs/API.md`
- **Setup Guide:** See `docs/SETUP.md`
- **Configuration:** See `docs/CONFIG.md`

## License

Private — Modify as needed for your server

---

**Forged in the Storm. Tempered in the Tower. Delivered clean.**
