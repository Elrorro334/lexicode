import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { moduleId, transcribedText, targetPattern, keywords } = body;

    if (!transcribedText || !moduleId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const moduleData = db.prepare('SELECT * FROM Modules WHERE id = ?').get(moduleId) as any;
    const target = (targetPattern || (moduleData ? moduleData.expected_pattern : '')).toLowerCase();
    const actual = transcribedText.toLowerCase().trim();

    // 1. Keyword coverage evaluation
    const expectedKeywords: string[] = (keywords || (moduleData ? moduleData.keywords : '') || '')
      .split(',')
      .map((k: string) => k.trim().toLowerCase())
      .filter(Boolean);

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const kw of expectedKeywords) {
      if (actual.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const keywordScore = expectedKeywords.length > 0 
      ? (matchedKeywords.length / expectedKeywords.length) * 100 
      : 85;

    // 2. Phrasing & Structural Similarity (Word overlap & Bigram coverage)
    const targetTokens = target.split(/\W+/).filter(Boolean);
    const actualTokens = actual.split(/\W+/).filter(Boolean);

    let matchCount = 0;
    const actualSet = new Set(actualTokens);
    for (const token of targetTokens) {
      if (actualSet.has(token)) {
        matchCount++;
      }
    }

    const tokenScore = targetTokens.length > 0 ? (matchCount / targetTokens.length) * 100 : 70;

    // 3. Technical grammar check in speech (Passive voice check: was/were + past participle)
    const passiveVoiceRegex = /\b(was|were|has been|have been|is|are)\s+(\w+ed|identified|restarted|deployed|migrated|configured|applied|decommissioned|resolved)\b/i;
    const hasPassiveVoice = passiveVoiceRegex.test(actual);
    const passiveBonus = hasPassiveVoice ? 10 : 0;

    // Weighted aggregate accuracy score (0-100)
    let totalScore = Math.round((keywordScore * 0.5) + (tokenScore * 0.4) + passiveBonus);
    totalScore = Math.min(100, Math.max(15, totalScore));

    // User Story 2 - Criterion 2: Pronunciation / articulation accuracy >= 80% marks task as completed
    const isCompleted = totalScore >= 80;

    const feedback = {
      score: totalScore,
      isCompleted,
      hasPassiveVoice,
      matchedKeywords,
      missingKeywords,
      verbalFluencyMetrics: {
        wordCount: actualTokens.length,
        speechPace: actualTokens.length > 8 ? 'Optimal (Professional Developer Pace)' : 'Concise / Brief',
        detectedPassiveVoice: hasPassiveVoice ? 'Detected (Strong Technical Register)' : 'Consider using passive voice (e.g., "the server was restarted")'
      },
      evaluationSummary: isCompleted
        ? `Criterion Met (${totalScore}% >= 80% threshold). Task completed and verified for standup presentation.`
        : `Score is ${totalScore}% (requires >= 80% to merge). Practice articulating: "${missingKeywords.slice(0, 3).join(', ')}"`
    };

    // Persist score into relational database (ACID transaction)
    db.prepare(`
      INSERT INTO ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
      VALUES (?, ?, 'speech_standup', ?, ?, ?, ?)
    `).run(1, moduleId, transcribedText, totalScore, isCompleted ? 1 : 0, JSON.stringify(feedback));

    // Update user stats if completed
    if (isCompleted) {
      db.prepare(`
        UPDATE Users 
        SET merged_prs = merged_prs + 1,
            deployments = CASE WHEN (merged_prs + 1) % 5 = 0 THEN deployments + 1 ELSE deployments END
        WHERE id = 1
      `).run();
    }

    const updatedUser = db.prepare('SELECT streak_days, merged_prs, deployments FROM Users WHERE id = 1').get();

    return NextResponse.json({
      success: true,
      score: totalScore,
      isCompleted,
      feedback,
      userStats: updatedUser
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
