import express from 'express';
import { getPool, sql } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import {
  evaluateGrammarRules,
  evaluateKeywordAndTokenMatch,
  evaluateSpeechResponse
} from '../services/evaluators.js';
import { awardProgress } from '../services/gamification.js';

const router = express.Router();

// Get modules by category (grammar_quiz, fill_blank, incident_writing, standup, sprint_audio, interview)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { category, domain, track } = req.query;
    const pool = await getPool();
    const request = pool.request().input('user_id', sql.Int, req.user.id);

    const conditions = [];
    if (category) {
      conditions.push('m.category = @category');
      request.input('category', sql.NVarChar(40), category);
    }
    if (domain && domain !== 'All') {
      conditions.push('m.domain_area = @domain');
      request.input('domain', sql.NVarChar(60), domain);
    }
    if (track && track !== 'All') {
      conditions.push("(m.track = @track OR m.track = 'All')");
      request.input('track', sql.NVarChar(40), track);
    }

    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await request.query(`
      SELECT
        m.*,
        ISNULL((
          SELECT MAX(CAST(e.is_completed AS INT))
          FROM dbo.ExerciseScores e
          WHERE e.user_id = @user_id AND e.module_id = m.id
        ), 0) AS completed_by_user,
        (
          SELECT MAX(e.accuracy_score)
          FROM dbo.ExerciseScores e
          WHERE e.user_id = @user_id AND e.module_id = m.id
        ) AS best_score
      FROM dbo.Modules m
      ${whereSql}
      ORDER BY m.id ASC
    `);

    const modules = result.recordset.map((m) => ({
      ...m,
      parsedOptions: m.options_json ? JSON.parse(m.options_json) : null
    }));

    return res.json({ success: true, modules });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Grade Multiple-Choice Quiz (grammar_quiz or sprint_audio)
