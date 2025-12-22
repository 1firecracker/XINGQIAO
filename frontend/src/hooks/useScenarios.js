import { useState, useEffect } from 'react';
import { scenariosApi } from '../api/scenarios';

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScenarios.js:loadScenarios',message:'Loading scenarios started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      setLoading(true);
      const data = await scenariosApi.getAll();
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScenarios.js:loadScenarios',message:'Scenarios loaded successfully',data:{count:data?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setScenarios(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load scenarios:', err);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useScenarios.js:loadScenarios',message:'Scenarios load failed',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } finally {
      setLoading(false);
    }
  };

  const createScenario = async (scenarioData) => {
    try {
      const newScenario = await scenariosApi.create(scenarioData);
      setScenarios(prev => [...prev, newScenario]);
      return newScenario;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    scenarios,
    loading,
    error,
    loadScenarios,
    createScenario,
  };
};

