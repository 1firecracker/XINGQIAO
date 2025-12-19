
import React, { useEffect, useRef } from 'react';
import { TrainingRecord } from '../types';
import { SCENARIOS, SFX } from '../constants';
import { generateTTSAudio, decodeAudioBuffer } from '../geminiService';

interface FeedbackViewProps {
  record: TrainingRecord;
  onNext: () => void;
  onTryAgain: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ record, onNext, onTryAgain }) => {
  const isPerfect = record.score === 100;
  const nextScenario = SCENARIOS.find(s => s.id === SCENARIOS.find(curr => curr.id === record.scenarioId)?.next_recommendation) || SCENARIOS[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Play final success sound
    const sfx = new Audio(SFX.FINAL_SUCCESS);
    sfx.volume = 0.5;
    sfx.play().catch(e => console.warn("Final SFX blocked", e));

    // Play celebratory voice note
    const playPraise = async () => {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const praiseText = isPerfect 
        ? "太棒了！你完美完成了所有步骤，真为你感到骄傲！" 
        : `你已经完成了 ${record.completedSteps} 个步骤，表现得很棒哦，我们下次再来挑战！`;
      
      try {
        const base64Audio = await generateTTSAudio(praiseText);
        const buffer = await decodeAudioBuffer(base64Audio, audioCtxRef.current);
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.start();
      } catch (err) {
        console.error("Praise voice failed", err);
      }
    };

    const timeoutId = setTimeout(playPraise, 1000); // Small delay to let SFX play first

    return () => {
      clearTimeout(timeoutId);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10 text-center">
      <div className="relative">
        <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center text-6xl animate-bounce">
          {isPerfect ? '🌟' : '💪'}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-3 py-1 rounded-full font-bold text-xl shadow-lg">
          {record.score}分
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          {isPerfect ? '太棒了！训练完成' : '好样的！再接再厉'}
        </h2>
        <p className="text-slate-500 max-w-[280px]">
          {isPerfect 
            ? `你已经完美掌握了「${record.scenarioName}」的所有步骤。` 
            : `你完成了 ${record.completedSteps}/${record.totalSteps} 个步骤。继续加油哦！`}
        </p>
      </div>

      <div className="w-full bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4 text-left">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
          {nextScenario.icon}
        </div>
        <div>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">进阶推荐</p>
          <h4 className="font-bold text-blue-800">去试试「{nextScenario.name}」吧</h4>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={onNext}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95"
        >
          回到首页
        </button>
        <button 
          onClick={onTryAgain}
          className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-lg active:scale-95"
        >
          重新练习
        </button>
      </div>
    </div>
  );
};

export default FeedbackView;
