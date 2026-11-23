# LexiCode: Technical English for Software Engineers

> **Capstone Project Specification & Pedagogical Blueprint — SRS v1.1**  
> **Universidad Tecnológica — 10º IDSM**

LexiCode es una aplicación web educativa diseñada para ayudar a estudiantes de ingeniería de software y desarrolladores hispanohablantes a mejorar su comunicación en inglés técnico (CEFR B1 → B2) en situaciones reales del entorno laboral.

## Stack Tecnológico

* **Frontend:** React 18 + Vite + Tailwind CSS + Context API + Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **Backend:** Node.js + Express + JWT (`jsonwebtoken`) + RBAC + `bcryptjs`
* **Base de Datos:** Microsoft SQL Server (`mssql`) con esquema relacional ACID (`Users`, `Modules`, `SpacedRepetitionLog`, `ExerciseScores`, `Achievements`, `UserAchievements`)

## Módulos Implementados

1. **Onboarding, Auth (JWT + RBAC) & Diagnóstico CEFR:** Registro/login seguro, selección de Career Track (`Full-Stack`, `QA`, `DevOps`) y examen diagnóstico inicial.
2. **Sprint & Flashcards (SM-2):** Vocabulario técnico (Programación, Bases de Datos, Web, Git, Scrum, DevOps) con tarjetas interactivas 3D, TTS y reprogramación automática en 24h ante fallos.
3. **Quizzes, Completar Oraciones & Validador RCA/Code Review:** Cuestionarios, fill-in-the-blanks y analizador gramatical (voz pasiva técnica, condicionales sin `will` en `if`, verbos modales en code reviews).
4. **Scrum & Speech Room:** Simulador de Daily Standup con reconocimiento de voz (umbral ≥ 80%) y Sprint Audio Logs para comprensión auditiva.
5. **Tech Screen Simulator:** Simulador de entrevistas técnicas con temporizador interactivo.
6. **Analytics & Temas IDE:** Radar CEFR, curva de retención, logros (*Merged PRs*, *Deployments*), reporte descargable `.md` y selector de temas **VS Code Dark** / **Nord**.

## Ejecución Local

1. Configura `.env` (basado en `.env.example`) con tus credenciales de SQL Server.
2. Instala dependencias:
   ```powershell
   npm run install:all
   ```
3. Inicia Backend (puerto 4000) y Frontend (puerto 5173):
   ```powershell
   npm run dev
   ```
4. O compila y sirve todo de forma monolítica desde Express:
   ```powershell
   npm run build
   npm start
   ```
