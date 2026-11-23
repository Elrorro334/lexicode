import React from 'react';
import { Code2, GraduationCap, Users, X } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEAM_MEMBERS = [
  {
    name: 'Alberto Cruz Zepeda',
    role: 'Full-Stack Architecture & Lead',
    contribution: 'Arquitectura general, flujo de aprendizaje y módulo de vocabulario SM-2.'
  },
  {
    name: 'Rodrigo Sánchez Cruz',
    role: 'Backend Services & REST APIs',
    contribution: 'Servidor Express, autenticación JWT/RBAC y verificación de voz en Standups.'
  },
  {
    name: 'Lizeth Pérez Atanacio',
    role: 'UI/UX & Pedagogical Workflows',
    contribution: 'Diseño pedagógico B1–B2, experiencia guiada y validador gramatical RCA/PR.'
  },
  {
    name: 'Oscar José Salinas Escobar',
    role: 'Frontend State & Database Design',
    contribution: 'Context API, esquema relacional en Microsoft SQL Server y analíticas CEFR.'
  }
];

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ide-surface border border-ide-border rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-ide-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-bold">Créditos del Proyecto — LexiCode Capstone</h2>
          </div>
          <button onClick={onClose} className="p-1 text-ide-muted hover:text-ide-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-xl bg-ide-panel border border-ide-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ide-accentSoft text-ide-accent flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-sm text-ide-text">Universidad Tecnológica — 10º IDSM</p>
              <p className="text-ide-muted">
                Asesora Académica: <strong className="text-ide-accent">Mtra. Luz Julieta Tapia Reséndiz</strong>
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-ide-surface border border-ide-border text-ide-warn">
            SRS v1.1 • PWA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.name}
              className="p-4 rounded-xl bg-ide-panel border border-ide-border space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-ide-accent shrink-0" />
                <h3 className="text-sm font-bold text-ide-text">{member.name}</h3>
              </div>
              <p className="font-mono text-[11px] text-ide-accent">{member.role}</p>
              <p className="text-xs text-ide-muted leading-relaxed">{member.contribution}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
