
import React, { useState, useEffect } from 'react';
import { AppState, Scenario, TrainingRecord, UserPreferences } from './types';
import { SCENARIOS } from './constants';
import Header from './components/Header';
import ScenarioCard from './components/ScenarioCard';
import TrainingSession from './components/TrainingSession';
import FeedbackView from './components/FeedbackView';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.HOME);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
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

  useEffect(() => {
    // 加载历史记录
    const savedHistory = localStorage.getItem('star-bridge-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    // 加载偏好设置
    const savedPrefs = localStorage.getItem('star-bridge-prefs');
    if (savedPrefs) setPreferences(prev => ({ ...prev, ...JSON.parse(savedPrefs) }));

    // 加载自定义场景
    const savedCustom = localStorage.getItem('star-bridge-custom-scenarios');
    if (savedCustom) setCustomScenarios(JSON.parse(savedCustom));
  }, []);

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
  const handleScenarioPlanned = (plannedScenario: Scenario) => {
    // 检查是否已经存在同名场景，避免重复
    if (customScenarios.some(s => s.name === plannedScenario.name)) return;

    const newCustomList = [plannedScenario, ...customScenarios];
    setCustomScenarios(newCustomList);
    localStorage.setItem('star-bridge-custom-scenarios', JSON.stringify(newCustomList));
  };

  const handleFinishTraining = (completedCount: number, total: number) => {
    const score = Math.round((completedCount / total) * 100);
    const record: TrainingRecord = {
      timestamp: Date.now(),
      scenarioId: selectedScenario.id,
      scenarioName: selectedScenario.name,
      score,
      totalSteps: total,
      completedSteps: completedCount
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl ring-1 ring-slate-200">
      <Header setView={setView} currentView={view} />
      
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {view === AppState.HOME && (
          <div className="space-y-6">
            {/* AI 创作区 */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-6 rounded-3xl shadow-lg text-white space-y-4">
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
                  className="flex-1 px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl outline-none focus:bg-white/30 placeholder:text-white/60 text-white"
                />
                <button 
                  onClick={handleStartCustom}
                  className="bg-white text-blue-600 px-5 rounded-2xl font-bold active:scale-95 transition-all shadow-md"
                >
                  生成
                </button>
              </div>
              <p className="text-[10px] opacity-80 leading-relaxed">
                输入如“理发店剪头发”或“在公园滑滑梯”，AI 将自动为您规划特教步骤。
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
              <div className="grid grid-cols-1 gap-3">
                {SCENARIOS.map(s => (
                  <ScenarioCard key={s.id} scenario={s} onStart={(scen) => { setSelectedScenario(scen); setView(AppState.TRAINING); }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppState.TRAINING && selectedScenario && (
          <TrainingSession 
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
        <button onClick={() => setView(AppState.HOME)} className={`flex flex-col items-center transition-colors ${view === AppState.HOME ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">首页</span>
        </button>
        <button onClick={() => setView(AppState.DASHBOARD)} className={`flex flex-col items-center transition-colors ${view === AppState.DASHBOARD ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">数据</span>
        </button>
        <button onClick={() => setView(AppState.SETTINGS)} className={`flex flex-col items-center transition-colors ${view === AppState.SETTINGS ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2"/></svg>
          <span className="text-[10px] mt-1 font-bold">设置</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
