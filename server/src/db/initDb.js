import bcrypt from 'bcryptjs';
import { getPool, sql } from './connection.js';
import { SEED_MODULES, SEED_ACHIEVEMENTS } from './seedData.js';

export async function initializeDatabase() {
  const pool = await getPool();

  // Create tables idempotently in T-SQL
  await pool.request().query(`
    IF OBJECT_ID('dbo.Users', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(120) NOT NULL,
        email NVARCHAR(160) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(30) NOT NULL DEFAULT 'student',
        job_title NVARCHAR(120) NOT NULL DEFAULT 'Software Engineering Student',
        track NVARCHAR(40) NOT NULL DEFAULT 'Full-Stack',
        cefr_level NVARCHAR(10) NOT NULL DEFAULT 'B1',
        placement_completed BIT NOT NULL DEFAULT 0,
        streak_days INT NOT NULL DEFAULT 1,
        merged_prs INT NOT NULL DEFAULT 0,
        deployments INT NOT NULL DEFAULT 0,
        theme_preference NVARCHAR(30) NOT NULL DEFAULT 'vscode-dark',
        last_practice_date DATE NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END

    IF OBJECT_ID('dbo.Modules', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Modules (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category NVARCHAR(40) NOT NULL,
        domain_area NVARCHAR(60) NOT NULL,
        title NVARCHAR(180) NOT NULL,
        topic NVARCHAR(120) NOT NULL,
        cefr_level NVARCHAR(10) NOT NULL,
        track NVARCHAR(40) NOT NULL DEFAULT 'All',
        prompt NVARCHAR(MAX) NOT NULL,
        scenario_context NVARCHAR(MAX) NOT NULL,
        spanish_hint NVARCHAR(MAX) NULL,
        expected_pattern NVARCHAR(MAX) NOT NULL,
        keywords NVARCHAR(MAX) NULL,
        grammar_target NVARCHAR(120) NULL,
        options_json NVARCHAR(MAX) NULL,
        time_limit_sec INT NOT NULL DEFAULT 90,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END

    IF OBJECT_ID('dbo.SpacedRepetitionLog', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.SpacedRepetitionLog (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        module_id INT NOT NULL,
        repetitions INT NOT NULL DEFAULT 0,
        interval_days INT NOT NULL DEFAULT 1,
        ease_factor FLOAT NOT NULL DEFAULT 2.5,
        last_result BIT NULL,
        last_reviewed_at DATETIME2 NULL,
        next_review_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_SRS_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_SRS_Modules FOREIGN KEY (module_id) REFERENCES dbo.Modules(id) ON DELETE CASCADE,
        CONSTRAINT UQ_SRS_User_Module UNIQUE (user_id, module_id)
      );
    END

    IF OBJECT_ID('dbo.ExerciseScores', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.ExerciseScores (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        module_id INT NOT NULL,
        exercise_type NVARCHAR(60) NOT NULL,
        raw_input NVARCHAR(MAX) NOT NULL,
        accuracy_score FLOAT NOT NULL,
        is_completed BIT NOT NULL DEFAULT 0,
        duration_sec INT NULL,
        feedback_details NVARCHAR(MAX) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Scores_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_Scores_Modules FOREIGN KEY (module_id) REFERENCES dbo.Modules(id) ON DELETE CASCADE
      );
    END

    IF OBJECT_ID('dbo.Achievements', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Achievements (
        id INT IDENTITY(1,1) PRIMARY KEY,
        code NVARCHAR(60) NOT NULL UNIQUE,
        title NVARCHAR(120) NOT NULL,
        description NVARCHAR(255) NOT NULL,
        icon_name NVARCHAR(40) NOT NULL,
        xp_reward INT NOT NULL DEFAULT 50
      );
    END

    IF OBJECT_ID('dbo.UserAchievements', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.UserAchievements (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        unlocked_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_UA_Users FOREIGN KEY (user_id) REFERENCES dbo.Users(id) ON DELETE CASCADE,
        CONSTRAINT FK_UA_Achievements FOREIGN KEY (achievement_id) REFERENCES dbo.Achievements(id) ON DELETE CASCADE,
        CONSTRAINT UQ_UA_User_Achievement UNIQUE (user_id, achievement_id)
      );
    END
  `);

  // Seed or sync Modules (keeps existing IDs intact, inserts any newly added specialized modules)
  const existingModsRes = await pool.request().query('SELECT id, category, title FROM dbo.Modules ORDER BY id ASC');
  const existingMap = new Map();
  for (const row of existingModsRes.recordset) {
    existingMap.set(`${row.category}::${row.title}`, row.id);
  }

  for (const mod of SEED_MODULES) {
    const key = `${mod.category}::${mod.title}`;
    const existingId = existingMap.get(key);
    if (existingId) {
      await pool.request()
        .input('id', sql.Int, existingId)
        .input('domain_area', sql.NVarChar(60), mod.domain_area)
        .input('topic', sql.NVarChar(120), mod.topic)
        .input('track', sql.NVarChar(40), mod.track)
        .input('prompt', sql.NVarChar(sql.MAX), mod.prompt)
        .input('scenario_context', sql.NVarChar(sql.MAX), mod.scenario_context)
        .input('spanish_hint', sql.NVarChar(sql.MAX), mod.spanish_hint || null)
        .input('grammar_target', sql.NVarChar(120), mod.grammar_target || null)
        .input('options_json', sql.NVarChar(sql.MAX), mod.options_json || null)
        .query(`
          UPDATE dbo.Modules
          SET domain_area = @domain_area, topic = @topic, track = @track, prompt = @prompt,
              scenario_context = @scenario_context, spanish_hint = @spanish_hint,
              grammar_target = @grammar_target, options_json = @options_json
          WHERE id = @id
        `);
    } else {
      await pool.request()
        .input('category', sql.NVarChar(40), mod.category)
        .input('domain_area', sql.NVarChar(60), mod.domain_area)
        .input('title', sql.NVarChar(180), mod.title)
        .input('topic', sql.NVarChar(120), mod.topic)
        .input('cefr_level', sql.NVarChar(10), mod.cefr_level)
        .input('track', sql.NVarChar(40), mod.track)
        .input('prompt', sql.NVarChar(sql.MAX), mod.prompt)
        .input('scenario_context', sql.NVarChar(sql.MAX), mod.scenario_context)
        .input('spanish_hint', sql.NVarChar(sql.MAX), mod.spanish_hint || null)
        .input('expected_pattern', sql.NVarChar(sql.MAX), mod.expected_pattern)
        .input('keywords', sql.NVarChar(sql.MAX), mod.keywords || null)
        .input('grammar_target', sql.NVarChar(120), mod.grammar_target || null)
        .input('options_json', sql.NVarChar(sql.MAX), mod.options_json || null)
        .input('time_limit_sec', sql.Int, mod.time_limit_sec || 90)
        .query(`
          INSERT INTO dbo.Modules
            (category, domain_area, title, topic, cefr_level, track, prompt, scenario_context, spanish_hint, expected_pattern, keywords, grammar_target, options_json, time_limit_sec)
          VALUES
            (@category, @domain_area, @title, @topic, @cefr_level, @track, @prompt, @scenario_context, @spanish_hint, @expected_pattern, @keywords, @grammar_target, @options_json, @time_limit_sec)
        `);
    }
  }

  // Ensure existing users receive any newly added vocabulary cards in their SRS queue
  const allUsersRes = await pool.request().query('SELECT id FROM dbo.Users');
  for (const u of allUsersRes.recordset) {
    await seedUserSrsQueue(pool, u.id);
  }

  // Seed or sync Achievements
  for (const ach of SEED_ACHIEVEMENTS) {
    await pool.request()
      .input('code', sql.NVarChar(60), ach.code)
      .input('title', sql.NVarChar(120), ach.title)
      .input('description', sql.NVarChar(255), ach.description)
      .input('icon_name', sql.NVarChar(40), ach.icon_name)
      .input('xp_reward', sql.Int, ach.xp_reward)
      .query(`
        IF EXISTS (SELECT 1 FROM dbo.Achievements WHERE code = @code)
          UPDATE dbo.Achievements SET title = @title, description = @description WHERE code = @code;
        ELSE
          INSERT INTO dbo.Achievements (code, title, description, icon_name, xp_reward)
          VALUES (@code, @title, @description, @icon_name, @xp_reward);
      `);
  }

  // Seed Demo User if Users table is empty
  const userCountResult = await pool.request().query('SELECT COUNT(*) AS cnt FROM dbo.Users');
  if (userCountResult.recordset[0].cnt === 0) {
    const demoHash = await bcrypt.hash('LexiCode2026!', 10);
    const insertUser = await pool.request()
      .input('name', sql.NVarChar(120), 'Estudiante Demo (10° IDSM)')
      .input('email', sql.NVarChar(160), 'demo@lexicode.dev')
      .input('password_hash', sql.NVarChar(255), demoHash)
      .input('role', sql.NVarChar(30), 'student')
      .input('job_title', sql.NVarChar(120), 'Junior Software Engineer')
      .input('track', sql.NVarChar(40), 'Full-Stack')
      .input('cefr_level', sql.NVarChar(10), 'B1+')
      .input('placement_completed', sql.Bit, 1)
      .input('streak_days', sql.Int, 3)
      .input('merged_prs', sql.Int, 4)
      .input('deployments', sql.Int, 1)
      .query(`
        INSERT INTO dbo.Users (name, email, password_hash, role, job_title, track, cefr_level, placement_completed, streak_days, merged_prs, deployments)
        OUTPUT INSERTED.id
        VALUES (@name, @email, @password_hash, @role, @job_title, @track, @cefr_level, @placement_completed, @streak_days, @merged_prs, @deployments)
      `);

    const demoUserId = insertUser.recordset[0].id;
    await seedUserSrsQueue(pool, demoUserId);

    // Seed an instructor/admin account as well for RBAC verification
    const adminHash = await bcrypt.hash('AdminLexi2026!', 10);
    await pool.request()
      .input('name', sql.NVarChar(120), 'Mtra. Luz Julieta Tapia')
      .input('email', sql.NVarChar(160), 'admin@lexicode.dev')
      .input('password_hash', sql.NVarChar(255), adminHash)
      .input('role', sql.NVarChar(30), 'admin')
      .input('job_title', sql.NVarChar(120), 'Capstone Professor & Reviewer')
      .input('track', sql.NVarChar(40), 'Full-Stack')
      .input('cefr_level', sql.NVarChar(10), 'B2')
      .input('placement_completed', sql.Bit, 1)
      .query(`
        INSERT INTO dbo.Users (name, email, password_hash, role, job_title, track, cefr_level, placement_completed)
        VALUES (@name, @email, @password_hash, @role, @job_title, @track, @cefr_level, @placement_completed)
      `);

    // Seed sample historical scores for demo user so analytics radar & retention curve show real DB data immediately
    const sampleMods = await pool.request().query(`
      SELECT TOP 6 id, category FROM dbo.Modules ORDER BY id ASC
    `);
    for (let i = 0; i < sampleMods.recordset.length; i++) {
      const m = sampleMods.recordset[i];
      const scoreVal = 78 + (i * 4) % 20;
      await pool.request()
        .input('user_id', sql.Int, demoUserId)
        .input('module_id', sql.Int, m.id)
        .input('exercise_type', sql.NVarChar(60), m.category === 'vocabulary' ? 'srs_flashcard' : m.category)
        .input('raw_input', sql.NVarChar(sql.MAX), 'Initial baseline completion')
        .input('accuracy_score', sql.Float, scoreVal)
        .input('is_completed', sql.Bit, scoreVal >= 75 ? 1 : 0)
        .input('duration_sec', sql.Int, 45)
        .query(`
          INSERT INTO dbo.ExerciseScores (user_id, module_id, exercise_type, raw_input, accuracy_score, is_completed, duration_sec, created_at)
          VALUES (@user_id, @module_id, @exercise_type, @raw_input, @accuracy_score, @is_completed, @duration_sec, DATEADD(DAY, -${5 - i}, SYSUTCDATETIME()))
        `);
    }

    // Unlock first PR achievement for demo user
    await pool.request()
      .input('user_id', sql.Int, demoUserId)
      .query(`
        INSERT INTO dbo.UserAchievements (user_id, achievement_id)
        SELECT @user_id, id FROM dbo.Achievements WHERE code = 'FIRST_PR'
      `);
  }

  return pool;
}

export async function seedUserSrsQueue(pool, userId) {
  // Assign all vocabulary modules as initially due (overdue) so "Start Daily Sprint" loads up to 10 overdue items
  await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`
      INSERT INTO dbo.SpacedRepetitionLog (user_id, module_id, repetitions, interval_days, ease_factor, next_review_at)
      SELECT @user_id, m.id, 0, 1, 2.5, DATEADD(HOUR, -1, SYSUTCDATETIME())
      FROM dbo.Modules m
      WHERE m.category = 'vocabulary'
        AND NOT EXISTS (
          SELECT 1 FROM dbo.SpacedRepetitionLog s
          WHERE s.user_id = @user_id AND s.module_id = m.id
        )
    `);
}
