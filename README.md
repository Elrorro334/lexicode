# LexiCode: Technical English for Software Engineers

> **Capstone Project Specification & Pedagogical Blueprint — SRS v1.1**  
> **Universidad Tecnológica — 10º IDSM**  
> **Asesora:** Mtra. Luz Julieta Tapia Reséndiz

LexiCode es una plataforma web interactiva diseñada para reducir la ansiedad comunicativa (*communication anxiety*) de desarrolladores de software hispanohablantes en ceremonias ágiles (*daily standups*), entrevistas técnicas internacionales y revisiones de código (*pull requests*).

---

## 👥 Equipo de Desarrollo

* **Alberto Cruz Zepeda** — *Full-Stack Architecture & Lead*
* **Rodrigo Sánchez Cruz** — *Backend Services & REST APIs*
* **Lizeth Pérez Atanacio** — *UI/UX & Pedagogical Workflows*
* **Oscar José Salinas Escobar** — *Frontend State & Database Design*

---

## 🚀 Características Principales

1. **Simulador de Standup con Reconocimiento de Voz (US-2 - Rodrigo Sánchez Cruz):**
   * Integración nativa con **Web Speech API** y **AudioContext** para medición de decibeles y retroalimentación en vivo.
   * Transcripción oral en tiempo real sin latencia ni costos de APIs externas.
   * Evaluación de articulación, detección de voz pasiva técnica y verificación de umbral ($\ge 80\%$).
   * Pronunciación modelo mediante síntesis de voz (`SpeechSynthesis`).

2. **Vocabulario Diario con Repetición Espaciada (US-1 - Alberto Cruz Zepeda):**
   * Implementación del algoritmo **SM-2 (Spaced Repetition System)**.
   * Consulta dinámica de términos vencidos programados en la base de datos relacional.
   * Reprogramación automática dentro de 24 horas en caso de fallo para consolidación mnemotécnica.

3. **Laboratorio de Gramática y Code Review (US-3 - Lizeth Pérez Atanacio):**
   * Validador sintáctico en tiempo real para reportes de incidentes (RCAs).
   * Detección de voz activa y sugerencias de conversión a voz pasiva técnica objetiva.
   * Detección y corrección de errores en condicionales (*e.g., "if + will"*).
   * Sugerencias de verbos modales constructivos para revisiones de código colaborativas.

4. **Telemetría y Métricas CEFR:**
   * Radar de competencias en el marco europeo de idiomas (B1 → B2).
   * Contador de racha diaria y registro detallado de prácticas en base de datos.
   * Selector de especialidad técnica (*Full-Stack, DevOps, QA Automation*).

5. **Persistencia Relacional ACID (0% Hardcoded):**
   * Base de datos SQLite integrada mediante `node:sqlite` nativo de Node.js 24.
   * Tablas ACID con integridad referencial: `Users`, `Modules`, `SpacedRepetitionLog`, `ExerciseScores`.

---

## 🛠️ Stack Tecnológico

* **Framework:** [Next.js 16](https://nextjs.org) (App Router con Turbopack)
* **Librería UI:** [React 19](https://react.dev)
* **Animaciones:** [Framer Motion](https://www.framer.com/motion/)
* **Estilos:** [Tailwind CSS v4](https://tailwindcss.com) (Paleta neutra y cálida sin fatiga visual)
* **Iconografía:** [Lucide React](https://lucide.dev)
* **Base de Datos:** SQLite (`node:sqlite`)
* **APIs Web Nativas:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Web Audio API (`AudioContext`)

---

## 💻 Inicio Rápido

### Prerrequisitos
* Node.js v22.5+ o v24+ (para soporte nativo de `node:sqlite`).
* npm o yarn.

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/Elrorro334/lexicode.git
cd lexicode

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para interactuar con la plataforma.
