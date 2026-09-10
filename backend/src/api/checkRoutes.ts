import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DetectionDB } from '../services/DetectionDB';
import { DiscordWebhook } from '../services/DiscordWebhook';

const router = Router();
const db = new DetectionDB();
const discord = new DiscordWebhook();

// In-memory progress tracker only (results persist to DB)
const scans = new Map();

interface ScanRequest {
  playerName: string;
  helperAvailable: boolean;
  helperData?: any;
}

router.post('/start', async (req: Request, res: Response) => {
  try {
    const { playerName, helperAvailable, helperData } = req.body as ScanRequest;
    const scanId = `SCAN-${uuidv4().substring(0, 8).toUpperCase()}`;

    if (!playerName || playerName.trim().length === 0) {
      return res.status(400).json({ error: 'Player name required' });
    }

    if (playerName.length > 24) {
      return res.status(400).json({ error: 'Player name too long (max 24 chars)' });
    }

    scans.set(scanId, {
      playerName: playerName.trim(),
      startTime: Date.now(),
      progress: 0,
      complete: false,
      results: null,
    });

    // Start scan in background
    performScan(scanId, playerName.trim(), helperAvailable, helperData).catch(console.error);

    res.json({ scanId });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Scan start failed' });
  }
});

router.get('/status/:scanId', (req: Request, res: Response) => {
  const { scanId } = req.params;
  const scan = scans.get(scanId);

  if (!scan) {
    return res.status(404).json({ error: 'Scan not found' });
  }

  res.json({
    scanId,
    progress: scan.progress,
    complete: scan.complete,
    results: scan.results,
  });
});

async function performScan(
  scanId: string,
  playerName: string,
  helperAvailable: boolean,
  helperData: any
) {
  const scan = scans.get(scanId);

  try {
    const stages = [
      { name: 'connecting',  progress: 10 },
      { name: 'identifying', progress: 20 },
      { name: 'asi',         progress: 35 },
      { name: 'moonloader',  progress: 50 },
      { name: 'cleo',        progress: 60 },
      { name: 'modules',     progress: 75 },
      { name: 'hidden',      progress: 85 },
      { name: 'processes',   progress: 95 },
    ];

    const results: any = {
      overallResult: 'CLEAN',
      detections: [],
      suspiciousModules: [],
      hiddenFiles: [],
      asiCount: 0,
      moonloaderCount: 0,
      cleoCount: 0,
      loadedModules: 0,
      timestamp: new Date(),
    };

    if (helperData) {
      // Analyze ASI files
      if (helperData.asiFiles && helperData.asiFiles.length > 0) {
        results.asiCount = helperData.asiFiles.length;
        for (const asi of helperData.asiFiles) {
          const sig = await db.findSignature(asi.hash);
          if (sig) {
            results.detections.push({
              type: 'ASI',
              name: sig.name,
              path: asi.path,
              hash: asi.hash,
              severity: sig.severity,
            });
            if (sig.severity === 'HIGH' || sig.severity === 'CRITICAL') {
              results.overallResult = 'CHEAT_DETECTED';
            }
          }
        }
      }

      // Analyze loaded modules
      if (helperData.loadedModules && helperData.loadedModules.length > 0) {
        results.loadedModules = helperData.loadedModules.length;
        for (const mod of helperData.loadedModules) {
          if (mod.suspicious) {
            results.suspiciousModules.push({
              name: mod.name,
              status: 'Loaded into gta_sa.exe',
              gtaInteraction: mod.gtaInteraction || 'NONE',
            });
            if (mod.gtaInteraction === 'DETECTED') {
              results.overallResult = 'SUSPICIOUS';
            }
          }
        }
      }

      // Analyze hidden files
      if (helperData.hiddenFiles && helperData.hiddenFiles.length > 0) {
        for (const file of helperData.hiddenFiles) {
          const sig = await db.findSignature(file.hash);
          results.hiddenFiles.push({
            name: file.name,
            classification: sig ? sig.name : 'UNKNOWN',
            attributes: file.attributes,
          });
        }
      }

      // Analyze MoonLoader
      if (helperData.moonloaderFiles) {
        results.moonloaderCount = helperData.moonloaderFiles.length;
      }

      // Analyze CLEO
      if (helperData.cleoFiles) {
        results.cleoCount = helperData.cleoFiles.length;
      }
    }

    // Simulate progress through stages
    for (const stage of stages) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      scan.progress = stage.progress;
    }

    scan.progress = 100;
    scan.results = results;
    scan.complete = true;

    // Persist scan to database
    await db.saveScan(scanId, playerName, results);

    // Send to Discord
    await discord.sendReport(scanId, playerName, results);

  } catch (error) {
    console.error(`[ERROR] Scan ${scanId} failed:`, error);
    scan.complete = true;
    scan.results = { error: 'Scan failed', overallResult: 'ERROR' };
  }
}

export default router;
