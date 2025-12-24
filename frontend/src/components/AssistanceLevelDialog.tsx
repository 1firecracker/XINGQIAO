import React from 'react';
import { AssistanceLevel } from '../types';

interface AssistanceLevelDialogProps {
  isOpen: boolean;
  onSelect: (level: AssistanceLevel) => void;
  onClose?: () => void;
  stepText?: string;
}

const AssistanceLevelDialog: React.FC<AssistanceLevelDialogProps> = ({
  isOpen,
  onSelect,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSelect = (level: AssistanceLevel) => {
    onSelect(level);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-3">
        <div className="space-y-3">
          <button
            onClick={() => handleSelect('F')}
            className="w-full p-4 bg-stone-100 border-2 border-stone-300 rounded-2xl text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤝</span>
              <span className="font-bold text-stone-700 text-lg">我要帮忙</span>
            </div>
          </button>

          <button
            onClick={() => handleSelect('P')}
            className="w-full p-4 bg-stone-100 border-2 border-stone-300 rounded-2xl text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <span className="font-bold text-stone-700 text-lg">提醒我呀</span>
            </div>
          </button>

          <button
            onClick={() => handleSelect('I')}
            className="w-full p-4 bg-stone-100 border-2 border-stone-300 rounded-2xl text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">⭐</span>
              <span className="font-bold text-stone-700 text-lg">我自己来</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistanceLevelDialog;

