import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'lexicode.db');

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = new DatabaseSync(DB_PATH);
  
  // Enable foreign keys and WAL mode for reliability
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  
  initSchema(dbInstance);
  seedInitialData(dbInstance);

  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'Full-Stack Developer',
      track TEXT NOT NULL DEFAULT 'Full-Stack',
      cefr_level TEXT NOT NULL DEFAULT 'B1',
      streak_days INTEGER NOT NULL DEFAULT 4,
      merged_prs INTEGER NOT NULL DEFAULT 7,
      deployments INTEGER NOT NULL DEFAULT 2,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL, -- 'vocabulary', 'standup', 'grammar_review', 'incident'
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      cefr_level TEXT NOT NULL, -- 'B1', 'B1+', 'B2'
      prompt TEXT NOT NULL,
      scenario_context TEXT NOT NULL,
      expected_pattern TEXT NOT NULL,
      keywords TEXT, -- comma-separated key technical terms
      grammar_target TEXT, -- e.g. 'Passive Voice', 'Conditionals', 'Modal Verbs'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SpacedRepetitionLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      repetitions INTEGER NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 1,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      last_reviewed_at DATETIME,
      next_review_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES Modules(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ExerciseScores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      exercise_type TEXT NOT NULL,
      raw_input TEXT NOT NULL,
      accuracy_score REAL NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      feedback_details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (module_id) REFERENCES Modules(id) ON DELETE CASCADE
    );
  `);
}

function seedInitialData(db: DatabaseSync) {
  // Check if user already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM Users').get() as { count: number };
  if (userCount.count === 0) {
    db.prepare(`
      INSERT INTO Users (id, name, email, role, track, cefr_level, streak_days, merged_prs, deployments)
      VALUES (1, 'Rodrigo Sánchez Cruz', 'rodrigo.sanchez@ut.edu.mx', 'Backend Services & REST APIs Lead', 'Full-Stack', 'B2', 5, 12, 3)
    `).run();
  }

  // Check if Modules are populated
  const modCount = db.prepare('SELECT COUNT(*) as count FROM Modules').get() as { count: number };
  if (modCount.count === 0) {
    const modules = [
      // 1. Spaced Repetition Vocabulary (User Story 1: Alberto Cruz Zepeda)
      {
        category: 'vocabulary',
        title: 'Throughput & Latency Optimization',
        topic: 'System Performance',
        cefr_level: 'B2',
        prompt: 'Define "throughput" in the context of our microservices API cluster and how it contrasts with network latency.',
        scenario_context: 'A payment gateway microservice is facing high traffic during flash sales. In the sprint review, the Tech Lead asks for the exact technical definition.',
        expected_pattern: 'Throughput represents the number of requests processed per second, whereas latency measures the round-trip time required to service an individual request.',
        keywords: 'throughput, requests, processed, second, latency, round-trip, duration, transfer rate',
        grammar_target: 'Compound Technical Nouns'
      },
      {
        category: 'vocabulary',
        title: 'CI/CD Pipeline Middleware',
        topic: 'DevOps & Architecture',
        cefr_level: 'B2',
        prompt: 'Explain what "middleware" does when intercepting incoming HTTP payloads before reaching the controller.',
        scenario_context: 'During an architectural debate, the QA lead asks why token validation cannot be handled directly inside business logic.',
        expected_pattern: 'Middleware intercepts incoming requests to authenticate headers and validate schemas before forwarding the payload to route handlers.',
        keywords: 'middleware, intercepts, incoming, authenticate, validate, payload, handlers',
        grammar_target: 'Gerunds & Subordinate Clauses'
      },
      {
        category: 'vocabulary',
        title: 'Codebase Monorepo Decoupling',
        topic: 'Software Architecture',
        cefr_level: 'B2',
        prompt: 'Describe the main trade-offs when decoupling a shared codebase into independent services.',
        scenario_context: 'The engineering team is planning Q2 roadmap to break a monolith into modular domain packages.',
        expected_pattern: 'Decoupling a codebase isolates fault domains and accelerates independent deployments, but it introduces network serialization overhead and distributed tracing complexity.',
        keywords: 'decoupling, codebase, isolates, fault domains, deployments, overhead, distributed',
        grammar_target: 'Adversative Conjunctions'
      },
      {
        category: 'vocabulary',
        title: 'Database Deadlock & Race Conditions',
        topic: 'Relational SQL & Concurrency',
        cefr_level: 'B2',
        prompt: 'How would you explain a "deadlock" occurring between two competing database transactions?',
        scenario_context: 'A production incident showed error 1205: Lock wait timeout exceeded. You must brief the team.',
        expected_pattern: 'A deadlock occurs when two concurrent transactions mutually wait for exclusive locks held by each other, preventing either from completing.',
        keywords: 'deadlock, concurrent, transactions, mutual, locks, resources, completing',
        grammar_target: 'Temporal & Relative Clauses'
      },
      {
        category: 'vocabulary',
        title: 'Graceful Degradation vs Circuit Breaker',
        topic: 'Resilience Patterns',
        cefr_level: 'B2',
        prompt: 'Explain how a circuit breaker pattern enables graceful degradation during third-party outage.',
        scenario_context: 'The external SMS authentication provider went down, cascading errors across login endpoints.',
        expected_pattern: 'The circuit breaker trips open after repeated failures, immediately returning fallback responses to ensure graceful degradation without exhausting server threads.',
        keywords: 'circuit breaker, trips, open, failures, fallback, graceful degradation, threads',
        grammar_target: 'Causal Connectors'
      },

      // 2. Standup Speech Drills (User Story 2: Rodrigo Sánchez Cruz - Backend Services)
      {
        category: 'standup',
        title: 'Daily Standup: Memory Leak Incident',
        topic: 'Agile Ceremonies & Incident Briefing',
        cefr_level: 'B1+',
        prompt: 'Speak aloud your standup update explaining that the server was restarted after you identified a memory leak in the token cache service.',
        scenario_context: 'You are on Google Meet with the engineering team in San Francisco. It is your turn to give your 60-second standup status.',
        expected_pattern: 'Yesterday I investigated the high CPU spikes on the auth service. The server was restarted after the memory leak was identified in the cache layer, and today I will deploy the permanent heap buffer patch.',
        keywords: 'investigated, spikes, auth, server was restarted, memory leak was identified, cache, deploy, patch',
        grammar_target: 'Technical Passive Voice & Past Simple'
      },
      {
        category: 'standup',
        title: 'Daily Standup: Database Migration & Schema Lock',
        topic: 'Backend & Data Engineering',
        cefr_level: 'B2',
        prompt: 'Record your oral standup report describing how the users table was migrated without downtime using blue-green deployment.',
        scenario_context: 'Standup with remote colleagues. You need to reassure the product manager that zero data loss occurred.',
        expected_pattern: 'We completed the schema migration on the users table. A dual-write strategy was applied to prevent downtime, and the legacy read replicas were safely decommissioned this morning.',
        keywords: 'completed, schema, migration, users table, dual-write was applied, downtime, decommissioned',
        grammar_target: 'Passive Voice in Engineering Logs'
      },
      {
        category: 'standup',
        title: 'Daily Standup: REST API Rate Limiting',
        topic: 'API Security & Throttling',
        cefr_level: 'B1+',
        prompt: 'Verbally articulate that redis-based rate limiting was implemented to mitigate brute-force attempts on the authentication route.',
        scenario_context: 'Sprint standup: Explain the blocker you resolved yesterday regarding abuse of the login endpoint.',
        expected_pattern: 'Yesterday I resolved the API vulnerability. Rate limiting was configured with Redis, and IP throttling was enforced across all authentication endpoints to prevent credential stuffing.',
        keywords: 'resolved, vulnerability, rate limiting was configured, redis, throttling was enforced, authentication endpoints',
        grammar_target: 'Passive Voice & Prepositional Phrases'
      },

      // 3. Grammatical Validation & Code Review (User Story 3: Lizeth Pérez Atanacio)
      {
        category: 'grammar_review',
        title: 'Incident Post-Mortem: Converting to Technical Passive Voice',
        topic: 'Formal Post-Mortem Documentation',
        cefr_level: 'B1/B2',
        prompt: 'Convert the following informal active sentence into professional engineering passive voice: "We noticed the memory leak so we rebooted the worker node and we patched the vulnerability."',
        scenario_context: 'Writing a post-mortem incident RCA (Root Cause Analysis) for enterprise customers. Avoid personal pronouns (we, I) to maintain objective clarity.',
        expected_pattern: 'The memory leak was noticed, the worker node was rebooted, and the vulnerability was patched.',
        keywords: 'memory leak was noticed, node was rebooted, vulnerability was patched',
        grammar_target: 'Technical Passive Voice'
      },
      {
        category: 'grammar_review',
        title: 'System Logic Conditionals (Avoiding "Will" in If-Clause)',
        topic: 'System Architecture & Edge Cases',
        cefr_level: 'B2',
        prompt: 'Fix the conditional grammar error in this system specification: "If the load balancer will detect a unhealthy container, it will reroute the inbound traffic."',
        scenario_context: 'Reviewing an RFC document for cloud failover logic. Correct the common Spanish-speaker mistake of placing future auxiliary "will" in the conditional clause.',
        expected_pattern: 'If the load balancer detects an unhealthy container, it will reroute the inbound traffic.',
        keywords: 'if the load balancer detects, will reroute',
        grammar_target: 'First Conditional (Present Simple + Future)'
      },
      {
        category: 'grammar_review',
        title: 'Polite Pull Request Review (Modal Verbs)',
        topic: 'Code Review Etiquette',
        cefr_level: 'B2',
        prompt: 'Rewrite this harsh PR comment using constructive modal verbs (could, would, should, might): "Change this nested loop right now because it is too slow and destroys our database."',
        scenario_context: 'Reviewing a pull request authored by an international junior colleague. Maintain constructive engineering culture.',
        expected_pattern: 'Could we consider refactoring this nested loop? It might cause database performance degradation under heavy load, so we should look into batch querying.',
        keywords: 'could we, consider, might cause, should look into, refactor',
        grammar_target: 'Modal Verbs for Constructive Feedback'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO Modules (category, title, topic, cefr_level, prompt, scenario_context, expected_pattern, keywords, grammar_target)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of modules) {
      insertStmt.run(m.category, m.title, m.topic, m.cefr_level, m.prompt, m.scenario_context, m.expected_pattern, m.keywords, m.grammar_target);
    }
  }

  // Populate overdue SpacedRepetitionLog if empty
  const srsCount = db.prepare('SELECT COUNT(*) as count FROM SpacedRepetitionLog').get() as { count: number };
  if (srsCount.count === 0) {
    const allModules = db.prepare('SELECT id FROM Modules').all() as { id: number }[];
    const srsInsert = db.prepare(`
      INSERT INTO SpacedRepetitionLog (user_id, module_id, repetitions, interval_days, ease_factor, last_reviewed_at, next_review_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const pastDate = new Date(Date.now() - 3600 * 24 * 1000).toISOString(); // 1 day ago (overdue!)
    for (const mod of allModules) {
      srsInsert.run(1, mod.id, 0, 1, 2.5, null, pastDate);
    }
  }
}
