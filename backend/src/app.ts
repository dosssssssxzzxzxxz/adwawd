import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import checkRoutes from './api/checkRoutes';
import signatureRoutes from './api/signatureRoutes';
import whitelistRoutes from './api/whitelistRoutes';
import dashboardRoutes from './api/dashboardRoutes';
import authRoutes from './api/authRoutes';
import { auth } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/check', checkRoutes);
app.use('/api/signatures', signatureRoutes);

// Protected routes
app.use('/api/whitelist', auth, whitelistRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`\n[+] SA-MP PC Checker API running on port ${PORT}`);
  console.log(`[+] Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`[+] Database: Supabase PostgreSQL`);
  console.log(`\n[✓] Ready for scans\n`);
});

export default app;
