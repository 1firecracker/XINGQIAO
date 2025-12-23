import apiClient from './client';

export const scenariosApi = {
  getAll: () => apiClient.get('/api/scenarios/'),
  getById: (id) => apiClient.get(`/api/scenarios/${id}`),
  create: (scenario) => apiClient.post('/api/scenarios/', scenario),
  update: (id, scenario) => apiClient.put(`/api/scenarios/${id}`, scenario),
  delete: (id) => apiClient.delete(`/api/scenarios/${id}`),
  updateStepImage: (scenarioId, stepId, imageUrl) =>
    apiClient.patch(`/api/scenarios/${scenarioId}/steps/${stepId}/image`, { image_url: imageUrl }),
  deleteSteps: (scenarioId) => apiClient.delete(`/api/scenarios/${scenarioId}/steps`),
  updateSteps: (scenarioId, steps) => apiClient.put(`/api/scenarios/${scenarioId}/steps`, steps),
};

