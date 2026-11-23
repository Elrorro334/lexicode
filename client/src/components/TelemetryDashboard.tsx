import React, { useEffect, useState } from 'react';
import { Award, Download, Shield, TrendingUp } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Achievement } from '../types';

const TYPE_LABELS: Record<string, string> = {
  srs_flashcard: 'Flashcard SRS',
  srs_written: 'Vocabulario Escrito',
  grammar_quiz: 'Cuestionario',
  fill_blank: 'Completar Oración',
  grammar_incident: 'Redacción RCA / PR',
  speech_standup: 'Daily Standup (Voz)',
  sprint_audio: 'Audio Log',
  tech_interview: 'Entrevista Técnica'
};

export default function TelemetryDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [cohort, setCohort] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/analytics')
      .then((res) => setData(res))
      .finally(() => setLoading(false));

    if (user?.role === 'admin') {
      apiFetch<{ cohort: any[] }>('/api/analytics/admin/cohort')
        .then((res) => setCohort(res.cohort))
        .catch(() => {});
    }
  }, [user?.role]);

  const downloadReport = () => {
    if (!data) return;
    const lines = [
      `# LexiCode — Reporte de Desempeño`,
      `Estudiante: ${data.user?.name} (${data.user?.email})`,
      `Especialidad: ${data.user?.track} | Nivel CEFR: ${data.user?.cefr_level}`,
      `Racha: ${data.user?.streak_days} días | PRs Aprobados: ${data.user?.merged_prs} | Despliegues: ${data.user?.deployments}`,
      ``,
      `## Vocabulario (Repetición Espaciada)`,
      `- Tarjetas totales: ${data.srsStats?.total}`,
      `- Dominadas: ${data.srsStats?.mastered}`,
      `- Pendientes hoy: ${data.srsStats?.overdue}`,
      ``,
      `## Competencias CEFR`,
      ...(data.radar || []).map((r: any) => `- ${r.subject}: ${r.value}% (${r.cefr})`),
      ``,
      `## Actividades Recientes`,
      ...(data.recentScores || []).map(
        (s: any) => `- [${TYPE_LABELS[s.exercise_type] || s.exercise_type}] ${s.title}: ${s.accuracy_score}% (${s.is_completed ? 'Aprobado' : 'Repasar'})`
      )
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-lexicode-${data.user?.name?.toLowerCase().replace(/\s+/g, '-') || 'estudiante'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) {
    return (
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-12 text-center text-sm text-ide-muted font-mono">
        Cargando tu progreso desde Microsoft SQL Server...
      </div>
    );
  }

  const radarItems = data.radar || [];
  const cx = 140;
  const cy = 130;
  const radius = 90;
  const polygonPoints = radarItems
    .map((item: any, idx: number) => {
      const angle = (Math.PI * 2 * idx) / radarItems.length - Math.PI / 2;
      const r = (Math.max(15, item.value) / 100) * radius;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');

  const curve = data.retentionCurve || [];

  return (
    <div className="space-y-6">
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Mi Progreso, Nivel CEFR y Logros</h2>
          <p className="text-xs text-ide-muted">
            Resumen real guardado en Microsoft SQL Server: avance en vocabulario, habilidades técnicas y medallas desbloqueadas.
          </p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 hover:brightness-105"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Reporte (.md)</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4">
          <p className="text-xs text-ide-muted">Nivel CEFR Actual</p>
          <p className="text-2xl font-extrabold text-ide-accent font-mono mt-1">{data.user?.cefr_level}</p>
        </div>
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4">
          <p className="text-xs text-ide-muted">Tarjetas Dominadas</p>
          <p className="text-2xl font-extrabold text-ide-success font-mono mt-1">
            {data.srsStats?.mastered} / {data.srsStats?.total}
          </p>
        </div>
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4">
          <p className="text-xs text-ide-muted">Ejercicios Aprobados (PRs)</p>
          <p className="text-2xl font-extrabold text-ide-text font-mono mt-1">{data.user?.merged_prs}</p>
        </div>
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4">
          <p className="text-xs text-ide-muted">Hitos (Deployments)</p>
          <p className="text-2xl font-extrabold text-ide-warn font-mono mt-1">{data.user?.deployments}</p>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold">Radar de Habilidades (CEFR)</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <svg width="280" height="260" viewBox="0 0 280 260" className="shrink-0">
              {[0.33, 0.66, 1].map((scale, sIdx) => {
                const ring = radarItems
                  .map((_: any, idx: number) => {
                    const a = (Math.PI * 2 * idx) / radarItems.length - Math.PI / 2;
                    return `${cx + radius * scale * Math.cos(a)},${cy + radius * scale * Math.sin(a)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={sIdx}
                    points={ring}
                    fill="none"
                    stroke="currentColor"
                    className="text-ide-border"
                    strokeWidth="1"
                  />
                );
              })}
              {radarItems.map((_: any, idx: number) => {
                const a = (Math.PI * 2 * idx) / radarItems.length - Math.PI / 2;
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={cx + radius * Math.cos(a)}
                    y2={cy + radius * Math.sin(a)}
                    stroke="currentColor"
                    className="text-ide-border"
                    strokeWidth="1"
                  />
                );
              })}
              {polygonPoints && (
                <polygon
                  points={polygonPoints}
                  fill="var(--ide-accent-soft)"
                  stroke="var(--ide-accent)"
                  strokeWidth="2"
                />
              )}
            </svg>

            <div className="space-y-2 w-full text-xs">
              {radarItems.map((item: any) => (
                <div key={item.subject} className="p-2.5 rounded-xl bg-ide-panel border border-ide-border flex justify-between">
                  <span className="font-medium">{item.subject}</span>
                  <span className="font-mono text-ide-accent font-bold">
                    {item.value}% ({item.cefr})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ide-accent" />
              <span>Curva de Retención y Precisión Diaria</span>
            </h3>
            <span className="text-[11px] font-mono text-ide-muted">{curve.length} día(s)</span>
          </div>

          {curve.length === 0 ? (
            <p className="text-xs text-ide-muted py-12 text-center">Completa ejercicios para ver tu gráfica de avance.</p>
          ) : (
            <div className="space-y-3">
              <div className="h-44 flex items-end gap-2 p-3 rounded-xl bg-ide-panel border border-ide-border">
                {curve.map((pt: any) => (
                  <div key={pt.practice_date} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[10px] font-mono text-ide-accent">{Math.round(pt.avg_accuracy)}%</span>
                    <div
                      className="w-full max-w-[38px] rounded-t-lg bg-ide-accent transition-all"
                      style={{ height: `${Math.max(12, Math.round(pt.avg_accuracy))}%` }}
                    />
                    <span className="text-[10px] font-mono text-ide-muted truncate max-w-full">
                      {pt.practice_date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ide-muted">
                Promedio de aciertos por fecha guardado en SQL Server.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logros */}
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Award className="w-4 h-4 text-ide-warn" />
          <span>Medallas y Logros Desbloqueados</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(data.achievements as Achievement[]).map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                ach.unlocked
                  ? 'bg-ide-accentSoft border-ide-accent/50'
                  : 'bg-ide-panel border-ide-border opacity-60'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{ach.title}</span>
                <span className="font-mono text-ide-warn">+{ach.xp_reward} XP</span>
              </div>
              <p className="text-ide-muted">{ach.description}</p>
              <p className="font-mono text-[10px] text-ide-accent">
                {ach.unlocked ? 'DESBLOQUEADO ✓' : 'PENDIENTE'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Historial */}
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold">Historial Reciente de Actividades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ide-border text-ide-muted font-mono">
                <th className="py-2 pr-3">Actividad</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Área</th>
                <th className="py-2 pr-3">Puntaje</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(data.recentScores || []).map((row: any) => (
                <tr key={row.id} className="border-b border-ide-border/50">
                  <td className="py-2 pr-3 font-medium">{row.title}</td>
                  <td className="py-2 pr-3 font-mono text-ide-muted">
                    {TYPE_LABELS[row.exercise_type] || row.exercise_type}
                  </td>
                  <td className="py-2 pr-3 text-ide-muted">{row.domain_area}</td>
                  <td className="py-2 pr-3 font-mono font-bold text-ide-accent">{Math.round(row.accuracy_score)}%</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        row.is_completed
                          ? 'bg-ide-success/20 text-ide-success'
                          : 'bg-ide-warn/20 text-ide-warn'
                      }`}
                    >
                      {row.is_completed ? 'APROBADO' : 'REPASAR'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {user?.role === 'admin' && cohort.length > 0 && (
        <div className="bg-ide-surface border border-ide-warn/40 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2 text-ide-warn">
            <Shield className="w-4 h-4" />
            <span>Panel de Grupo para Docente (RBAC Admin)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ide-border text-ide-muted font-mono">
                  <th className="py-2 pr-3">Estudiante</th>
                  <th className="py-2 pr-3">Especialidad</th>
                  <th className="py-2 pr-3">Nivel</th>
                  <th className="py-2 pr-3">PRs</th>
                  <th className="py-2">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {cohort.map((st) => (
                  <tr key={st.id} className="border-b border-ide-border/50">
                    <td className="py-2 pr-3 font-medium">{st.name}</td>
                    <td className="py-2 pr-3">{st.track}</td>
                    <td className="py-2 pr-3 font-mono text-ide-accent">{st.cefr_level}</td>
                    <td className="py-2 pr-3 font-mono">{st.merged_prs}</td>
                    <td className="py-2 font-mono font-bold text-ide-success">{st.avg_accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
