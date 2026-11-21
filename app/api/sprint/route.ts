import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    
    // User Story 1 - Criterion 1:
    // Query Relational SQL database for overdue vocabulary items (scheduled <= NOW)
    const overdueItems = db.prepare(`
      SELECT 
        m.id,
        m.category,
        m.title,
        m.topic,
        m.cefr_level,
        m.prompt,
        m.scenario_context,
        m.expected_pattern,
        m.keywords,
        m.grammar_target,
        s.id as srs_id,
        s.repetitions,
        s.interval_days,
        s.ease_factor,
        s.next_review_at
      FROM Modules m
      JOIN SpacedRepetitionLog s ON m.id = s.module_id
      WHERE s.user_id = 1
        AND datetime(s.next_review_at) <= datetime('now')
      ORDER BY datetime(s.next_review_at) ASC
      LIMIT 10
    `).all();

    // If no items are strictly overdue, return up to 10 vocabulary items to allow continuous practice
    let items = overdueItems;
    if (items.length === 0) {
      items = db.prepare(`
        SELECT 
          m.id,
          m.category,
          m.title,
          m.topic,
          m.cefr_level,
          m.prompt,
          m.scenario_context,
          m.expected_pattern,
          m.keywords,
          m.grammar_target,
          s.id as srs_id,
          s.repetitions,
          s.interval_days,
          s.ease_factor,
          s.next_review_at
        FROM Modules m
        JOIN SpacedRepetitionLog s ON m.id = s.module_id
        WHERE s.user_id = 1
        ORDER BY s.repetitions ASC
        LIMIT 10
      `).all();
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { moduleId, userResponse } = body;

    if (!moduleId || userResponse === undefined) {
      return NextResponse.json({ success: false, error: 'Missing moduleId or userResponse' }, { status: 400 });
    }

    const moduleData = db.prepare('SELECT * FROM Modules WHERE id = ?').get(moduleId) as any;
    if (!moduleData) {
      return NextResponse.json({ success: false, error: 'Module not found' }, { status: 404 });
    }

    // Dynamic evaluation of vocabulary response
    const expected = moduleData.expected_pattern.toLowerCase();
    const actual = (userResponse || '').toLowerCase().trim();
    const keywords: string[] = (moduleData.keywords || '')
      .split(',')
      .map((k: string) => k.trim().toLowerCase())
      .filter(Boolean);

    // Count matched keywords
    let matchedKeywords = 0;
    const foundKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const kw of keywords) {
      if (actual.includes(kw)) {
        matchedKeywords++;
        foundKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const keywordRatio = keywords.length > 0 ? (matchedKeywords / keywords.length) : 0.8;
    
    // Levenshtein / Word Token Similarity
    const expectedWords = new Set(expected.split(/\W+/).filter(Boolean));
    const actualWords = new Set(actual.split(/\W+/).filter(Boolean));
    let tokenOverlap = 0;
    for (const w of actualWords) {
      if (expectedWords.has(w)) tokenOverlap++;
    }
    const tokenRatio = expectedWords.size > 0 ? (tokenOverlap / expectedWords.size) : 0.5;

    // Combined score (0 - 100)
    const score = Math.min(100, Math.round((keywordRatio * 0.7 + tokenRatio * 0.3) * 100));
    const isCorrect = score >= 70;

    // Retrieve existing SRS log
    const srs = db.prepare('SELECT * FROM SpacedRepetitionLog WHERE user_id = 1 AND module_id = ?').get(moduleId) as any;

    let newRepetitions = srs ? srs.repetitions : 0;
    let newInterval = srs ? srs.interval_days : 1;
    let newEase = srs ? srs.ease_factor : 2.5;
    let nextReviewISO: string;

    if (isCorrect) {
      // SM-2 Algorithm progression
      newRepetitions += 1;
      if (newRepetitions === 1) {
        newInterval = 1;
      } else if (newRepetitions === 2) {
        newInterval = 3;
      } else {
        newInterval = Math.round(newInterval * newEase);
      }
      newEase = Math.max(1.3, newEase + 0.1);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + newInterval);
      nextReviewISO = nextDate.toISOString();

      // Bonus gamification: update user's merged PRs if mastered
      db.prepare('UPDATE Users SET merged_prs = merged_prs + 1 WHERE id = 1').run();
    } else {
      // User Story 1 - Criterion 2:
      // Given an incorrect response, When submitted, Then the SQL table updates the repetition schedule to re-test the word within 24 hours.
      newRepetitions = 0;
      newInterval = 1;
      newEase = Math.max(1.3, newEase - 0.2);
      const nextDate = new Date();
      nextDate.setHours(nextDate.getHours() + 24); // within 24 hours!
      nextReviewISO = nextDate.toISOString();
    }

    // Parameterized UPDATE query for SpacedRepetitionLog
    db.prepare(`
      UPDATE SpacedRepetitionLog
      SET repetitions = ?,
          interval_days = ?,
          ease_factor = ?,
          last_reviewed_at = datetime('now'),
          next_review_at = ?
      WHERE user_id = 1 AND module_id = ?
    `).run(newRepetitions, newInterval, newEase, nextReviewISO, moduleId);

    // Parameterized INSERT query for ExerciseScores
    const feedback = JSON.stringify({
      foundKeywords,
      missingKeywords,
      suggestion: isCorrect 
        ? 'Excellent command of technical terminology.' 
        : `To strengthen your retention, include critical terms like: "${missingKeywords.slice(0, 3).join(', ')}". Re-test scheduled within 24h.`
    });

    db.prepare(`
      INSERT INTO ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
      VALUES (?, ?, 'srs_vocabulary', ?, ?, ?, ?)
    `).run(1, moduleId, userResponse, score, isCorrect ? 1 : 0, feedback);

    const userStats = db.prepare('SELECT streak_days, merged_prs, deployments FROM Users WHERE id = 1').get();

    return NextResponse.json({
      success: true,
      score,
      isCorrect,
      foundKeywords,
      missingKeywords,
      nextReviewAt: nextReviewISO,
      intervalDays: newInterval,
      userStats
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
