
import React from 'react';
import { TrainingRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  history: TrainingRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  const chartData = [...history].reverse().map((r, i) => ({
    name: `第${i+1}次`,
    score: r.score
  }));

  const stats = history.length > 0 ? {
    total: history.length,
    avg: Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length),
    perfects: history.filter(r => r.score === 100).length
  } : null;

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-br from-stone-100 to-stone-200 p-6 rounded-3xl text-slate-800 shadow-lg">
        <h2 className="text-xl font-bold opacity-90">成长印记</h2>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-[10px] opacity-70">训练次数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.avg || 0}%</p>
            <p className="text-[10px] opacity-70">平均分数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.perfects || 0}</p>
            <p className="text-[10px] opacity-70">满分次数</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">分数趋势</h3>
        <div className="h-48 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无训练数据</div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 px-1">最近练习</h3>
        {history.length > 0 ? (
          history.slice(0, 5).map((r, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{r.scenarioName}</p>
                <p className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
              </div>
              <div className={`font-bold ${r.score === 100 ? 'text-green-500' : 'text-green-500'}`}>
                {r.score} 分
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">快去开始第一次训练吧</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
