-- LexiCode: Technical English for Software Engineers
-- Microsoft SQL Server Schema (T-SQL) - SRS v1.1

IF DB_ID('LexiCodeDB') IS NULL
BEGIN
    CREATE DATABASE LexiCodeDB;
END
GO

USE LexiCodeDB;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(120) NOT NULL,
        email NVARCHAR(160) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(30) NOT NULL DEFAULT 'student', -- 'student' | 'admin'
        job_title NVARCHAR(120) NOT NULL DEFAULT 'Software Engineering Student',
        track NVARCHAR(40) NOT NULL DEFAULT 'Full-Stack', -- 'Full-Stack' | 'QA' | 'DevOps'
        cefr_level NVARCHAR(10) NOT NULL DEFAULT 'B1', -- 'B1' | 'B1+' | 'B2'
        placement_completed BIT NOT NULL DEFAULT 0,
        streak_days INT NOT NULL DEFAULT 1,
        merged_prs INT NOT NULL DEFAULT 0,
        deployments INT NOT NULL DEFAULT 0,
        theme_preference NVARCHAR(30) NOT NULL DEFAULT 'vscode-dark', -- 'vscode-dark' | 'nord'
        last_practice_date DATE NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('dbo.Modules', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Modules (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category NVARCHAR(40) NOT NULL, -- 'vocabulary' | 'grammar_quiz' | 'fill_blank' | 'incident_writing' | 'standup' | 'sprint_audio' | 'interview'
        domain_area NVARCHAR(60) NOT NULL, -- 'Programming' | 'Databases' | 'Web Development' | 'Git & Version Control' | 'Agile & Scrum' | 'DevOps'
        title NVARCHAR(180) NOT NULL,
        topic NVARCHAR(120) NOT NULL,
        cefr_level NVARCHAR(10) NOT NULL, -- 'B1' | 'B1+' | 'B2'
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
GO

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
GO

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
GO

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
GO

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
GO
