import { Router, Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = result.rows[0];

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin.id.toString());
    res.json({ token, role: admin.role, username: admin.username });
  } catch (error) {
    console.error('[ERROR] Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  // JWT is stateless — client just drops the token
  res.json({ success: true, message: 'Logged out' });
});

export default router;
