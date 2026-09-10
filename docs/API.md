# SA-MP PC Checker — API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Check Endpoints (Public)

#### POST /check/start

Start a new scan.

**Request:**
```json
{
  "playerName": "PlayerName",
  "helperAvailable": true,
  "helperData": {
    "asiFiles": [...],
    "moonloaderFiles": [...],
    "cleoFiles": [...],
    "loadedModules": [...],
    "hiddenFiles": [...]
  }
}
```

**Response:**
```json
{
  "scanId": "SCAN-ABC12345"
}
```

**Status Codes:**
- `200` — Scan started
- `400` — Invalid player name
- `500` — Server error

---

#### GET /check/status/:scanId

Get scan progress and results.

**Response:**
```json
{
  "scanId": "SCAN-ABC12345",
  "progress": 75,
  "complete": false,
  "results": null
}
```

When complete:
```json
{
  "scanId": "SCAN-ABC12345",
  "progress": 100,
  "complete": true,
  "results": {
    "overallResult": "CHEAT_DETECTED",
    "detections": [...],
    "suspiciousModules": [...],
    "hiddenFiles": [...],
    "asiCount": 2,
    "moonloaderCount": 0,
    "cleoCount": 1,
    "loadedModules": 3,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` — Scan status
- `404` — Scan not found
- `500` — Server error

---

### Signature Endpoints (Public)

#### GET /signatures

Get all cheat signatures.

**Response:**
```json
{
  "count": 42,
  "signatures": [
    {
      "hash": "sha256_hash",
      "type": "asi",
      "name": "Cheat Name v1.0",
      "severity": "HIGH",
      "action": "BAN"
    }
  ]
}
```

---

#### GET /signatures/:hash

Get signature by hash.

**Response:**
```json
{
  "hash": "sha256_hash",
  "type": "asi",
  "name": "Cheat Name v1.0",
  "severity": "HIGH",
  "action": "BAN",
  "detection_reason": "Known malicious cheat"
}
```

**Status Codes:**
- `200` — Signature found
- `404` — Signature not found

---

### Whitelist Endpoints (Protected)

#### GET /whitelist

Get all whitelisted hashes.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "count": 5,
  "whitelist": [
    "sha256_hash_1",
    "sha256_hash_2"
  ]
}
```

---

#### POST /whitelist

Add hash to whitelist.

**Request:**
```json
{
  "hash": "sha256_hash_64chars",
  "fileName": "legit_mod.asi",
  "fileType": "asi",
  "reason": "Approved server modification"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hash added to whitelist",
  "hash": "sha256_hash_64chars"
}
```

**Status Codes:**
- `200` — Added
- `400` — Invalid hash
- `401` — Not authenticated
- `500` — Server error

---

#### DELETE /whitelist/:hash

Remove hash from whitelist.

**Response:**
```json
{
  "success": true,
  "message": "Hash removed from whitelist",
  "hash": "sha256_hash_64chars"
}
```

**Status Codes:**
- `200` — Removed
- `401` — Not authenticated
- `404` — Hash not found

---

### Dashboard Endpoints (Protected)

#### GET /dashboard/scans

Get scan history.

**Query Parameters:**
- `filter` — CLEAN | UNKNOWN | SUSPICIOUS | CHEAT_DETECTED | ALL (default: ALL)
- `limit` — Results per page (default: 50)
- `offset` — Pagination offset (default: 0)

**Response:**
```json
{
  "total": 124,
  "filter": "ALL",
  "scans": [
    {
      "scanId": "SCAN-ABC12345",
      "playerName": "PlayerName",
      "timestamp": "2024-01-15T10:30:00Z",
      "overallResult": "CLEAN",
      "detectionCount": 0
    }
  ]
}
```

---

#### GET /dashboard/scans/:scanId

Get complete scan report.

**Response:**
```json
{
  "scanId": "SCAN-ABC12345",
  "playerName": "PlayerName",
  "results": {
    "overallResult": "CHEAT_DETECTED",
    "detections": [
      {
        "type": "ASI",
        "name": "Cheat v1.0",
        "path": "C:\\GTA San Andreas\\cheat.asi",
        "hash": "sha256_hash",
        "severity": "HIGH"
      }
    ],
    "suspiciousModules": [],
    "hiddenFiles": [],
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` — Scan found
- `401` — Not authenticated
- `404` — Scan not found

---

#### GET /dashboard/stats

Get server statistics.

**Response:**
```json
{
  "totalScans": 450,
  "cleanScans": 380,
  "unknownScans": 45,
  "suspiciousScans": 20,
  "cheatsDetected": 5,
  "uniquePlayers": 350,
  "topDetections": [
    {
      "name": "Cheat v1.0",
      "count": 12
    }
  ],
  "lastScanTime": "2024-01-15T10:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- 100 requests per minute per IP
- Applies to `/check/start` only
- Returns 429 if exceeded

---

## Examples

### Start a Scan

```bash
curl -X POST http://localhost:3000/api/check/start \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "PlayerName",
    "helperAvailable": true
  }'
```

### Check Scan Status

```bash
curl http://localhost:3000/api/check/status/SCAN-ABC12345
```

### Get Whitelist (Protected)

```bash
curl -H "Authorization: Bearer jwt_token_here" \
  http://localhost:3000/api/whitelist
```

### Add to Whitelist

```bash
curl -X POST http://localhost:3000/api/whitelist \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "sha256_hash_64_chars",
    "fileName": "mod.asi",
    "fileType": "asi",
    "reason": "Approved modification"
  }'
```

---

## WebSocket (Future)

Real-time scan updates coming in v2.0.

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
ws.onmessage = (event) => {
  const { scanId, progress, results } = JSON.parse(event.data);
  console.log(`${scanId}: ${progress}% complete`);
};
```
