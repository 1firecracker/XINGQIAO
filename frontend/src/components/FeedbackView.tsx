
import React, { useEffect, useRef } from 'react';
import { TrainingRecord } from '../types';
import { SCENARIOS, SFX } from '../constants';
import { generateTTSAudio, decodeAudioBuffer } from '../geminiService';
import { getFeedbackMessage, ASSISTANCE_LEVEL_DESCRIPTIONS } from '../vbmappConfig';

interface FeedbackViewProps {
  record: TrainingRecord;
  onNext: () => void;
  onTryAgain: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ record, onNext, onTryAgain }) => {
  const overallLevel = record.overallLevel || 'F';
  const milestone = record.milestone || 'Level1';
  const isIndependent = overallLevel === 'I';
  const nextScenario = SCENARIOS.find(s => s.id === SCENARIOS.find(curr => curr.id === record.scenarioId)?.next_recommendation) || SCENARIOS[0];
  const feedbackMessage = getFeedbackMessage(record.scenarioId, overallLevel);
  const levelDescription = ASSISTANCE_LEVEL_DESCRIPTIONS[overallLevel];
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Play final success sound
    const sfx = new Audio(SFX.FINAL_SUCCESS);
    sfx.volume = 0.5;
    sfx.play().catch(e => console.warn("Final SFX blocked", e));

    // Play celebratory voice note with VB-MAPP feedback
    const playPraise = async () => {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const praiseText = feedbackMessage;
      
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
  }, [feedbackMessage]);

  const levelColor = overallLevel === 'I' ? 'green' : overallLevel === 'P' ? 'yellow' : 'red';
  const levelBgColor = overallLevel === 'I' ? 'bg-green-50' : overallLevel === 'P' ? 'bg-yellow-50' : 'bg-red-50';
  const levelBorderColor = overallLevel === 'I' ? 'border-green-200' : overallLevel === 'P' ? 'border-yellow-200' : 'border-red-200';
  const levelTextColor = overallLevel === 'I' ? 'text-green-700' : overallLevel === 'P' ? 'text-yellow-700' : 'text-red-700';

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10 text-center">
      <div className="relative">
        <div className={`w-32 h-32 ${levelBgColor} rounded-full flex items-center justify-center text-6xl animate-bounce`}>
          {isIndependent ? '🌟' : overallLevel === 'P' ? '💪' : '👋'}
        </div>
        <div className={`absolute -bottom-2 -right-2 ${levelColor === 'green' ? 'bg-green-500' : levelColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'} text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg`}>
          {levelDescription.name}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">
          {isIndependent ? '太棒了！训练完成' : '好样的！继续努力'}
        </h2>
        <p className="text-slate-500 max-w-[280px]">
          {feedbackMessage}
        </p>
        <div className={`mt-4 px-4 py-2 ${levelBgColor} ${levelBorderColor} border-2 rounded-2xl inline-block`}>
          <p className="text-xs text-slate-500 mb-1">能力里程碑</p>
          <p className={`font-bold ${levelTextColor}`}>{milestone}</p>
        </div>
      </div>

      <div className="w-full bg-stone-50 p-6 rounded-2xl border border-stone-200 flex items-center gap-4 text-left">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
          {nextScenario.icon}
        </div>
        <div>
          <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">进阶推荐</p>
          <h4 className="font-bold text-green-700">去试试「{nextScenario.name}」吧</h4>
        </div>
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={onNext}
          className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95"
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
