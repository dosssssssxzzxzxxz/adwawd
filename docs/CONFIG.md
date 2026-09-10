# Configuration Guide — SA-MP PC Checker

## Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=samp_checker
DB_PASSWORD=your_password
DB_NAME=samp_checker

# Discord Webhook
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/ID/TOKEN

# Security
JWT_SECRET=extremely_long_random_string_change_this
JWT_EXPIRY=24h

# CORS
FRONTEND_URL=https://your-domain.com
HELPER_PORT=9999

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/samp-checker.log
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_SCANNER_NAME=SA-MP Scanner
```

## Managing Cheat Signatures

### Add Signature (SQL)

```sql
INSERT INTO signatures (hash, file_type, name, severity, action, detection_reason)
VALUES (
  'sha256_hash_here',
  'asi',
  'Cheat Name v1.0',
  'HIGH',
  'BAN',
  'Description of detection'
);
```

### Add Signature (API)

```bash
curl -X POST http://localhost:3000/api/signatures \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "sha256_hash",
    "type": "asi",
    "name": "Cheat v1.0",
    "severity": "HIGH",
    "action": "BAN",
    "reason": "Known malicious cheat"
  }'
```

### Import Signatures (Bulk)

```sql
LOAD DATA LOCAL INFILE '/path/to/signatures.csv'
INTO TABLE signatures
FIELDS TERMINATED BY ','
(hash, file_type, name, severity, action, detection_reason);
```

### Update Signature

```sql
UPDATE signatures
SET name = 'Cheat v2.0', severity = 'CRITICAL'
WHERE hash = 'sha256_hash_here';
```

### Delete Signature

```sql
DELETE FROM signatures WHERE hash = 'sha256_hash_here';
```

## Whitelist Configuration

### Whitelist Legitimate Mods

Prevents false positives on approved modifications.

```sql
INSERT INTO whitelist (hash, file_name, file_type, reason)
VALUES (
  'sha256_hash',
  'my_server_mod.asi',
  'asi',
  'Official server modification'
);
```

### View Whitelist

```bash
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/whitelist
```

### Remove from Whitelist

```sql
DELETE FROM whitelist WHERE hash = 'sha256_hash_here';
```

## Cosmetic Modifications (Ignored)

These are never flagged regardless of modifications:

- **Player Skins** — Custom skin packs
- **Vehicle Models** — Vehicle replacements
- **Textures** — TXD file modifications
- **Visual Effects** — Effects.ide changes
- **Timecyc** — Weather/time modifications
- **World Models** — DFF replacements

To customize ignored extensions, edit `backend/src/services/ScanEngine.ts`:

```typescript
const cosmeticExtensions = [
  '.txd',      // Textures
  '.dff',      // Models
  '.col',      // Collisions
  '.ide',      // Models index
  '.ipl',      // Instance placements
  '.timecyc',  // Timecycle
];
```

## Detection Classifications

### CLEAN
- No detections found
- File passes all checks
- Safe to play

### WHITELISTED
- Hash is in whitelist
- Approved by server admin
- No action taken

### UNKNOWN
- File not recognized
- Not in signature database
- Requires manual review

### SUSPICIOUS
- Pattern matches known cheat behavior
- Module interacting with GTA
- Debugger or cheat tool detected
- Requires review before banning

### KNOWN_CHEAT
- Hash matches known malicious file
- High confidence detection
- Automatic action (BAN/BLOCK)

## Detection Levels

### LOW
- Minor suspicious indicators
- Could be false positive
- Action: WARN

### MEDIUM
- Multiple suspicious patterns
- Likely modified cheat
- Action: WARN/BLOCK

### HIGH
- Known malicious cheat
- Confirmed harmful
- Action: BAN

### CRITICAL
- Severe malware detected
- Instant detection
- Action: BAN

## Discord Webhook Configuration

### Create Webhook

1. Go to Discord Server Settings
2. Integrations → Webhooks
3. New Webhook
4. Configure channel and permissions
5. Copy URL

### Webhook URL Format

```
https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN
```

### Test Webhook

```bash
curl -X POST "https://discord.com/api/webhooks/ID/TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message",
    "embeds": [{
      "title": "Test",
      "description": "Webhook is working",
      "color": 3066993
    }]
  }'
