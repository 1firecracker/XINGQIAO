
import React from 'react';
import { AppState } from '../types';

interface HeaderProps {
  currentView: AppState;
  setView: (v: AppState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-stone-200 rounded-lg flex items-center justify-center text-slate-700 font-bold">
          星
        </div>
        <h1 className="text-lg font-bold text-slate-800">星桥训练营</h1>
      </div>
      <div className="px-3 py-1 bg-stone-50 rounded-full text-green-600 text-xs font-medium border border-stone-200">
        AI 特教模型
      </div>
    </header>
  );
};

export default Header;
