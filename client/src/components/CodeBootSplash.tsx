import React, { useEffect, useState } from 'react';
import { Code2, Terminal } from 'lucide-react';

interface CodeBootSplashProps {
  onComplete: () => void;
}

const CODE_LINES = [
  { text: '// LexiCode Capstone v2.0 — 10° IDSM', color: 'text-ide-success' },
  { text: 'import { React18, ExpressAPI, SQLServer } from "@lexicode/stack";', color: 'text-ide-accent' },
  { text: 'const db = await SQLServer.connect("mssql://localhost:1433/LexiCodeDB");', color: 'text-ide-text' },
  { text: 'const tracks = ["Full-Stack", "QA Automation", "DevOps / SRE"];', color: 'text-ide-warn' },
  { text: 'await WebSpeechAPI.mount({ lang: "en-US", cefr: "B1 -> B2" });', color: 'text-ide-accent' },
  { text: '✓ BUILD SUCCESSFUL — Sistema listo. ¡A practicar, Ingeniero!', color: 'text-ide-success font-bold' }
];

const BG_SNIPPETS = [
  'SELECT * FROM dbo.SpacedRepetitionLog WHERE next_review_at <= SYSUTCDATETIME();',
  'git checkout -b feature/standup-speech && git push origin HEAD',
  'if (statusCode === 200) { return res.json({ verified: true }); }',
  'docker build --target production -t lexicode-api:1.1 .',
  'expect(pronunciationAccuracy).toBeGreaterThanOrEqual(80);',
  'jwt.verify(token, process.env.JWT_SECRET);'
];

export default function CodeBootSplash({ onComplete }: CodeBootSplashProps) {
  const [visibleLines, setVisibleLines] = useState(1);
  const [progress, setProgress] = useState(15);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const lineTimers = CODE_LINES.map((_, idx) =>
      setTimeout(() => {
        setVisibleLines(idx + 1);
        setProgress(Math.min(100, Math.round(((idx + 1) / CODE_LINES.length) * 100)));
      }, idx * 280)
    );

    const fadeTimer = setTimeout(() => setFading(true), 1950);
    const doneTimer = setTimeout(() => onComplete(), 2300);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      lineTimers.forEach(clearTimeout);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-ide-bg text-ide-text flex items-center justify-center p-4 overflow-hidden transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Fondo sutil con líneas de código TI */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none font-mono text-[11px] leading-7 p-6 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-ide-accent animate-pulse"
            style={{ animationDelay: `${i * 120}ms`, marginLeft: `${(i % 4) * 36}px` }}
          >
            {BG_SNIPPETS[i % BG_SNIPPETS.length]}
          </div>
        ))}
      </div>

      {/* Consola IDE central */}
      <div className="relative max-w-2xl w-full bg-ide-surface border border-ide-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Barra tipo editor */}
        <div className="px-4 py-3 bg-ide-panel border-b border-ide-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-ide-danger" />
            <span className="w-3 h-3 rounded-full bg-ide-warn" />
            <span className="w-3 h-3 rounded-full bg-ide-success" />
            <div className="ml-2 flex items-center gap-1.5 text-xs font-mono text-ide-muted">
              <Terminal className="w-3.5 h-3.5 text-ide-accent" />
              <span>lexicode-boot.ts</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-ide-surface border border-ide-border text-ide-muted hover:text-ide-text"
          >
            Saltar [ESC]
          </button>
        </div>

        {/* Código apareciendo línea por línea */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ide-accentSoft border border-ide-accent/40 flex items-center justify-center text-ide-accent">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">LexiCode Platform</h1>
              <p className="text-xs font-mono text-ide-muted">Inicializando entorno de inglés técnico...</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ide-bg border border-ide-border font-mono text-xs space-y-2 min-h-[168px]">
            {CODE_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`flex items-start gap-2.5 animate-codeLine ${line.color}`}>
                <span className="text-ide-muted select-none w-4 text-right">{i + 1}</span>
                <span className="break-all">
                  {line.text}
                  {i === visibleLines - 1 && (
                    <span className="inline-block w-2 h-3.5 bg-ide-accent ml-1 align-middle animate-pulse" />
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Barra de carga */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-ide-muted">
              <span>Cargando módulos Full-Stack • QA • DevOps</span>
              <span className="text-ide-accent font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-ide-panel overflow-hidden">
              <div
                className="h-full bg-ide-accent transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
