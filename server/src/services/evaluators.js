export function evaluateKeywordAndTokenMatch(actualText, expectedPattern = '', keywordsCsv = '') {
  const actual = (actualText || '').toLowerCase().trim();
  const expected = (expectedPattern || '').toLowerCase().trim();

  const keywords = (keywordsCsv || '')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  const matchedKeywords = [];
  const missingKeywords = [];

  for (const kw of keywords) {
    if (actual.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordRatio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0.8;

  const expectedTokens = expected.split(/\W+/).filter(Boolean);
  const actualSet = new Set(actual.split(/\W+/).filter(Boolean));
  let tokenOverlap = 0;
  for (const token of expectedTokens) {
    if (actualSet.has(token)) {
      tokenOverlap++;
    }
  }

  const tokenRatio = expectedTokens.length > 0 ? tokenOverlap / expectedTokens.length : 0.6;

  return {
    matchedKeywords,
    missingKeywords,
    keywordRatio,
    tokenRatio,
    wordCount: actual.split(/\W+/).filter(Boolean).length
  };
}

export function evaluateGrammarRules(textInput, targetGrammar = '') {
  const text = (textInput || '').trim();
  const flags = [];
  let score = 100;

  // User Story 3 - Criterion 1: Flag Active Voice constructs & suggest Passive Voice
  const activeVoicePatterns = [
    {
      regex: /\b(we|I|our team|they)\s+(noticed|detected|identified|found|discovered)\b/gi,
      suggest: (_m, _p1, verb) => `the issue was ${verb.toLowerCase()}`,
      explanation:
        'En reportes formales (RCA), evita usar pronombres personales ("we noticed", "I found"). Usa voz pasiva ("the issue was identified") para sonar objetivo.'
    },
    {
      regex: /\b(we|I|our team|they)\s+(restarted|rebooted|killed|reset|stopped)\b/gi,
      suggest: (_m, _p1, verb) => `the server / node was ${verb.toLowerCase()}`,
      explanation:
        'Cambia acciones personales ("we restarted") por voz pasiva objetiva ("the server was restarted").'
    },
    {
      regex: /\b(we|I|our team|they)\s+(patched|fixed|resolved|updated|deployed|rerouted)\b/gi,
      suggest: (_m, _p1, verb) => `the fix was ${verb.toLowerCase()}`,
      explanation:
        'Los reportes técnicos destacan el cambio en el sistema en vez de la persona ("the patch was deployed").'
    }
  ];

  for (const rule of activeVoicePatterns) {
    const matches = [...text.matchAll(rule.regex)];
    for (const m of matches) {
      score -= 20;
      flags.push({
        type: 'passive_voice',
        detected: m[0],
        suggestion: rule.suggest(m[0], m[1], m[2]),
        explanation: rule.explanation
      });
    }
  }

  // User Story 3 - Criterion 2: Conditional errors (e.g., misusing "will" in the if-clause)
  const conditionalWillRegex = /\bif\s+([^,.!?]+?)\s+will\s+([a-z]+)\b/gi;
  let condMatch;
  while ((condMatch = conditionalWillRegex.exec(text)) !== null) {
    score -= 25;
    const subject = condMatch[1].trim();
    const verb = condMatch[2].trim();
    const presentVerb =
      verb.endsWith('s') || verb.endsWith('ch') || verb.endsWith('sh') || verb.endsWith('x')
        ? `${verb}es`
        : `${verb}s`;

    flags.push({
      type: 'conditional_error',
      detected: condMatch[0],
      suggestion: `if ${subject} ${presentVerb}`,
      explanation:
        'Regla de Primera Condicional: Nunca uses "will" dentro de la cláusula con "if". Usa Presente Simple después de "if" (ej. "if the gateway times out") y deja "will" para el resultado.'
    });
  }

  // Modal verbs for polite Code Reviews
  const harshCommandsRegex = /\b(change this|fix this now|you must|never do this|you broke|bad code|rewrite this)\b/gi;
  const harshMatches = [...text.matchAll(harshCommandsRegex)];
  for (const m of harshMatches) {
    score -= 20;
    flags.push({
      type: 'modal_politeness',
      detected: m[0],
      suggestion: 'Could we consider refactoring this... / You might want to move...',
      explanation:
        'En revisiones de código internacionales, suaviza tus sugerencias con verbos modales ("could", "might", "would", "should").'
    });
  }

  const hasPassiveConstruction =
    /\b(was|were|is|are|has been|have been)\s+([a-z]+ed|identified|restarted|rebooted|patched|resolved|deployed|rerouted|migrated|created|verified|merged)\b/i.test(
      text
    );

  if (
    (targetGrammar.toLowerCase().includes('passive') || targetGrammar.toLowerCase().includes('pasiva')) &&
    !hasPassiveConstruction
  ) {
    score -= 15;
    flags.push({
      type: 'syntax_recommendation',
      detected: 'Falta estructura de voz pasiva',
      suggestion: 'Incluye al menos una frase con "was/were + participio" (ej. "was restarted").',
      explanation: 'Este ejercicio evalúa específicamente el uso de Voz Pasiva Técnica.'
    });
  }

  if (targetGrammar.toLowerCase().includes('modal') && !/\b(could|would|might|should|may)\b/i.test(text)) {
    score -= 15;
    flags.push({
      type: 'modal_politeness',
      detected: 'No se detectó un verbo modal cortés',
      suggestion: 'Inicia tu comentario de PR con "Could we...", "You might want to..." o "Should we...".',
      explanation: 'Los Code Reviews constructivos usan modales para proponer mejoras en equipo.'
    });
  }

  if (text.split(/\s+/).filter(Boolean).length < 5) {
    score = Math.min(score, 40);
    flags.push({
      type: 'syntax_recommendation',
      detected: 'Respuesta demasiado corta',
      suggestion: 'Escribe una oración técnica completa en inglés (mínimo 6 a 8 palabras).',
      explanation: 'Necesitamos suficiente contexto para analizar la estructura gramatical.'
    });
  }

  score = Math.max(10, Math.min(100, score));
  const isCompleted = score >= 80 && flags.length === 0;

  return {
    score,
    isCompleted,
    hasPassiveConstruction,
    flags,
    summary: isCompleted
      ? '¡Excelente redacción! Registro técnico limpio, sin errores de voz pasiva ni condicionales.'
      : `Se detectaron ${flags.length} detalle(s) gramatical(es). Revisa las sugerencias abajo y vuelve a intentarlo.`
  };
}

export function evaluateSpeechResponse(transcribedText, expectedPattern = '', keywordsCsv = '') {
  const {
    matchedKeywords,
    missingKeywords,
    keywordRatio,
    tokenRatio,
    wordCount
  } = evaluateKeywordAndTokenMatch(transcribedText, expectedPattern, keywordsCsv);

  const passiveVoiceRegex =
    /\b(was|were|has been|have been|is|are)\s+(\w+ed|identified|restarted|deployed|migrated|configured|applied|resolved|merged)\b/i;
  const hasPassiveVoice = passiveVoiceRegex.test(transcribedText);
  const passiveBonus = hasPassiveVoice ? 10 : 0;

  let score = Math.round(keywordRatio * 55 + tokenRatio * 35 + passiveBonus);
  if (wordCount < 4) {
    score = Math.min(score, 35);
  }
  score = Math.min(100, Math.max(10, score));

  // User Story 2 - Criterion 2: >= 80% marks task completed
  const isCompleted = score >= 80;

  return {
    score,
    isCompleted,
    hasPassiveVoice,
    matchedKeywords,
    missingKeywords,
    verbalFluencyMetrics: {
      wordCount,
      speechPace: wordCount >= 10 ? 'Ritmo óptimo de desarrollador' : 'Muy breve — intenta completar la idea',
      detectedPassiveVoice: hasPassiveVoice
        ? 'Detectada (Excelente registro técnico B2)'
        : 'Consejo: incluye voz pasiva (ej. "the server was restarted")'
    },
    evaluationSummary: isCompleted
      ? `¡Aprobado (${score}% >= 80%)! Tu explicación oral fue clara y quedó guardada en SQL Server.`
      : `Obtuviste ${score}% (necesitas >= 80%). Intenta incluir las palabras clave: ${missingKeywords.slice(0, 3).join(', ') || 'frase más completa'}.`
  };
}
