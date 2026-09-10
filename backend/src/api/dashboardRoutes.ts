import express, { Router, Request, Response } from 'express';
import { DetectionDB } from '../services/DetectionDB';

const router = Router();
const db = new DetectionDB();

router.get('/scans', async (req: Request, res: Response) => {
  try {
    const { filter = 'ALL', limit = 50, offset = 0 } = req.query;

    const scans = await db.getScans({
      filter: filter as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json({
      total: scans.length,
      scans,
      filter,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

router.get('/scans/:scanId', async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;

    const scan = await db.getScanById(scanId);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json(scan);
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStatistics();

    res.json({
      totalScans: stats.totalScans,
      cleanScans: stats.cleanScans,
      unknownScans: stats.unknownScans,
      suspiciousScans: stats.suspiciousScans,
      cheatsDetected: stats.cheatsDetected,
      uniquePlayers: stats.uniquePlayers,
      topDetections: stats.topDetections,
      lastScanTime: stats.lastScanTime,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
