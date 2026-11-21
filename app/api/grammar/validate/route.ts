import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { moduleId, textInput, targetGrammar } = body;

    if (!textInput || !moduleId) {
      return NextResponse.json({ success: false, error: 'Missing textInput or moduleId' }, { status: 400 });
    }

    const flags: Array<{
      type: 'passive_voice' | 'conditional_error' | 'modal_politeness' | 'syntax_recommendation';
      detected: string;
      suggestion: string;
      explanation: string;
    }> = [];

    let score = 100;

    // --- RULE 1: User Story 3 - Criterion 1: Flag Active Voice & Suggest Passive Voice ---
    // Look for active constructs with personal pronouns or agents: "we restarted", "I noticed", "we patched", "I fixed"
    const activeVoicePatterns = [
      {
        regex: /\b(we|I|our team)\s+(noticed|detected|identified|found)\b/gi,
        suggest: (match: string, p1: string, p2: string) => `the incident/bug was ${p2.replace(/d$/, 'ed')}`,
        rule: 'In formal engineering incident reports (RCAs), avoid personal pronouns ("we noticed"). Use technical passive voice to maintain an objective tone.'
      },
      {
        regex: /\b(we|I|our team)\s+(rebooted|restarted|killed|reset)\b/gi,
        suggest: (match: string, p1: string, p2: string) => `the system/worker node was ${p2}`,
        rule: 'Replace personal action ("we restarted") with passive construction ("the server was restarted").'
      },
      {
        regex: /\b(we|I|our team)\s+(patched|fixed|resolved|updated|deployed)\b/gi,
        suggest: (match: string, p1: string, p2: string) => `the patch was applied / the fix was deployed`,
        rule: 'Emphasize the engineering artifact over the author.'
      }
    ];

    for (const pattern of activeVoicePatterns) {
      const match = textInput.match(pattern.regex);
      if (match) {
        score -= 20;
        flags.push({
          type: 'passive_voice',
          detected: match[0],
          suggestion: pattern.suggest(match[0], '', match[0].split(' ')[1] || 'action'),
          explanation: pattern.rule
        });
      }
    }

    // --- RULE 2: User Story 3 - Criterion 2: Conditional Errors (misusing 'will' in the if-clause) ---
    // Example: "If the load balancer will detect..." -> "If the load balancer detects..."
    const conditionalWillRegex = /\bif\s+([^,]+?)\s+will\s+([a-z]+)\b/gi;
    let condMatch;
    while ((condMatch = conditionalWillRegex.exec(textInput)) !== null) {
      score -= 25;
      const subject = condMatch[1].trim();
      const verb = condMatch[2].trim();
      const sEnding = verb.endsWith('s') || verb.endsWith('ch') || verb.endsWith('sh') ? `${verb}es` : `${verb}s`;
      flags.push({
        type: 'conditional_error',
        detected: condMatch[0],
        suggestion: `if ${subject} ${sEnding}`,
        explanation: `Conditionals Grammar Rule: In First Conditional clauses, use the Present Simple after "if" (e.g., "if the container fails"), not the future auxiliary "will". Reserve "will" for the result clause.`
      });
    }

    // --- RULE 3: Modal Verbs in Code Reviews (Etiquette & Constructive Feedback) ---
    const harshCommandsRegex = /\b(change this|fix this right now|you must|destroy|never do this|you broke)\b/gi;
    const harshMatch = textInput.match(harshCommandsRegex);
    if (harshMatch) {
      score -= 20;
      flags.push({
        type: 'modal_politeness',
        detected: harshMatch[0],
        suggestion: 'Could we consider refactoring this...? / You might want to evaluate...',
        explanation: 'In international engineering code reviews, use modal verbs ("could", "would", "might", "should") to propose architectural changes collaboratively.'
      });
    }

    // Check if expected passive voice exists when target is passive voice
    const hasPassiveConstruction = /\b(was|were|has been|is|are)\s+([a-z]+ed|identified|rebooted|patched|restarted|migrated)\b/i.test(textInput);
    if (targetGrammar?.toLowerCase().includes('passive') && !hasPassiveConstruction && flags.length === 0) {
      score -= 15;
      flags.push({
        type: 'syntax_recommendation',
        detected: 'Missing passive auxiliary',
        suggestion: 'Ensure at least one clause uses "was [past participle]" (e.g., "was restarted").',
        explanation: 'The exercise targets technical passive voice structures.'
      });
    }

    score = Math.max(10, Math.min(100, score));
    const isCompleted = score >= 80;

    // Persist to relational database
    db.prepare(`
      INSERT INTO ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, feedback_details)
      VALUES (?, ?, 'grammar_incident', ?, ?, ?, ?)
    `).run(1, moduleId, textInput, score, isCompleted ? 1 : 0, JSON.stringify({ flags, score }));

    if (isCompleted) {
      db.prepare('UPDATE Users SET merged_prs = merged_prs + 1 WHERE id = 1').run();
    }

    const updatedUser = db.prepare('SELECT streak_days, merged_prs, deployments FROM Users WHERE id = 1').get();

    return NextResponse.json({
      success: true,
      score,
      isCompleted,
      flags,
      summary: isCompleted 
        ? 'Grammar standards verified. Clean technical register without conditional or voice violations.'
        : `${flags.length} grammatical friction point(s) detected. Check the suggestions below.`,
      userStats: updatedUser
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
