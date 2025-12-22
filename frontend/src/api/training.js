import apiClient from './client';

export const trainingApi = {
  start: (scenarioId) => apiClient.post('/api/training/start', { scenario_id: scenarioId }),
  completeStep: (trainingId, stepId) => apiClient.post(`/api/training/${trainingId}/step`, { step_id: stepId }),
  getHistory: () => apiClient.get('/api/training/history'),
  finish: (trainingId, data) => apiClient.post(`/api/training/${trainingId}/finish`, data),
};

