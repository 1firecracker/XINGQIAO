
import React, { useState, useEffect, useRef } from 'react';
import { Scenario, UserPreferences, TrainingStep } from '../types';
import { planScenarioSteps, generateSpecialEdImage, generateTTSAudio, decodeAudioBuffer } from '../geminiService';
import { MUSIC_OPTIONS, SFX } from '../constants';
import RegenerateImageDialog from './RegenerateImageDialog';
import { scenariosApi } from '../api/scenarios';

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
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:component_render',message:'TrainingSession component rendered',data:{scenarioId:scenario.id,scenarioName:scenario.name,hasSteps:'steps' in scenario,stepsCount:scenario.steps?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const [mode, setMode] = useState<SessionMode>('PLANNING');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TrainingStep[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const isNewDynamicScenarioRef = useRef<boolean>(false);
  const runningScenarioIdRef = useRef<string | null>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:useEffect',message:'useEffect triggered',data:{scenarioId:scenario.id,scenarioName:scenario.name,hasSteps:'steps' in scenario,isDynamic:'isDynamic' in scenario,runningScenarioId:runningScenarioIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // 清除之前的运行标记（允许重新执行同一个场景）
    if (runningScenarioIdRef.current === scenario.id) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:useEffect',message:'Clearing previous running flag for same scenario',data:{scenarioId:scenario.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      runningScenarioIdRef.current = null;
    }
    
    // 标记当前scenario正在执行
    const currentScenarioId = scenario.id;
    runningScenarioIdRef.current = currentScenarioId;
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // 异步执行
    const executeFlow = async () => {
      // 检查scenario.id是否变化（防止在异步执行期间scenario变化）
      if (scenario.id !== currentScenarioId) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:useEffect',message:'Scenario changed during execution, aborting',data:{originalId:currentScenarioId,newId:scenario.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (runningScenarioIdRef.current === currentScenarioId) {
          runningScenarioIdRef.current = null;
        }
        return;
      }
      await startSessionFlow();
      // 执行完成后，如果scenario.id没变，清除标记
      if (runningScenarioIdRef.current === currentScenarioId) {
        runningScenarioIdRef.current = null;
      }
    };
    
    executeFlow();
    
    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:useEffect_cleanup',message:'useEffect cleanup',data:{scenarioId:scenario.id,currentScenarioId,runningScenarioId:runningScenarioIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // 只在scenario.id变化时才清除标记（React严格模式的cleanup不应该清除）
      if (runningScenarioIdRef.current === currentScenarioId && scenario.id !== currentScenarioId) {
        runningScenarioIdRef.current = null;
      }
      if (bgMusicRef.current) bgMusicRef.current.pause();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [scenario.id]);

  const startSessionFlow = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'startSessionFlow called',data:{scenarioId:scenario.id,scenarioName:scenario.name,hasSteps:'steps' in scenario,isDynamic:'isDynamic' in scenario,runningScenarioId:runningScenarioIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // 双重检查：防止并发执行
    if (runningScenarioIdRef.current !== scenario.id) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Prevented duplicate startSessionFlow',data:{scenarioId:scenario.id,currentMode:mode,runningScenarioId:runningScenarioIdRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }
    
    setMode('PLANNING');
    try {
      // 1. 规划步骤 (AI 专家介入)
      let plannedSteps: TrainingStep[];
      let totalImagesCount: number;
      let scenarioId: number | undefined;

      isNewDynamicScenarioRef.current = false;
      if ('steps' in scenario && !('isDynamic' in scenario)) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Using existing steps',data:{stepsCount:scenario.steps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        plannedSteps = scenario.steps;
        totalImagesCount = plannedSteps.length;
        // 尝试从scenario.id获取数字ID（如果是后端场景）
        const numericId = parseInt(scenario.id);
        scenarioId = isNaN(numericId) ? undefined : numericId;
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Planning new scenario',data:{topic:scenario.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        // 动态场景：需要先规划步骤
        isNewDynamicScenarioRef.current = true;
        const result = await planScenarioSteps(scenario.name, preferences);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Plan scenario completed',data:{stepsCount:result.steps.length,totalImages:result.totalImages},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        plannedSteps = result.steps;
        totalImagesCount = result.totalImages;
        // 注意：此时不立即保存场景，等图片生成完成后再保存
      }

      // 检查步骤是否已有imageUrl
      const stepsWithImages = plannedSteps.map(step => ({
        ...step,
        imageUrl: step.imageUrl || null
      }));

      // 检查是否有缺失的图片
      const missingImages = stepsWithImages.filter(s => !s.imageUrl);
      const hasCachedImages = stepsWithImages.some(s => s.imageUrl);
      const cachedCount = stepsWithImages.filter(s => s.imageUrl).length;

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Image cache check',data:{totalSteps:stepsWithImages.length,cachedCount,missingCount:missingImages.length,hasCachedImages},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      // 如果有缓存图片且所有图片都存在，询问用户
      if (hasCachedImages && missingImages.length === 0) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'All images cached, showing dialog',data:{cachedCount,totalSteps:stepsWithImages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setSteps(stepsWithImages);
        setTotalImages(totalImagesCount);
        setMode('ACTIVE'); // 设置为ACTIVE模式，确保对话框可以显示
        // 使用setTimeout确保状态更新后再显示对话框
        setTimeout(() => {
          setShowRegenerateDialog(true);
        }, 0);
        return; // 等待用户选择
      }

      // 如果有部分缓存，直接使用缓存，只生成缺失的
      if (hasCachedImages && missingImages.length > 0) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Partial cache, generating missing',data:{missingCount:missingImages.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setSteps(stepsWithImages);
        setTotalImages(totalImagesCount);
        setMode('GENERATING');
        
        // 只生成缺失的图片
        const genPromises = missingImages.map(async (step, idx) => {
          const stepId = step.id;
          const url = await generateSpecialEdImage(
            step.img_prompt_suffix, 
            preferences,
            stepId,
            scenarioId
          );
          setGenerationProgress(prev => prev + (100 / totalImagesCount));
          
          // 如果生成成功且有stepId和scenarioId，保存到数据库
          if (url && stepId && scenarioId) {
            try {
              await scenariosApi.updateStepImage(scenarioId, stepId, url);
            } catch (error) {
              console.error('Failed to save image URL to database:', error);
            }
          }
          
          return { stepId, url };
        });

        const results = await Promise.all(genPromises);
        const finalizedSteps = stepsWithImages.map((s) => {
          const result = results.find(r => r.stepId === s.id);
          return {
            ...s,
            imageUrl: result?.url || s.imageUrl
          };
        });

        // 如果是新的动态场景，在图片生成完成后保存场景（包含imageUrl）
        if (isNewDynamicScenarioRef.current && onScenarioPlanned) {
          const newScenario: Scenario = {
            id: scenario.id,
            name: scenario.name,
            icon: scenario.icon || '✨',
            description: `由 AI 为你定制的 ${finalizedSteps.length} 步训练方案`,
            steps: finalizedSteps.map(step => ({
              id: step.id,
              text: step.text,
              img_prompt_suffix: step.img_prompt_suffix,
              imageUrl: step.imageUrl
            })),
            next_recommendation: 'supermarket_queue'
          };
          onScenarioPlanned(newScenario);
          isNewDynamicScenarioRef.current = false; // 标记已保存
        }

        setSteps(finalizedSteps);
        setMode('ACTIVE');
        if (runningScenarioIdRef.current === scenario.id) {
          runningScenarioIdRef.current = null;
        };
        playStepVoice(finalizedSteps[0].text);
        return;
      }

      // 如果没有缓存，生成所有图片
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'No cache, generating all images',data:{totalImages:totalImagesCount,stepsCount:plannedSteps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setSteps(stepsWithImages);
      setTotalImages(totalImagesCount);
      setMode('GENERATING');
      
      const genPromises = plannedSteps.map(async (step, idx) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Starting image generation',data:{stepId:step.id,stepIndex:idx,totalSteps:plannedSteps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        const stepId = step.id;
        const url = await generateSpecialEdImage(
          step.img_prompt_suffix, 
          preferences,
          stepId,
          scenarioId
        );
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:startSessionFlow',message:'Image generation completed',data:{stepId,stepIndex:idx,hasUrl:!!url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setGenerationProgress(prev => prev + (100 / totalImagesCount));
        
        // 如果生成成功且有stepId和scenarioId，保存到数据库
        if (url && stepId && scenarioId) {
          try {
            await scenariosApi.updateStepImage(scenarioId, stepId, url);
          } catch (error) {
            console.error('Failed to save image URL to database:', error);
          }
        }
        
        return { idx, stepId, url };
      });

      const results = await Promise.all(genPromises);
      const finalizedSteps = plannedSteps.map((s, i) => ({
        ...s,
          imageUrl: results.find(r => r.idx === i || r.stepId === s.id)?.url
      }));

        // 如果是新的动态场景，在图片生成完成后保存场景（包含imageUrl）
        if (isNewDynamicScenarioRef.current && onScenarioPlanned) {
          const newScenario: Scenario = {
            id: scenario.id,
            name: scenario.name,
            icon: scenario.icon || '✨',
            description: `由 AI 为你定制的 ${finalizedSteps.length} 步训练方案`,
            steps: finalizedSteps.map(step => ({
              id: step.id,
              text: step.text,
              img_prompt_suffix: step.img_prompt_suffix,
              imageUrl: step.imageUrl
            })),
            next_recommendation: 'supermarket_queue'
          };
          onScenarioPlanned(newScenario);
          isNewDynamicScenarioRef.current = false; // 标记已保存
        }

      setSteps(finalizedSteps);
      setMode('ACTIVE');
        if (runningScenarioIdRef.current === scenario.id) {
          runningScenarioIdRef.current = null;
        };
      playStepVoice(finalizedSteps[0].text);
    } catch (err) {
      console.error("Session Flow Error:", err);
      if (runningScenarioIdRef.current === scenario.id) {
          runningScenarioIdRef.current = null;
        };
      onCancel();
    }
  };

  const handleUseCache = () => {
    setShowRegenerateDialog(false);
    // 使用缓存的图片，直接进入训练
    // 如果是新的动态场景且还没有保存，现在保存（包含imageUrl）
    if (isNewDynamicScenarioRef.current && onScenarioPlanned && steps.length > 0 && steps.every(s => s.imageUrl)) {
      const newScenario: Scenario = {
        id: scenario.id,
        name: scenario.name,
        icon: scenario.icon || '✨',
        description: `由 AI 为你定制的 ${steps.length} 步训练方案`,
        steps: steps.map(step => ({
          id: step.id,
          text: step.text,
          img_prompt_suffix: step.img_prompt_suffix,
          imageUrl: step.imageUrl
        })),
        next_recommendation: 'supermarket_queue'
      };
      onScenarioPlanned(newScenario);
      isNewDynamicScenarioRef.current = false; // 标记已保存
    }
    if (runningScenarioIdRef.current === scenario.id) {
          runningScenarioIdRef.current = null;
        };
    setMode('ACTIVE');
    if (steps.length > 0) {
      playStepVoice(steps[0].text);
    }
  };

  const handleRegenerate = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:handleRegenerate',message:'handleRegenerate called',data:{stepsCount:steps.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    setShowRegenerateDialog(false);
    // 重新生成所有图片
    const totalImagesCount = steps.length;
    setMode('GENERATING');
    setGenerationProgress(0);
    
    const scenarioId = parseInt(scenario.id);
    const numericScenarioId = isNaN(scenarioId) ? undefined : scenarioId;
    
    const genPromises = steps.map(async (step, idx) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:handleRegenerate',message:'Regenerating image',data:{stepId:step.id,stepIndex:idx},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      const stepId = step.id;
      const url = await generateSpecialEdImage(
        step.img_prompt_suffix, 
        preferences,
        stepId,
        numericScenarioId
      );
      setGenerationProgress(prev => prev + (100 / totalImagesCount));
      
      // 如果生成成功且有stepId和scenarioId，保存到数据库
      if (url && stepId && numericScenarioId) {
        try {
          await scenariosApi.updateStepImage(numericScenarioId, stepId, url);
        } catch (error) {
          console.error('Failed to save image URL to database:', error);
        }
      }
      
      return { idx, stepId, url };
    });

    const results = await Promise.all(genPromises);
    const finalizedSteps = steps.map((s, i) => ({
      ...s,
      imageUrl: results.find(r => r.idx === i || r.stepId === s.id)?.url
    }));

    setSteps(finalizedSteps);
    setMode('ACTIVE');
    if (runningScenarioIdRef.current === scenario.id) {
          runningScenarioIdRef.current = null;
        };
    playStepVoice(finalizedSteps[0].text);
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
      <>
        <RegenerateImageDialog
          isOpen={showRegenerateDialog}
          onUseCache={handleUseCache}
          onRegenerate={handleRegenerate}
          cachedCount={steps.filter(s => s.imageUrl).length}
        />
      <div className="flex flex-col items-center justify-center h-full space-y-8 py-20 text-center animate-pulse">
        <div className="w-24 h-24 bg-stone-50 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner">🧠</div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-slate-800">AI 专家编排中</p>
          <p className="text-slate-400 text-sm px-10">正在为您构建符合特教逻辑的视觉社交故事...</p>
        </div>
      </div>
      </>
    );
  }

  if (mode === 'GENERATING') {
    return (
      <>
        <RegenerateImageDialog
          isOpen={showRegenerateDialog}
          onUseCache={handleUseCache}
          onRegenerate={handleRegenerate}
          cachedCount={steps.filter(s => s.imageUrl).length}
        />
      <div className="flex flex-col items-center justify-center h-full space-y-8 py-20 text-center">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402} strokeDashoffset={402 - (402 * generationProgress) / 100} className="text-green-400 transition-all duration-500" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-800">{Math.round(generationProgress)}%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Generating</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-800">绘制视觉卡片</p>
          <p className="text-slate-400 text-sm">需要生成 {totalImages} 张图片</p>
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: totalImages }, (_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= (generationProgress / (100 / totalImages)) ? 'w-6 bg-green-300' : 'w-2 bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
      </div>
      </>
    );
  }

  const currentStep = steps[currentStepIndex];
  const cachedCount = steps.filter(s => s.imageUrl).length;

  return (
    <>
      <RegenerateImageDialog
        isOpen={showRegenerateDialog}
        onUseCache={handleUseCache}
        onRegenerate={handleRegenerate}
        cachedCount={cachedCount}
      />
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="bg-stone-50 px-4 py-1.5 rounded-2xl text-xs font-bold text-green-600 border border-stone-200">
          步骤 {currentStepIndex + 1} / {steps.length}
        </div>
        <button onClick={() => playStepVoice(currentStep.text)} className="p-2.5 bg-green-400 rounded-2xl text-white shadow-lg shadow-green-200 active:scale-90 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        </button>
      </div>

      <div className="relative aspect-square w-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-slate-100">
        {currentStep.imageUrl ? (
          <>
            {/* #region agent log */}
            {(() => {
              const imgUrl = currentStep.imageUrl;
              const isRelative = imgUrl?.startsWith('/');
              const isAbsolute = imgUrl?.startsWith('http');
              fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:img_src',message:'Rendering image',data:{imageUrl:imgUrl,isRelative,isAbsolute,currentOrigin:window.location.origin,fullUrl:isRelative ? window.location.origin + imgUrl : imgUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              return null;
            })()}
            {/* #endregion */}
            <img 
              src={currentStep.imageUrl} 
              className="w-full h-full object-contain animate-in zoom-in-95 duration-500" 
              alt="Step"
              onError={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:img_onError',message:'Image load failed',data:{imageUrl:currentStep.imageUrl,src:(e.target as HTMLImageElement).src},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                console.error('Image load failed:', currentStep.imageUrl);
              }}
              onLoad={() => {
                // #region agent log
                fetch('http://127.0.0.1:7243/ingest/77189bd5-cf28-46a6-93a6-2efc554a2100',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TrainingSession.tsx:img_onLoad',message:'Image loaded successfully',data:{imageUrl:currentStep.imageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-green-400 rounded-full animate-spin"></div>
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

      <button onClick={handleNext} className="w-full py-5 bg-green-500 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-green-200 active:scale-[0.98] transition-all hover:bg-green-600">
        {currentStepIndex < steps.length - 1 ? '我做好了，下一步' : '训练圆满结束'}
      </button>
    </div>
    </>
  );
};

export default TrainingSession;
