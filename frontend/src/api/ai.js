import apiClient from './client';

export const aiApi = {
  planScenario: (topic, preferences = {}) => 
    apiClient.post('/api/ai/plan-scenario', { topic, preferences }),
  generateImage: (prompt, stepId = null, scenarioId = null) => 
    apiClient.post('/api/ai/generate-image', { prompt, step_id: stepId, scenario_id: scenarioId }),
  getPresetImage: (scenarioName, stepOrder, interest = null) =>
    apiClient.post('/api/ai/get-preset-image', { scenario_name: scenarioName, step_order: stepOrder, interest }),
  generateTTS: (text, voiceName = 'Kore', language = 'zh-CN') => 
    apiClient.post('/api/ai/generate-tts', { text, voice_name: voiceName, language }),
};

