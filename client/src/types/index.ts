export type ThemePreference = 'vscode-dark' | 'nord';
export type CareerTrack = 'Full-Stack' | 'QA' | 'DevOps';
export type CefrLevel = 'B1' | 'B1+' | 'B2';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  job_title: string;
  track: CareerTrack;
  cefr_level: CefrLevel;
  placement_completed: boolean | number;
  streak_days: number;
  merged_prs: number;
  deployments: number;
  theme_preference: ThemePreference;
}

export interface VocabCard {
  id: number;
  category: string;
  domain_area: string;
  title: string;
  topic: string;
  cefr_level: CefrLevel;
  track: string;
  prompt: string;
  scenario_context: string;
  spanish_hint: string | null;
  expected_pattern: string;
  keywords: string | null;
  grammar_target: string | null;
  options_json: string | null;
  srs_id: number;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  last_result: boolean | number | null;
  next_review_at: string;
  is_overdue: number;
}

export interface ExerciseModule {
  id: number;
  category: string;
  domain_area: string;
  title: string;
  topic: string;
  cefr_level: CefrLevel;
  track: string;
  prompt: string;
  scenario_context: string;
  spanish_hint: string | null;
  expected_pattern: string;
  keywords: string | null;
  grammar_target: string | null;
  parsedOptions: Record<string, any> | null;
  time_limit_sec: number;
  completed_by_user: number;
  best_score: number | null;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon_name: string;
  xp_reward: number;
  unlocked: number;
  unlocked_at: string | null;
}
