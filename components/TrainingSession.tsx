
import React, { useState, useEffect, useRef } from 'react';
import { Scenario, UserPreferences, TrainingStep } from '../types';
import { planScenarioSteps, generateSpecialEdImage, generateTTSAudio, decodeAudioBuffer } from '../geminiService';
import { MUSIC_OPTIONS, SFX } from '../constants';

interface TrainingSessionProps {
  scenario: Scenario | { id: string; name: string; isDynamic: boolean; icon?: string };
  preferences: UserPreferences;
  onFinish: (completedCount: number, total: number) => void;
  onCancel: () => void;
  onScenarioPlanned?: (scenario: Scenario) => void;
}

type SessionMode = 'PLANNING' | 'GENERATING' | 'ACTIVE';

const TrainingSession: React.FC<TrainingSessionProps> = ({ 
  scenario, 
  preferences, 
  onFinish, 
  onCancel,
  onScenarioPlanned 
}) => {
  const [mode, setMode] = useState<SessionMode>('PLANNING');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TrainingStep[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    startSessionFlow();
    
    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [scenario.id]);

  const startSessionFlow = async () => {
    setMode('PLANNING');
    try {
      // 1. 规划步骤 (AI 专家介入)
      let plannedSteps: TrainingStep[];
      if ('steps' in scenario && !('isDynamic' in scenario)) {
        plannedSteps = scenario.steps;
      } else {
        plannedSteps = await planScenarioSteps(scenario.name, preferences);
        
        // 成功规划后，通知 App 组件保存这个新场景
        if (onScenarioPlanned) {
          const newScenario: Scenario = {
            id: scenario.id,
            name: scenario.name,
            icon: scenario.icon || '✨',
            description: `由 AI 为你定制的 ${plannedSteps.length} 步训练方案`,
            steps: plannedSteps,
            next_recommendation: 'supermarket_queue' // 默认推荐
          };
          onScenarioPlanned(newScenario);
        }
      }
      setSteps(plannedSteps);

      // 2. 准备生图
      setMode('GENERATING');
      const genPromises = plannedSteps.map(async (step, idx) => {
        const url = await generateSpecialEdImage(step.img_prompt_suffix, preferences);
        setGenerationProgress(prev => prev + (100 / plannedSteps.length));
        return { idx, url };
      });

      const results = await Promise.all(genPromises);
      const finalizedSteps = plannedSteps.map((s, i) => ({
        ...s,
        imageUrl: results.find(r => r.idx === i)?.url
      }));

      setSteps(finalizedSteps);
      setMode('ACTIVE');
      playStepVoice(finalizedSteps[0].text);
    } catch (err) {
      console.error("Session Flow Error:", err);
      onCancel();
    }
  };

  const playStepVoice = async (text: string) => {
    if (!audioCtxRef.current) return;
    if (currentAudioSource) try { currentAudioSource.stop(); } catch(e) {}
    try {
      const base64 = await generateTTSAudio(text, preferences.voiceName);
      const buffer = await decodeAudioBuffer(base64, audioCtxRef.current);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
      setCurrentAudioSource(source);
    } catch (e) {}
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      playStepVoice(steps[nextIdx].text);
    } else {
      onFinish(steps.filter(s => s.completed).length, steps.length);
    }
  };

  // ... 保持原有渲染逻辑不变 ...
  if (mode === 'PLANNING') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 py-20 text-center animate-pulse">
        <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner">🧠</div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-slate-800">AI 专家编排中</p>
          <p className="text-slate-400 text-sm px-10">正在为您构建符合特教逻辑的视觉社交故事...</p>
        </div>
      </div>
    );
  }

  if (mode === 'GENERATING') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 py-20 text-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 - (402 * generationProgress) / 100} className="text-blue-500 transition-all duration-500" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{Math.round(generationProgress)}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Generating</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-800">绘制视觉卡片</p>
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= (generationProgress / (100 / steps.length)) ? 'w-6 bg-blue-500' : 'w-2 bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="bg-blue-50 px-4 py-1.5 rounded-2xl text-xs font-bold text-blue-600 border border-blue-100">
          步骤 {currentStepIndex + 1} / {steps.length}
        </div>
        <button onClick={() => playStepVoice(currentStep.text)} className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        </button>
      </div>

      <div className="relative aspect-square w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
        {currentStep.imageUrl ? (
          <img src={currentStep.imageUrl} className="w-full h-full object-contain animate-in zoom-in-95 duration-500" alt="Step" />
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
        <button 
          onClick={() => setSteps(prev => prev.map((s, i) => i === currentStepIndex ? {...s, completed: !s.completed} : s))}
          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${currentStep.completed ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 'border-slate-200 bg-slate-50 active:scale-95'}`}
        >
          {currentStep.completed ? (
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
          )}
        </button>
        <h4 className="text-xl font-bold text-slate-800 leading-tight flex-1">{currentStep.text}</h4>
      </div>

      <button onClick={handleNext} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-blue-200 active:scale-[0.98] transition-all hover:bg-blue-700">
        {currentStepIndex < steps.length - 1 ? '我做好了，下一步' : '训练圆满结束'}
      </button>
    </div>
  );
};

export default TrainingSession;
