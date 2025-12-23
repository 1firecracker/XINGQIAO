
export type AssistanceLevel = 'F' | 'P' | 'I';
export type Milestone = 'Level1' | 'Level2';

export interface TrainingStep {
  id: number;
  text: string;
  img_prompt_suffix: string;
  completed?: boolean;
  imageUrl?: string;
  assistanceLevel?: AssistanceLevel;
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: TrainingStep[];
  next_recommendation: string;
}

export interface TrainingRecord {
  timestamp: number;
  scenarioId: string;
  scenarioName: string;
  score?: number; // 保留用于向后兼容
  totalSteps: number;
  completedSteps: number;
  stepLevels: AssistanceLevel[]; // 每个步骤的辅助等级
  overallLevel: AssistanceLevel; // 场景总体辅助等级
  milestone: Milestone; // 能力里程碑
}

export interface UserPreferences {
  childName: string;
  interest: string; // e.g., "cars", "dinosaurs"
  voiceName: string; // Gemini TTS voice
  bgMusic: string; // Background music identifier
}

export enum AppState {
  HOME = 'HOME',
  TRAINING = 'TRAINING',
  FEEDBACK = 'FEEDBACK',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS'
}
