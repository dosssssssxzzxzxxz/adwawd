import express, { Router, Request, Response } from 'express';
import { DetectionDB } from '../services/DetectionDB';

const router = Router();
const db = new DetectionDB();

router.get('/', async (req: Request, res: Response) => {
  try {
    const whitelist = await db.getWhitelist();
    res.json({
      count: whitelist.length,
      whitelist,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { hash, fileName, fileType, reason } = req.body;

    if (!hash || hash.length !== 64) {
      return res.status(400).json({ error: 'Invalid SHA-256 hash' });
    }

    await db.addWhitelist(hash, fileName, fileType, reason);

    res.json({
      success: true,
      message: 'Hash added to whitelist',
      hash,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
});

router.delete('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;

    if (hash.length !== 64) {
      return res.status(400).json({ error: 'Invalid hash' });
    }

    await db.removeWhitelist(hash);

    res.json({
      success: true,
      message: 'Hash removed from whitelist',
      hash,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
});

export default router;
