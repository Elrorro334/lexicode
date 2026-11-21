import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();

    const user = db.prepare('SELECT * FROM Users WHERE id = 1').get() as any;

    // Recent exercise scores
    const recentScores = db.prepare(`
      SELECT 
        e.id,
        e.exercise_type,
        e.accuracy_score,
        e.is_completed,
        e.created_at,
        m.title,
        m.category,
        m.cefr_level
      FROM ExerciseScores e
      JOIN Modules m ON e.module_id = m.id
      WHERE e.user_id = 1
      ORDER BY e.created_at DESC
      LIMIT 10
    `).all();

    // SRS stats
    const totalSrsCards = db.prepare('SELECT COUNT(*) as count FROM SpacedRepetitionLog WHERE user_id = 1').get() as { count: number };
    const overdueCards = db.prepare(`
      SELECT COUNT(*) as count 
      FROM SpacedRepetitionLog 
      WHERE user_id = 1 AND datetime(next_review_at) <= datetime('now')
    `).get() as { count: number };

    // Average scores by exercise category
    const avgByCategory = db.prepare(`
      SELECT 
        e.exercise_type,
        AVG(e.accuracy_score) as avg_score,
        COUNT(e.id) as attempts,
        SUM(e.is_completed) as completed
      FROM ExerciseScores e
      WHERE e.user_id = 1
      GROUP BY e.exercise_type
    `).all();

    // CEFR Telemetry Radar Data
    const grammarScores = recentScores.filter((s: any) => s.exercise_type === 'grammar_incident');
    const speechScores = recentScores.filter((s: any) => s.exercise_type === 'speech_standup');
    const vocabScores = recentScores.filter((s: any) => s.exercise_type === 'srs_vocabulary');

    const grammarAvg = grammarScores.length > 0 
      ? Math.round(grammarScores.reduce((acc: number, s: any) => acc + s.accuracy_score, 0) / grammarScores.length)
      : 84;
    const speechAvg = speechScores.length > 0
      ? Math.round(speechScores.reduce((acc: number, s: any) => acc + s.accuracy_score, 0) / speechScores.length)
      : 82;
    const vocabAvg = vocabScores.length > 0
      ? Math.round(vocabScores.reduce((acc: number, s: any) => acc + s.accuracy_score, 0) / vocabScores.length)
      : 88;

    const radar = [
      { subject: 'Grammar & Syntax', value: grammarAvg, fullMark: 100, cefr: 'B2' },
      { subject: 'Target Lexis', value: vocabAvg, fullMark: 100, cefr: 'B2' },
      { subject: 'Listening & Speaking', value: speechAvg, fullMark: 100, cefr: 'B1+' },
      { subject: 'Technical Fluency', value: Math.round((vocabAvg + speechAvg) / 2), fullMark: 100, cefr: 'B2' },
      { subject: 'Code Review Etiquette', value: Math.round((grammarAvg + 90) / 2), fullMark: 100, cefr: 'B2' },
    ];

    return NextResponse.json({
      success: true,
      user,
      srsStats: {
        total: totalSrsCards.count,
        overdue: overdueCards.count,
        mastered: totalSrsCards.count - overdueCards.count
      },
      recentScores,
      avgByCategory,
      radar
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
