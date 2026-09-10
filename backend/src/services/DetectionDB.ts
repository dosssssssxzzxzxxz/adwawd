import { pool } from '../db';

export class DetectionDB {

  async findSignature(hash: string) {
    const res = await pool.query('SELECT * FROM signatures WHERE hash = $1', [hash]);
    return res.rows[0] || null;
  }

  async isWhitelisted(hash: string) {
    const res = await pool.query('SELECT 1 FROM whitelist WHERE hash = $1', [hash]);
    return res.rows.length > 0;
  }

  async addSignature(sig: any) {
    await pool.query(
      `INSERT INTO signatures (hash, file_type, name, severity, action, detection_reason)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (hash) DO NOTHING`,
      [sig.hash, sig.type, sig.name, sig.severity, sig.action, sig.detection_reason]
    );
  }

  async removeSignature(hash: string) {
    await pool.query('DELETE FROM signatures WHERE hash = $1', [hash]);
  }

  async getAllSignatures() {
    const res = await pool.query('SELECT * FROM signatures ORDER BY created_at DESC');
    return res.rows;
  }

  async addWhitelist(hash: string, fileName?: string, fileType?: string, reason?: string) {
    await pool.query(
      `INSERT INTO whitelist (hash, file_name, file_type, reason)
       VALUES ($1,$2,$3,$4) ON CONFLICT (hash) DO NOTHING`,
      [hash, fileName, fileType, reason]
    );
  }

  async removeWhitelist(hash: string) {
    await pool.query('DELETE FROM whitelist WHERE hash = $1', [hash]);
  }

  async getWhitelist() {
    const res = await pool.query('SELECT * FROM whitelist ORDER BY created_at DESC');
    return res.rows;
  }

  async saveScan(scanId: string, playerName: string, results: any) {
    await pool.query(
      `INSERT INTO scans (scan_id, player_name, overall_result, detection_count,
        known_cheats, unknown_files, suspicious_modules, scan_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (scan_id) DO NOTHING`,
      [
        scanId,
        playerName,
        results.overallResult || 'UNKNOWN',
        results.detectionCount || 0,
        results.knownCheats || 0,
        results.unknownFiles || 0,
        results.suspiciousModules?.length || 0,
        JSON.stringify(results),
      ]
    );
  }

  async getScans(options: { filter?: string; limit?: number; offset?: number }) {
    const filter = options.filter && options.filter !== 'ALL' ? options.filter : null;
    const limit = options.limit || 50;
    const offset = options.offset || 0;

    const query = filter
      ? `SELECT * FROM scans WHERE overall_result = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`
      : `SELECT * FROM scans ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

    const params = filter ? [filter, limit, offset] : [limit, offset];
    const res = await pool.query(query, params);
    return res.rows;
  }

  async getScanById(scanId: string) {
    const res = await pool.query('SELECT * FROM scans WHERE scan_id = $1', [scanId]);
    return res.rows[0] || null;
  }

  async getStatistics() {
    const res = await pool.query(`
      SELECT
        COUNT(*) AS "totalScans",
        SUM(CASE WHEN overall_result='CLEAN' THEN 1 ELSE 0 END) AS "cleanScans",
        SUM(CASE WHEN overall_result='UNKNOWN' THEN 1 ELSE 0 END) AS "unknownScans",
        SUM(CASE WHEN overall_result='SUSPICIOUS' THEN 1 ELSE 0 END) AS "suspiciousScans",
        SUM(CASE WHEN overall_result='CHEAT_DETECTED' THEN 1 ELSE 0 END) AS "cheatsDetected",
        COUNT(DISTINCT player_name) AS "uniquePlayers",
        MAX(created_at) AS "lastScanTime"
      FROM scans
    `);
    return { ...res.rows[0], topDetections: [] };
  }
}
