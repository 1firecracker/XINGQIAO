
import React from 'react';
import { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onStart: (s: Scenario) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onStart }) => {
  return (
    <div 
      onClick={() => onStart(scenario)}
      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-green-200"
    >
      <div className="w-14 h-14 bg-stone-50 rounded-xl flex items-center justify-center text-3xl">
        {scenario.icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800">{scenario.name}</h3>
        <p className="text-sm text-slate-500 leading-tight">{scenario.description}</p>
      </div>
      <div className="text-slate-300">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </div>
    </div>
  );
};

export default ScenarioCard;
