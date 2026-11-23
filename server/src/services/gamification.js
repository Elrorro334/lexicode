import { sql } from '../db/connection.js';

export async function awardProgress(pool, userId, { completed = false, achievementCodes = [] } = {}) {
  // Update daily streak based on UTC date difference
  await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`
      UPDATE dbo.Users
      SET
        streak_days = CASE
          WHEN last_practice_date IS NULL THEN 1
          WHEN last_practice_date = CAST(SYSUTCDATETIME() AS DATE) THEN streak_days
          WHEN DATEDIFF(DAY, last_practice_date, CAST(SYSUTCDATETIME() AS DATE)) = 1 THEN streak_days + 1
          ELSE 1
        END,
        last_practice_date = CAST(SYSUTCDATETIME() AS DATE)
      WHERE id = @user_id
    `);

  if (completed) {
    await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        UPDATE dbo.Users
        SET
          merged_prs = merged_prs + 1,
          deployments = (merged_prs + 1) / 5
        WHERE id = @user_id
      `);
  }

  const userRes = await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`
      SELECT id, name, email, role, job_title, track, cefr_level, placement_completed,
             streak_days, merged_prs, deployments, theme_preference
      FROM dbo.Users
      WHERE id = @user_id
    `);

  const user = userRes.recordset[0];
  const codesToUnlock = new Set(achievementCodes);

  if (completed && user && user.merged_prs >= 1) {
    codesToUnlock.add('FIRST_PR');
  }
  if (user && user.merged_prs >= 5) {
    codesToUnlock.add('PROD_DEPLOY');
  }

  // Check if user has mastered >= 5 SRS cards
  const masteredRes = await pool.request()
    .input('user_id', sql.Int, userId)
    .query(`
      SELECT COUNT(*) AS cnt
      FROM dbo.SpacedRepetitionLog
      WHERE user_id = @user_id AND repetitions >= 1
    `);
  if (masteredRes.recordset[0].cnt >= 5) {
    codesToUnlock.add('SRS_STREAK_5');
  }

  const newlyUnlocked = [];
  for (const code of codesToUnlock) {
    const insertRes = await pool.request()
      .input('user_id', sql.Int, userId)
      .input('code', sql.NVarChar(60), code)
      .query(`
        INSERT INTO dbo.UserAchievements (user_id, achievement_id)
        SELECT @user_id, a.id
        FROM dbo.Achievements a
        WHERE a.code = @code
          AND NOT EXISTS (
            SELECT 1 FROM dbo.UserAchievements ua
            WHERE ua.user_id = @user_id AND ua.achievement_id = a.id
          );

        IF @@ROWCOUNT > 0
        BEGIN
          SELECT code, title, description, icon_name, xp_reward
          FROM dbo.Achievements WHERE code = @code;
        END
      `);
    if (insertRes.recordset && insertRes.recordset.length > 0) {
      newlyUnlocked.push(insertRes.recordset[0]);
    }
  }

  return { user, newlyUnlocked };
}
