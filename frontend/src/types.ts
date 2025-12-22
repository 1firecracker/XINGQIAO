
export interface TrainingStep {
  id: number;
  text: string;
  img_prompt_suffix: string;
  completed?: boolean;
  imageUrl?: string;
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
  score: number;
  totalSteps: number;
  completedSteps: number;
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
