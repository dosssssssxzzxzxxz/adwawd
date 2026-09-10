import express, { Router, Request, Response } from 'express';
import { DetectionDB } from '../services/DetectionDB';

const router = Router();
const db = new DetectionDB();

router.get('/', async (req: Request, res: Response) => {
  try {
    const signatures = await db.getAllSignatures();
    res.json({
      count: signatures.length,
      signatures,
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch signatures' });
  }
});

router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    const sig = await db.findSignature(hash);
    
    if (!sig) {
      return res.status(404).json({ error: 'Signature not found' });
    }

    res.json(sig);
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

export default router;
