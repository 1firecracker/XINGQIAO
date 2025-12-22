import React from 'react';

interface RegenerateImageDialogProps {
  isOpen: boolean;
  onUseCache: () => void;
  onRegenerate: () => void;
  cachedCount: number;
}

const RegenerateImageDialog: React.FC<RegenerateImageDialogProps> = ({
  isOpen,
  onUseCache,
  onRegenerate,
  cachedCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">发现缓存图片</h3>
            <p className="text-sm text-slate-600">
              检测到已有 {cachedCount} 张图片已生成，是否使用缓存图片？
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onUseCache}
              className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-bold active:scale-95 transition-all hover:bg-green-600 shadow-lg shadow-green-200"
            >
              使用缓存
            </button>
            <button
              onClick={onRegenerate}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold active:scale-95 transition-all hover:bg-slate-200"
            >
              重新生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegenerateImageDialog;

