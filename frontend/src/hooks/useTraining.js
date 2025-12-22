import { useState } from 'react';
import { trainingApi } from '../api/training';

export const useTraining = () => {
  const [loading, setLoading] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);

  const startTraining = async (scenarioId) => {
    try {
      setLoading(true);
      const result = await trainingApi.start(scenarioId);
      setCurrentTraining(result);
      return result;
    } catch (error) {
      console.error('Failed to start training:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId) => {
    if (!currentTraining) {
      throw new Error('No active training session');
    }
    try {
      setLoading(true);
      await trainingApi.completeStep(currentTraining.training_id, stepId);
    } catch (error) {
      console.error('Failed to complete step:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const finishTraining = async (data) => {
    if (!currentTraining) {
      throw new Error('No active training session');
    }
    try {
      setLoading(true);
      const result = await trainingApi.finish(currentTraining.training_id, data);
      setCurrentTraining(null);
      return result;
    } catch (error) {
      console.error('Failed to finish training:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async () => {
    try {
      setLoading(true);
      const history = await trainingApi.getHistory();
      return history;
    } catch (error) {
      console.error('Failed to get history:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    currentTraining,
    startTraining,
    completeStep,
    finishTraining,
    getHistory,
  };
};

