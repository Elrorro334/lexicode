import express from 'express';
import { getPool, sql } from '../db/connection.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const pool = await getPool();
    const userId = req.user.id;

    const userRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT id, name, email, role, job_title, track, cefr_level, placement_completed,
               streak_days, merged_prs, deployments, theme_preference, last_practice_date
        FROM dbo.Users
        WHERE id = @user_id
      `);

    const recentScoresRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT TOP 15
          e.id, e.exercise_type, e.accuracy_score, e.is_completed, e.duration_sec, e.created_at,
          m.title, m.category, m.domain_area, m.cefr_level
        FROM dbo.ExerciseScores e
        INNER JOIN dbo.Modules m ON e.module_id = m.id
        WHERE e.user_id = @user_id
        ORDER BY e.created_at DESC
      `);

    const srsSummaryRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT
          COUNT(*) AS total_cards,
          SUM(CASE WHEN next_review_at <= SYSUTCDATETIME() THEN 1 ELSE 0 END) AS overdue_cards,
          SUM(CASE WHEN repetitions >= 1 THEN 1 ELSE 0 END) AS mastered_cards
        FROM dbo.SpacedRepetitionLog
        WHERE user_id = @user_id
      `);

    const categoryAggRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT
          exercise_type,
          ROUND(AVG(accuracy_score), 1) AS avg_score,
          COUNT(*) AS attempts,
          SUM(CAST(is_completed AS INT)) AS completed
        FROM dbo.ExerciseScores
        WHERE user_id = @user_id
        GROUP BY exercise_type
      `);

    // Vocabulary Retention & Performance Curve grouped by date
    const retentionCurveRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT
          CONVERT(VARCHAR(10), created_at, 23) AS practice_date,
          ROUND(AVG(accuracy_score), 1) AS avg_accuracy,
          COUNT(*) AS sessions
        FROM dbo.ExerciseScores
        WHERE user_id = @user_id
        GROUP BY CONVERT(VARCHAR(10), created_at, 23)
        ORDER BY practice_date ASC
      `);

    const achievementsRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT
          a.id, a.code, a.title, a.description, a.icon_name, a.xp_reward,
          ua.unlocked_at,
          CASE WHEN ua.id IS NOT NULL THEN 1 ELSE 0 END AS unlocked
        FROM dbo.Achievements a
        LEFT JOIN dbo.UserAchievements ua ON a.id = ua.achievement_id AND ua.user_id = @user_id
        ORDER BY unlocked DESC, a.xp_reward ASC
      `);

    const aggMap = {};
    for (const row of categoryAggRes.recordset) {
      aggMap[row.exercise_type] = Math.round(row.avg_score);
    }

    const grammarAvg = aggMap.grammar_incident ?? aggMap.grammar_quiz ?? aggMap.fill_blank ?? 75;
    const vocabAvg = aggMap.srs_flashcard ?? aggMap.srs_written ?? 78;
    const speechAvg = aggMap.speech_standup ?? aggMap.sprint_audio ?? 74;
    const interviewAvg = aggMap.tech_interview ?? Math.round((vocabAvg + speechAvg) / 2);

    const radar = [
      { subject: 'Grammar & Syntax', value: grammarAvg, cefr: grammarAvg >= 85 ? 'B2' : 'B1+' },
      { subject: 'Target Lexis (SRS)', value: vocabAvg, cefr: vocabAvg >= 85 ? 'B2' : 'B1+' },
      { subject: 'Listening & Speaking', value: speechAvg, cefr: speechAvg >= 80 ? 'B2' : 'B1+' },
      { subject: 'Tech Interviews', value: interviewAvg, cefr: interviewAvg >= 80 ? 'B2' : 'B1+' },
      { subject: 'Code Review Etiquette', value: Math.round((grammarAvg + 88) / 2), cefr: 'B2' }
    ];

    const srsRow = srsSummaryRes.recordset[0] || { total_cards: 0, overdue_cards: 0, mastered_cards: 0 };

    return res.json({
      success: true,
      user: userRes.recordset[0],
      srsStats: {
        total: srsRow.total_cards || 0,
        overdue: srsRow.overdue_cards || 0,
        mastered: srsRow.mastered_cards || 0
      },
      recentScores: recentScoresRes.recordset,
      avgByCategory: categoryAggRes.recordset,
      retentionCurve: retentionCurveRes.recordset,
      radar,
      achievements: achievementsRes.recordset
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// RBAC-protected Admin Cohort View
router.get('/admin/cohort', requireAuth, requireRole(['admin']), async (_req, res) => {
  try {
    const pool = await getPool();
    const cohortRes = await pool.request().query(`
      SELECT
        u.id, u.name, u.email, u.track, u.cefr_level, u.streak_days, u.merged_prs, u.deployments,
        COUNT(e.id) AS total_attempts,
        ISNULL(ROUND(AVG(e.accuracy_score), 1), 0) AS avg_accuracy
      FROM dbo.Users u
      LEFT JOIN dbo.ExerciseScores e ON u.id = e.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.track, u.cefr_level, u.streak_days, u.merged_prs, u.deployments
      ORDER BY u.merged_prs DESC
    `);

    return res.json({ success: true, cohort: cohortRes.recordset });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