router.post('/quiz', requireAuth, async (req, res) => {
  try {
    const { moduleId, selectedIndex } = req.body;
    if (!moduleId || selectedIndex === undefined) {
      return res.status(400).json({ success: false, error: 'moduleId and selectedIndex are required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod || !mod.options_json) {
      return res.status(404).json({ success: false, error: 'Quiz module not found' });
    }

    const options = JSON.parse(mod.options_json);
    const isCorrect = Number(selectedIndex) === Number(options.correctIndex);
    const score = isCorrect ? 100 : 25;

    const feedback = {
      isCorrect,
      correctIndex: options.correctIndex,
      correctChoice: options.choices[options.correctIndex],
      explanation: options.explanation
    };

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), mod.category)
      .input('raw_input', sql.NVarChar(sql.MAX), options.choices[selectedIndex] || String(selectedIndex))
      .input('accuracy_score', sql.Float, score)
      .input('is_completed', sql.Bit, isCorrect ? 1 : 0)
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(feedback))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, { completed: isCorrect });

    return res.json({ success: true, score, isCorrect, feedback, user, newlyUnlocked });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Grade Fill-in-the-blank
router.post('/fill-blank', requireAuth, async (req, res) => {
  try {
    const { moduleId, answer } = req.body;
    if (!moduleId || !answer) {
      return res.status(400).json({ success: false, error: 'moduleId and answer are required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod || !mod.options_json) {
      return res.status(404).json({ success: false, error: 'Fill-blank module not found' });
    }

    const options = JSON.parse(mod.options_json);
    const normalized = answer.trim().toLowerCase().replace(/\s+/g, ' ');
    const accepted = (options.acceptedAnswers || []).map((a) => a.toLowerCase().trim());
    const isCorrect = accepted.includes(normalized);
    const score = isCorrect ? 100 : 35;

    const feedback = {
      isCorrect,
      acceptedAnswers: options.acceptedAnswers,
      explanation: options.explanation
    };

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), 'fill_blank')
      .input('raw_input', sql.NVarChar(sql.MAX), answer.trim())
      .input('accuracy_score', sql.Float, score)
      .input('is_completed', sql.Bit, isCorrect ? 1 : 0)
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(feedback))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, { completed: isCorrect });

    return res.json({ success: true, score, isCorrect, feedback, user, newlyUnlocked });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// User Story 3: Grammatical Validation on System Explanations (Passive Voice, Conditionals, Modals)
router.post('/grammar-validate', requireAuth, async (req, res) => {
  try {
    const { moduleId, textInput } = req.body;
    if (!moduleId || !textInput) {
      return res.status(400).json({ success: false, error: 'moduleId and textInput are required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod) {
      return res.status(404).json({ success: false, error: 'Grammar module not found' });
    }

    const evaluation = evaluateGrammarRules(textInput, mod.grammar_target || '');

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), 'grammar_incident')
      .input('raw_input', sql.NVarChar(sql.MAX), textInput.trim())
      .input('accuracy_score', sql.Float, evaluation.score)
      .input('is_completed', sql.Bit, evaluation.isCompleted ? 1 : 0)
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(evaluation))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, {
      completed: evaluation.isCompleted,
      achievementCodes: evaluation.isCompleted ? ['CLEAN_RCA'] : []
    });

    return res.json({
      success: true,
      ...evaluation,
      expectedModel: mod.expected_pattern,
      user,
      newlyUnlocked
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// User Story 2: Speech Verification for Standup Meetings (>= 80% accuracy)
router.post('/speech-verify', requireAuth, async (req, res) => {
  try {
    const { moduleId, transcribedText } = req.body;
    if (!moduleId || !transcribedText) {
      return res.status(400).json({ success: false, error: 'moduleId and transcribedText are required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod) {
      return res.status(404).json({ success: false, error: 'Standup module not found' });
    }

    const feedback = evaluateSpeechResponse(transcribedText, mod.expected_pattern, mod.keywords);

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), 'speech_standup')
      .input('raw_input', sql.NVarChar(sql.MAX), transcribedText.trim())
      .input('accuracy_score', sql.Float, feedback.score)
      .input('is_completed', sql.Bit, feedback.isCompleted ? 1 : 0)
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(feedback))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, {
      completed: feedback.isCompleted,
      achievementCodes: feedback.isCompleted ? ['STANDUP_PRO'] : []
    });

    return res.json({
      success: true,
      score: feedback.score,
      isCompleted: feedback.isCompleted,
      feedback,
      expectedModel: mod.expected_pattern,
      user,
      newlyUnlocked
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Tech Screen Simulator (Timed Technical Interview)
router.post('/interview', requireAuth, async (req, res) => {
  try {
    const { moduleId, responseText, durationSec = 45 } = req.body;
    if (!moduleId || !responseText) {
      return res.status(400).json({ success: false, error: 'moduleId and responseText are required' });
    }

    const pool = await getPool();
    const modRes = await pool.request()
      .input('id', sql.Int, Number(moduleId))
      .query('SELECT * FROM dbo.Modules WHERE id = @id');

    const mod = modRes.recordset[0];
    if (!mod) {
      return res.status(404).json({ success: false, error: 'Interview prompt not found' });
    }

    const match = evaluateKeywordAndTokenMatch(responseText, mod.expected_pattern, mod.keywords);
    const grammarCheck = evaluateGrammarRules(responseText, '');
    const depthBonus = match.wordCount >= 18 ? 10 : match.wordCount >= 10 ? 5 : 0;
    const grammarBonus = grammarCheck.flags.length === 0 ? 10 : 0;

    let score = Math.round(match.keywordRatio * 55 + match.tokenRatio * 25 + depthBonus + grammarBonus);
    if (match.wordCount < 6) score = Math.min(score, 40);
    score = Math.min(100, Math.max(15, score));

    const isCompleted = score >= 75;
    const feedback = {
      score,
      isCompleted,
      durationSec,
      wordCount: match.wordCount,
      matchedKeywords: match.matchedKeywords,
      missingKeywords: match.missingKeywords,
      grammarFlags: grammarCheck.flags,
      sampleAnswer: mod.expected_pattern,
      summary: isCompleted
        ? `¡Excelente respuesta de entrevista (${score}%)! Buena terminología técnica y explicación estructurada en ${durationSec}s.`
        : `Puntaje: ${score}% (meta >= 75%). Intenta incluir conceptos clave como: ${match.missingKeywords.slice(0, 3).join(', ') || 'mayor detalle técnico'}.`
    };

    await pool.request()
      .input('user_id', sql.Int, req.user.id)
      .input('module_id', sql.Int, mod.id)
      .input('exercise_type', sql.NVarChar(60), 'tech_interview')
      .input('raw_input', sql.NVarChar(sql.MAX), responseText.trim())
      .input('accuracy_score', sql.Float, score)
      .input('is_completed', sql.Bit, isCompleted ? 1 : 0)
      .input('duration_sec', sql.Int, Number(durationSec))
      .input('feedback_details', sql.NVarChar(sql.MAX), JSON.stringify(feedback))
      .query(`
        INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, duration_sec, feedback_details)
        VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @duration_sec, @feedback_details)
      `);

    const { user, newlyUnlocked } = await awardProgress(pool, req.user.id, {
      completed: isCompleted,
      achievementCodes: isCompleted ? ['TECH_SCREEN'] : []
    });

    return res.json({ success: true, score, isCompleted, feedback, user, newlyUnlocked });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
