import express from 'express';
import { getPool, sql } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { evaluateKeywordAndTokenMatch } from '../services/evaluators.js';
import { awardProgress } from '../services/gamification.js';

const router = express.Router();

// User Story 1 - Criterion 1:
// When clicking "Start Daily Sprint", query SQL Server and load up to 10 overdue vocabulary items
router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const { domain } = req.query;

    const overdueRes = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .query(`
        SELECT TOP 10
          m.id, m.category, m.domain_area, m.title, m.topic, m.cefr_level, m.track,
          m.prompt, m.scenario_context, m.spanish_hint, m.expected_pattern, m.keywords,
          m.grammar_target, m.options_json,
          s.id AS srs_id, s.repetitions, s.interval_days, s.ease_factor, s.last_result, s.next_review_at,
          CASE WHEN s.next_review_at <= SYSUTCDATETIME() THEN 1 ELSE 0 END AS is_overdue
        FROM dbo.Modules m
        INNER JOIN dbo.SpacedRepetitionLog s ON m.id = s.module_id
        WHERE s.user_id = @user_id
          AND m.category = 'vocabulary'
          AND s.next_review_at <= SYSUTCDATETIME()
        ORDER BY s.next_review_at ASC
      `);

    const allVocabReq = pool.request().input('user_id', sql.Int, req.user.id);
    let domainClause = '';
    if (domain && domain !== 'All') {
      domainClause = 'AND m.domain_area = @domain';
      allVocabReq.input('domain', sql.NVarChar(60), domain);
    }

    const allVocabRes = await allVocabReq.query(`
      SELECT
        m.id, m.category, m.domain_area, m.title, m.topic, m.cefr_level, m.track,
        m.prompt, m.scenario_context, m.spanish_hint, m.expected_pattern, m.keywords,
        m.grammar_target, m.options_json,
        s.id AS srs_id, s.repetitions, s.interval_days, s.ease_factor, s.last_result, s.next_review_at,
        CASE WHEN s.next_review_at <= SYSUTCDATETIME() THEN 1 ELSE 0 END AS is_overdue
      FROM dbo.Modules m
      INNER JOIN dbo.SpacedRepetitionLog s ON m.id = s.module_id
      WHERE s.user_id = @user_id
        AND m.category = 'vocabulary'
        ${domainClause}
      ORDER BY
        CASE WHEN s.next_review_at <= SYSUTCDATETIME() THEN 0 ELSE 1 END,
        s.next_review_at ASC
    `);

    const sprintItems = overdueRes.recordset.length > 0
      ? overdueRes.recordset
      : allVocabRes.recordset.slice(0, 10);

    return res.json({
      success: true,
      overdueCount: overdueRes.recordset.length,
      sprintItems,
      allCards: allVocabRes.recordset
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// User Story 1 - Criterion 2:
// Submit flashcard self-check OR written vocabulary answer.
// Incorrect response updates SQL table so next_review_at is within 24 hours.
router.post('/review', requireAuth, async (req, res) => {
  try {
    const { moduleId, mode = 'flashcard', known, userResponse } = req.body;
    if (!moduleId) {
      return res.status(400).json({ success: false, error: 'moduleId is required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod) {
      return res.status(404).json({ success: false, error: 'Vocabulary module not found' });
    }

    let score = 0;
    let isCorrect = false;
    let matchedKeywords = [];
    let missingKeywords = [];
    let rawInput = '';

    if (mode === 'written') {
      rawInput = (userResponse || '').trim();
      const evalResult = evaluateKeywordAndTokenMatch(rawInput, mod.expected_pattern, mod.keywords);
      matchedKeywords = evalResult.matchedKeywords;
      missingKeywords = evalResult.missingKeywords;
      score = Math.min(100, Math.round((evalResult.keywordRatio * 0.7 + evalResult.tokenRatio * 0.3) * 100));
      isCorrect = score >= 70;
    } else {
      isCorrect = Boolean(known);
      score = isCorrect ? 100 : 30;
      rawInput = isCorrect ? 'Flashcard: Mastered / Knew it' : 'Flashcard: Needs 24h Review';
    }

    const srsRes = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .query('SELECT * FROM dbo.SpacedRepetitionLog WHERE user_id = @user_id AND module_id = @module_id');

    const srs = srsRes.recordset[0];
    let repetitions = srs ? srs.repetitions : 0;
    let intervalDays = srs ? srs.interval_days : 1;
    let easeFactor = srs ? srs.ease_factor : 2.5;
    let nextReviewHours = 24;

    if (isCorrect) {
      repetitions += 1;
      if (repetitions === 1) {
        intervalDays = 1;
      } else if (repetitions === 2) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      easeFactor = Math.max(1.3, Number((easeFactor + 0.1).toFixed(2)));
      nextReviewHours = intervalDays * 24;
    } else {
      // User Story 1 Criterion 2: reset repetition schedule to re-test within 24 hours
      repetitions = 0;
      intervalDays = 1;
      easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
      nextReviewHours = 24;
    }

    const updatedSrsRes = await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('repetitions', sql.Int, repetitions)
      .input('interval_days', sql.Int, intervalDays)
      .input('ease_factor', sql.Float, easeFactor)
      .input('last_result', sql.Bit, isCorrect ? 1 : 0)
      .input('next_hours', sql.Int, nextReviewHours)
      .query(`
        UPDATE dbo.SpacedRepetitionLog
        SET repetitions = @repetitions,
            interval_days = @interval_days,
            ease_factor = @ease_factor,
            last_result = @last_result,
            last_reviewed_at = SYSUTCDATETIME(),
            next_review_at = DATEADD(HOUR, @next_hours, SYSUTCDATETIME())
        OUTPUT INSERTED.next_review_at, INSERTED.repetitions, INSERTED.interval_days
        WHERE user_id = @user_id AND module_id = @module_id
      `);

    const feedback = {
      mode,
      score,
      isCorrect,
      matchedKeywords,
      missingKeywords,
      expectedPattern: mod.expected_pattern,
      nextReviewAt: updatedSrsRes.recordset[0]?.next_review_at,
      scheduleNote: isCorrect
        ? `¡Excelente memoria! Próximo repaso programado en ${intervalDays} día(s).`
        : 'Marcada para reforzar: SQL Server la reprogramó para repasarla dentro de las próximas 24 horas.'
    };

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), mode === 'written' ? 'srs_written' : 'srs_flashcard')
      .input('raw_input', sql.NVarChar(sql.MAX), rawInput)
      .input('accuracy_score', sql.Float, score)
      .input('is_completed', sql.Bit, isCorrect ? 1 : 0)
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(feedback))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, { completed: isCorrect });

    return res.json({
      success: true,
      score,
      isCorrect,
      srsUpdate: {
        repetitions,
        intervalDays,
        easeFactor,
        nextReviewAt: updatedSrsRes.recordset[0]?.next_review_at
      },
      feedback,
      user,
      newlyUnlocked
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
