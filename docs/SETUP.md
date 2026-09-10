# Setup Guide — SA-MP PC Checker

## Prerequisites

- **Node.js** v18+ with npm
- **MySQL** 8.0+
- **Windows** (for helper compilation)
- **.NET 6+ SDK** (for helper)

## Step 1: Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Run schema
SOURCE /path/to/database/schema.sql;
```

Create a database user:

```sql
CREATE USER 'samp_checker'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON samp_checker.* TO 'samp_checker'@'localhost';
FLUSH PRIVILEGES;
```

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and edit environment file
cp .env.example .env

# Edit .env:
# - DB_USER=samp_checker
# - DB_PASSWORD=strong_password
# - DISCORD_WEBHOOK_URL=your_webhook_url
# - JWT_SECRET=unique_secret_key

# Start development server
npm run dev
# or build for production
npm run build && npm start
```

## Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# or build for production
npm run build
```

Access at: `http://localhost:3000`

## Step 4: Helper (Windows Only)

### Option A: Build from Source

```bash
cd helper

# Build release
dotnet build -c Release

# Output: bin/Release/SampChecker.exe
```

### Option B: Use Pre-built

Download the portable executable from releases.

### Running the Helper

```bash
SampChecker.exe
# Listens on http://localhost:9999
```

The helper will:
- Scan for GTA:SA installation
- Inspect ASI, MoonLoader, CLEO files
- Check loaded modules
- Detect suspicious processes
- Report via local HTTPS

## Step 5: Discord Webhook Setup

1. Create a Discord server (or use existing)
2. Create a private channel for reports
3. Get webhook URL:
   - Settings → Integrations → Webhooks
   - New Webhook → Copy URL
4. Paste in `.env`:
   ```
   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
   ```

## Deployment

### Docker Compose

```bash
# Create docker-compose.yml in project root
docker-compose up -d

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:3001
# - MySQL: localhost:3306
```

### Production (VPS/Cloud)

1. **Backend:**
   ```bash
   npm run build
   pm2 start dist/app.js --name samp-checker
   ```

2. **Frontend:**
   ```bash
   npm run build
   # Serve dist/ with nginx/apache
   ```

3. **Helper:**
   - Distribute portable .exe to players
   - No central deployment needed

4. **SSL/TLS:**
   - Use Let's Encrypt for HTTPS
   - Nginx reverse proxy recommended

## Verification

### Check Backend

```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"..."}
```

### Check Frontend

Visit `http://localhost:3000` in browser

### Check Helper

```bash
curl http://localhost:9999/status
# Response: {"status":"online"}
```

## Troubleshooting

### Database Connection Failed

- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Ensure database user has privileges

### Frontend can't reach API

- Verify backend is running on port 3000
- Check CORS settings in backend
- Verify `FRONTEND_URL` in `.env`

### Helper not detected

- Ensure helper.exe is running
- Check Windows Firewall settings
- Verify localhost:9999 is accessible

### Discord webhook failing

- Verify webhook URL is correct
- Check webhook hasn't been revoked
- Ensure bot has permissions

## Initial Admin Login

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Change immediately in production!**

```bash
# Update password in database
mysql samp_checker -u root -p
UPDATE admins SET password_hash = '$2b$10$...' WHERE username='admin';
```

## Security Checklist

- [ ] Change JWT_SECRET in .env
- [ ] Change database password
- [ ] Change default admin password
- [ ] Enable HTTPS/TLS on production
- [ ] Configure firewall rules
- [ ] Restrict admin panel access
- [ ] Set up SSL certificates
- [ ] Enable database backups
- [ ] Configure log rotation
- [ ] Review Discord webhook permissions

## Next Steps

1. Load cheat signatures into database
2. Configure whitelist for legitimate mods
3. Set up admin accounts
4. Test scanner with helper
5. Configure Discord reporting
6. Deploy to production

See `API.md` and `CONFIG.md` for advanced configuration.
