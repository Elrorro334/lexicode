import express from 'express';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '../db/connection.js';
import { seedUserSrsQueue } from '../db/initDb.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = express.Router();

const SAFE_USER_FIELDS = `
  id, name, email, role, job_title, track, cefr_level, placement_completed,
  streak_days, merged_prs, deployments, theme_preference, last_practice_date, created_at
`;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, track = 'Full-Stack', job_title = 'Software Engineering Student' } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Name, valid email, and password (min 6 chars) are required.'
      });
    }

    const pool = await getPool();
    const existing = await pool.request()
      .input('email', sql.NVarChar(160), email.trim().toLowerCase())
      .query('SELECT id FROM dbo.Users WHERE email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('name', sql.NVarChar(120), name.trim())
      .input('email', sql.NVarChar(160), email.trim().toLowerCase())
      .input('password_hash', sql.NVarChar(255), passwordHash)
      .input('role', sql.NVarChar(30), 'student')
      .input('job_title', sql.NVarChar(120), job_title)
      .input('track', sql.NVarChar(40), track)
      .query(`
        INSERT INTO dbo.Users (name, email, password_hash, role, job_title, track, cefr_level, placement_completed)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role, INSERTED.job_title,
               INSERTED.track, INSERTED.cefr_level, INSERTED.placement_completed,
               INSERTED.streak_days, INSERTED.merged_prs, INSERTED.deployments, INSERTED.theme_preference
        VALUES (@name, @email, @password_hash, @role, @job_title, @track, 'B1', 0)
      `);

    const user = result.recordset[0];
    await seedUserSrsQueue(pool, user.id);
    const token = signToken(user);

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar(160), email.trim().toLowerCase())
      .query(`SELECT ${SAFE_USER_FIELDS}, password_hash FROM dbo.Users WHERE email = @email`);

    const found = result.recordset[0];
    if (!found) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, found.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const { password_hash, ...user } = found;
    const token = signToken(user);

    return res.json({ success: true, token, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query(`SELECT ${SAFE_USER_FIELDS} FROM dbo.Users WHERE id = @id`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, user: result.recordset[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { track, cefr_level, job_title, theme_preference, placement_completed } = req.body;
    const pool = await getPool();

    const sets = [];
    const request = pool.request().input('id', sql.Int, req.user.id);

    if (track && ['Full-Stack', 'QA', 'DevOps'].includes(track)) {
      sets.push('track = @track');
      request.input('track', sql.NVarChar(40), track);
    }
    if (cefr_level && ['B1', 'B1+', 'B2'].includes(cefr_level)) {
      sets.push('cefr_level = @cefr_level');
      request.input('cefr_level', sql.NVarChar(10), cefr_level);
    }
    if (job_title) {
      sets.push('job_title = @job_title');
      request.input('job_title', sql.NVarChar(120), job_title.slice(0, 120));
    }
    if (theme_preference && ['vscode-dark', 'nord'].includes(theme_preference)) {
      sets.push('theme_preference = @theme_preference');
      request.input('theme_preference', sql.NVarChar(30), theme_preference);
    }
    if (typeof placement_completed === 'boolean') {
      sets.push('placement_completed = @placement_completed');
      request.input('placement_completed', sql.Bit, placement_completed ? 1 : 0);
    }

    if (sets.length > 0) {
      await request.query(`UPDATE dbo.Users SET ${sets.join(', ')} WHERE id = @id`);
    }

    const updated = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query(`SELECT ${SAFE_USER_FIELDS} FROM dbo.Users WHERE id = @id`);

    return res.json({ success: true, user: updated.recordset[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Baseline CEFR Diagnostic & Track Placement
router.post('/diagnostic', requireAuth, async (req, res) => {
  try {
    const { track = 'Full-Stack', answers = [] } = req.body;
    // Expected 5 diagnostic questions with correct answer indexes: [1, 1, 2, 0, 1]
    const answerKey = [1, 1, 2, 0, 1];
    let correctCount = 0;

    for (let i = 0; i < answerKey.length; i++) {
      if (answers[i] === answerKey[i]) {
        correctCount++;
      }
    }

    const percentage = Math.round((correctCount / answerKey.length) * 100);
    let placedLevel = 'B1';
    if (percentage >= 80) {
      placedLevel = 'B2';
    } else if (percentage >= 50) {
      placedLevel = 'B1+';
    }

    const validTrack = ['Full-Stack', 'QA', 'DevOps'].includes(track) ? track : 'Full-Stack';
    const pool = await getPool();

    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('track', sql.NVarChar(40), validTrack)
      .input('cefr_level', sql.NVarChar(10), placedLevel)
      .query(`
        UPDATE dbo.Users
        SET track = @track, cefr_level = @cefr_level, placement_completed = 1
        WHERE id = @id
      `);

    const updated = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query(`SELECT ${SAFE_USER_FIELDS} FROM dbo.Users WHERE id = @id`);

    return res.json({
      success: true,
      diagnosticScore: percentage,
      correctCount,
      totalQuestions: answerKey.length,
      placedLevel,
      user: updated.recordset[0]
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