```

### Message Formatting

Reports include:
- Player name & scan ID
- Overall result with emoji
- Detected cheats (if any)
- Loaded suspicious modules
- Hidden files
- Cosmetic modifications (ignored)
- Detailed timestamps

## Database Maintenance

### Backup

```bash
# Full backup
mysqldump -u root -p samp_checker > backup.sql

# Compressed backup
mysqldump -u root -p samp_checker | gzip > backup.sql.gz
```

### Restore

```bash
mysql -u root -p samp_checker < backup.sql
```

### Optimize Tables

```bash
mysql -u root -p -e "OPTIMIZE TABLE signatures, whitelist, scans, scan_detections;" samp_checker
```

### View Statistics

```sql
SELECT overall_result, COUNT(*) as count FROM scans 
GROUP BY overall_result;

SELECT file_type, COUNT(*) as count FROM signatures 
GROUP BY file_type;

SELECT severity, COUNT(*) as count FROM signatures 
GROUP BY severity;
```

## Security Configuration

### Change JWT Secret

```bash
# Generate new secret (Linux)
openssl rand -base64 32

# Update .env
JWT_SECRET=new_generated_secret_here
```

### Rotate Admin Password

```sql
-- Generate bcrypt hash of new password
UPDATE admins SET password_hash = '$2b$10$...' 
WHERE username = 'admin';
```

### Enable HTTPS (Production)

```nginx
# Nginx example
server {
    listen 443 ssl;
    server_name api.your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

### Restrict Admin Access

```nginx
# Only allow admin from specific IP
location /api/dashboard {
    allow 192.168.1.100;
    deny all;
    proxy_pass http://localhost:3000;
}
```

## Performance Tuning

### Database Indexes

Add indexes for common queries:

```sql
-- Already included in schema
CREATE INDEX idx_scan_result ON scans(overall_result);
CREATE INDEX idx_player_name ON scans(player_name);
CREATE INDEX idx_hash ON signatures(hash);
```

### Cache Signatures

Backend caches signatures in memory. To refresh:

```bash
# Restart API
pm2 restart samp-checker
```

### Connection Pool

Configure in backend if using persistent connections:

```typescript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
```

## Custom Scanner Rules

Modify detection engine in `backend/src/services/ScanEngine.ts`:

```typescript
async analyzeScanData(helperData: any) {
  // Add custom detection logic
  if (helperData.files) {
    for (const file of helperData.files) {
      // Your custom analysis
    }
  }
}
```

## Troubleshooting

### Scans Stuck at 100%

```bash
# Check backend logs
tail -f /var/log/samp-checker.log

# Restart if needed
pm2 restart samp-checker
```

### Discord Messages Not Sending

- Verify webhook URL
- Check Discord channel permissions
- Ensure bot can send messages
- Check firewall/network access

### False Positives

1. Review detection in `/dashboard/scans/:scanId`
2. Check signature legitimacy
3. Add to whitelist if approved
4. Update signature if incorrect

### Database Locked

```sql
-- Check running processes
SHOW PROCESSLIST;

-- Kill long-running query
KILL QUERY process_id;
```

## Monitoring

### Daily Statistics

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as scans,
  SUM(CASE WHEN overall_result = 'CHEAT_DETECTED' THEN 1 ELSE 0 END) as cheats
FROM scans
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### Top Detections

```sql
SELECT file_name, COUNT(*) as count FROM scan_detections
GROUP BY file_name
ORDER BY count DESC
LIMIT 20;
```

### Admin Activity

```sql
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;
```
