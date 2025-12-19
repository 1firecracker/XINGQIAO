
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { VOICE_OPTIONS, MUSIC_OPTIONS } from '../constants';

interface SettingsProps {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
}

const Settings: React.FC<SettingsProps> = ({ preferences, setPreferences }) => {
  const [name, setName] = useState(preferences.childName);
  const [interest, setInterest] = useState(preferences.interest);
  const [voiceName, setVoiceName] = useState(preferences.voiceName);
  const [bgMusic, setBgMusic] = useState(preferences.bgMusic);

  const handleSave = () => {
    setPreferences({ 
      childName: name, 
      interest: interest,
      voiceName: voiceName,
      bgMusic: bgMusic
    });
    alert('保存成功！');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="text-xl font-bold text-slate-800">个性化设置</h2>
        
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 block">宝贝昵称</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：果果"
          />
        </div>

        {/* AI Interest Slots */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 block">兴趣偏好 (AI 插槽变量)</label>
          <p className="text-xs text-slate-400 mb-2">输入一个宝贝喜欢的词语，AI 会将其融入生成场景中。</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {['小汽车', '恐龙', '猫咪', '向日葵'].map(tag => (
              <button 
                key={tag}
                onClick={() => setInterest(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${interest === tag ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="例如：蓝色汽车"
          />
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 block">温柔声音提示</label>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_OPTIONS.map(v => (
              <button
                key={v.id}
                onClick={() => setVoiceName(v.id)}
                className={`p-3 rounded-xl border text-left transition-all ${voiceName === v.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-slate-100'}`}
              >
                <p className={`text-sm font-bold ${voiceName === v.id ? 'text-blue-600' : 'text-slate-700'}`}>{v.name}</p>
                <p className="text-[10px] text-slate-400">{v.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Music Selection */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 block">训练背景音乐</label>
          <select 
            value={bgMusic}
            onChange={(e) => setBgMusic(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
          >
            {MUSIC_OPTIONS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all"
        >
          保存配置
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2">多感官辅助系统</h3>
        <p className="text-xs text-blue-600 leading-relaxed">
          通过结合 AI 生成的视觉锚点、Gemini 原生 TTS 温柔语音提示、以及宁静的背景音乐，我们为宝贝创造了一个低刺激、高聚焦的沉浸式训练环境。
        </p>
      </div>
    </div>
  );
};

export default Settings;
