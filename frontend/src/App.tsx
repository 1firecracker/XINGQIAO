import React, { useState, useEffect } from 'react';
import { AppState, Scenario, TrainingRecord, UserPreferences, AssistanceLevel } from './types';
import { useScenarios } from './hooks/useScenarios';
import { useTraining } from './hooks/useTraining';
import { calculateOverallLevel, calculateMilestone } from './vbmappConfig';
import Header from './components/Header';
import ScenarioCard from './components/ScenarioCard';
import TrainingSession from './components/TrainingSession';
import FeedbackView from './components/FeedbackView';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const App: React.FC = () => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:13',message:'App component mounted',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  const [view, setView] = useState<AppState>(AppState.HOME);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [scenarioKey, setScenarioKey] = useState<number>(0);
  const [lastRecord, setLastRecord] = useState<TrainingRecord | null>(null);
  const [history, setHistory] = useState<TrainingRecord[]>([]);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    childName: '宝贝',
    interest: '',
    voiceName: 'Kore',
    bgMusic: 'none'
  });

  const { scenarios: backendScenarios, loading: scenariosLoading, createScenario } = useScenarios();
  const { getHistory: getTrainingHistory } = useTraining();

  useEffect(() => {
    // 加载历史记录 - 从后端API
    loadHistory();
    
    // 加载偏好设置
    const savedPrefs = localStorage.getItem('star-bridge-prefs');
    if (savedPrefs) setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));

    // 加载自定义场景 - 从localStorage（临时，后续可迁移到后端）
    const savedCustom = localStorage.getItem('star-bridge-custom-scenarios');
    if (savedCustom) setCustomScenarios(JSON.parse(savedCustom));
  }, []);

  const loadHistory = async () => {
    try {
      const trainingHistory = await getTrainingHistory();
      // 转换后端格式到前端格式
      const formattedHistory = trainingHistory.map((record: any) => {
        // 处理向后兼容：如果新字段不存在，设置默认值
        const stepLevels = record.step_levels || (record.completed_steps > 0 ? Array(record.completed_steps).fill('F') : []);
        const overallLevel = record.overall_level || (stepLevels.length > 0 ? calculateOverallLevel(stepLevels) : 'F');
        const milestone = record.milestone || calculateMilestone(overallLevel);
        
        return {
          timestamp: new Date(record.started_at).getTime(),
          scenarioId: record.scenario_id.toString(),
          scenarioName: record.scenario?.name || '未知场景',
          score: record.score, // 保留用于向后兼容
          totalSteps: record.total_steps,
          completedSteps: record.completed_steps,
          stepLevels: stepLevels as AssistanceLevel[],
          overallLevel: overallLevel as AssistanceLevel,
          milestone: milestone as 'Level1' | 'Level2'
        };
      });
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
      // 回退到localStorage
      const savedHistory = localStorage.getItem('star-bridge-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // 处理向后兼容：为旧数据添加默认值
        const compatibleHistory = parsed.map((record: any) => ({
          ...record,
          stepLevels: record.stepLevels || (record.completedSteps > 0 ? Array(record.completedSteps).fill('F') : []),
          overallLevel: record.overallLevel || (record.completedSteps > 0 ? 'F' : 'F'),
          milestone: record.milestone || 'Level1'
        }));
        setHistory(compatibleHistory);
      }
    }
  };

  const handleStartCustom = () => {
    if (!customTopic.trim()) return;
    // 创建一个临时的动态场景对象
    setSelectedScenario({ 
      id: 'dynamic_' + Date.now(), 
      name: customTopic, 
      isDynamic: true,
      icon: '✨' 
    });
    setCustomTopic('');
    setView(AppState.TRAINING);
  };

  // 当 AI 规划完步骤后，将其保存到自定义列表
  const handleScenarioPlanned = async (plannedScenario: Scenario) => {
    // 检查是否已经存在同名场景，避免重复
    if (customScenarios.some(s => s.name === plannedScenario.name)) return;

    try {
      // 保存到后端（包含image_url）
      const scenarioData = {
        name: plannedScenario.name,
        description: plannedScenario.description || '',
        icon: plannedScenario.icon || '✨',
        steps: plannedScenario.steps.map((step, idx) => ({
          step_order: idx + 1,
          instruction: step.text,
          image_prompt: step.img_prompt_suffix,
          image_url: step.imageUrl || null // 保存图片URL
        }))
      };
      await createScenario(scenarioData);
    } catch (error) {
      console.error('Failed to save scenario to backend:', error);
    }

    // 同时保存到localStorage（临时）
    const newCustomList = [plannedScenario, ...customScenarios];
    setCustomScenarios(newCustomList);
    localStorage.setItem('star-bridge-custom-scenarios', JSON.stringify(newCustomList));
  };

  const handleFinishTraining = async (stepLevels: AssistanceLevel[], total: number) => {
    // 计算场景总体辅助等级和里程碑
    const overallLevel = calculateOverallLevel(stepLevels);
    const milestone = calculateMilestone(overallLevel);
    const completedCount = stepLevels.length;
    
    // 保留score字段用于向后兼容（基于完成步骤数计算）
    const score = Math.round((completedCount / total) * 100);
    
    const record: TrainingRecord = {
      timestamp: Date.now(),
      scenarioId: selectedScenario.id,
      scenarioName: selectedScenario.name,
      score, // 保留用于向后兼容
      totalSteps: total,
      completedSteps: completedCount,
      stepLevels,
      overallLevel,
      milestone
    };
    const newHistory = [record, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('star-bridge-history', JSON.stringify(newHistory));
    setLastRecord(record);
    setView(AppState.FEEDBACK);
  };

  const deleteCustomScenario = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newCustomList = customScenarios.filter(s => s.id !== id);
    setCustomScenarios(newCustomList);
    localStorage.setItem('star-bridge-custom-scenarios', JSON.stringify(newCustomList));
  };

  // 将相对路径转换为完整的后端URL
  const normalizeImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url; // 已经是完整URL
    if (url.startsWith('/')) {
      const env = import.meta.env as any;
      const apiBaseUrl = env?.VITE_API_URL || env?.REACT_APP_API_URL || '';
      if (apiBaseUrl) {
        const baseUrl = apiBaseUrl.replace(/\/$/, '');
        return `${baseUrl}${url}`;
      }
      return `${window.location.origin}${url}`;
    }
    return url;
  };

  // 合并后端场景和自定义场景
  const allScenarios = [
    ...backendScenarios.map(s => ({
      id: s.id.toString(),
      name: s.name,
      icon: s.icon,
      description: s.description,
      steps: s.steps.map(step => ({
        id: step.id,
        text: step.instruction,
        img_prompt_suffix: step.image_prompt || '',
        imageUrl: normalizeImageUrl(step.image_url)
      }))
    })),
    ...customScenarios
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl ring-1 ring-slate-200">
      <Header setView={setView} currentView={view} />
      
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {view === AppState.HOME && (
          <div className="space-y-6">
            {/* AI 创作区 */}
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 p-6 rounded-3xl shadow-lg text-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h2 className="text-lg font-bold">新增训练场景</h2>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="输入想练习的主题..."
                  className="flex-1 px-4 py-3 bg-white/60 backdrop-blur-md border border-stone-300 rounded-2xl outline-none focus:bg-white/80 placeholder:text-slate-400 text-slate-800"
                />
                <button 
                  onClick={handleStartCustom}
                  className="bg-white text-green-600 px-5 rounded-2xl font-bold active:scale-95 transition-all shadow-md"
                >
                  生成
                </button>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                输入如"理发店剪头发"或"在公园滑滑梯"，AI 将自动为您规划特教步骤。
              </p>
            </div>

            {/* 我的创作 */}
            {customScenarios.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 px-1 flex items-center justify-between">
                  <span>我的创作</span>
                  <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {customScenarios.length}个场景
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {customScenarios.map(s => (
                    <div key={s.id} className="relative group">
                      <ScenarioCard 
                        scenario={s} 
                        onStart={(scen) => { setSelectedScenario(scen); setView(AppState.TRAINING); }} 
                      />
                      <button 
                        onClick={(e) => deleteCustomScenario(e, s.id)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white shadow-sm"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 推荐练习 */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 px-1">官方推荐</h3>
              {scenariosLoading ? (
                <div className="text-center py-4 text-gray-500">加载中...</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {allScenarios.map(s => (
                    <ScenarioCard key={s.id} scenario={s} onStart={(scen) => {
                      // #region agent log
                      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:onStart',message:'Scenario card clicked',data:{scenarioId:scen.id,scenarioName:scen.name,hasSteps:'steps' in scen,stepsCount:scen.steps?.length,currentView:view,currentSelectedId:selectedScenario?.id,isSameScenario:selectedScenario?.id === scen.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                      // #endregion
                      // 更新scenarioKey强制重新挂载TrainingSession组件
                      setScenarioKey(prev => prev + 1);
                      setSelectedScenario(scen);
                      setView(AppState.TRAINING);
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {view === AppState.TRAINING && selectedScenario && (
          <TrainingSession 
            key={`${selectedScenario.id}-${scenarioKey}`}
            scenario={selectedScenario} 
            preferences={preferences}
            onFinish={handleFinishTraining}
            onCancel={() => setView(AppState.HOME)}
            onScenarioPlanned={handleScenarioPlanned}
          />
        )}

        {view === AppState.FEEDBACK && lastRecord && (
          <FeedbackView record={lastRecord} onNext={() => setView(AppState.HOME)} onTryAgain={() => setView(AppState.TRAINING)} />
        )}

        {view === AppState.DASHBOARD && <Dashboard history={history} />}
        {view === AppState.SETTINGS && <Settings preferences={preferences} setPreferences={(p) => { setPreferences(p); localStorage.setItem('star-bridge-prefs', JSON.stringify(p)); }} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => setView(AppState.HOME)} className={`flex flex-col items-center transition-colors ${view === AppState.HOME ? 'text-green-500' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">首页</span>
        </button>
        <button onClick={() => setView(AppState.DASHBOARD)} className={`flex flex-col items-center transition-colors ${view === AppState.DASHBOARD ? 'text-green-500' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">数据</span>
        </button>
        <button onClick={() => setView(AppState.SETTINGS)} className={`flex flex-col items-center transition-colors ${view === AppState.SETTINGS ? 'text-green-500' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">设置</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
