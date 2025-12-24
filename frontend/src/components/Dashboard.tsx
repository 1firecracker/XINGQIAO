
import React from 'react';
import { TrainingRecord, AssistanceLevel } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  history: TrainingRecord[];
}

// 辅助等级转换为数字（用于图表）
const levelToNumber = (level: AssistanceLevel): number => {
  return level === 'F' ? 1 : level === 'P' ? 2 : 3;
};

// 数字转换为辅助等级标签
const numberToLevelLabel = (num: number): string => {
  return num === 1 ? 'F' : num === 2 ? 'P' : 'I';
};

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  // 辅助等级变化曲线数据
  const chartData = [...history].reverse().map((r, i) => ({
    name: `第${i+1}次`,
    level: levelToNumber(r.overallLevel || 'F'),
    levelLabel: r.overallLevel || 'F',
    milestone: r.milestone || 'Level1',
    scenarioName: r.scenarioName
  }));

  // 统计各等级分布
  const levelStats = history.reduce((acc, r) => {
    const level = r.overallLevel || 'F';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<AssistanceLevel, number>);

  // 统计里程碑分布
  const milestoneStats = history.reduce((acc, r) => {
    const milestone = r.milestone || 'Level1';
    acc[milestone] = (acc[milestone] || 0) + 1;
    return acc;
  }, {} as Record<'Level1' | 'Level2', number>);

  // 计算从F→P→I的训练次数（提升次数）
  let fToPCount = 0;
  let pToICount = 0;
  for (let i = 1; i < history.length; i++) {
    const prev = levelToNumber(history[i - 1].overallLevel || 'F');
    const curr = levelToNumber(history[i].overallLevel || 'F');
    if (prev === 1 && curr === 2) fToPCount++;
    if (prev === 2 && curr === 3) pToICount++;
  }

  const stats = history.length > 0 ? {
    total: history.length,
    fCount: levelStats.F || 0,
    pCount: levelStats.P || 0,
    iCount: levelStats.I || 0,
    level1Count: milestoneStats.Level1 || 0,
    level2Count: milestoneStats.Level2 || 0,
    fToPCount,
    pToICount
  } : null;

  // 等级分布图表数据
  const levelDistributionData = [
    { name: '🤝我要帮忙', level: 'F', value: stats?.fCount || 0, color: '#78716c' },
    { name: '💡提醒我呀', level: 'P', value: stats?.pCount || 0, color: '#78716c' },
    { name: '⭐我自己来', level: 'I', value: stats?.iCount || 0, color: '#78716c' }
  ];

  // 里程碑分布图表数据
  const milestoneDistributionData = [
    { name: 'Level1', value: stats?.level1Count || 0, color: '#cfcfcf' },
    { name: 'Level2', value: stats?.level2Count || 0, color: '#8b5cf6' }
  ];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-bold text-slate-800">{data.scenarioName || data.name}</p>
          <p className="text-xs text-slate-500">辅助等级: {data.levelLabel}</p>
          <p className="text-xs text-slate-500">里程碑: {data.milestone}</p>
        </div>
      );
    }
    return null;
  };

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
            <p className="text-2xl font-bold">{stats?.level2Count || 0}</p>
            <p className="text-[10px] opacity-70">Level2次数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats?.fToPCount + stats?.pToICount || 0}</p>
            <p className="text-[10px] opacity-70">提升次数</p>
          </div>
        </div>
      </div>

      {/* 辅助等级分布 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">辅助等级分布</h3>
        <div className="h-48 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {levelDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无训练数据</div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-stone-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-stone-400"></div>
            <span>🤝我要帮忙: {stats?.fCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-stone-400"></div>
            <span>💡提醒我呀: {stats?.pCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-stone-400"></div>
            <span>⭐我自己来: {stats?.iCount || 0}</span>
          </div>
        </div>
      </div>

      {/* 辅助等级变化曲线 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">辅助等级变化趋势</h3>
        <div className="h-48 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0.5, 3.5]} ticks={[1, 2, 3]} tickFormatter={numberToLevelLabel} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#34d399" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#34d399' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无训练数据</div>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          {stats && stats.fToPCount > 0 && <span>F→P: {stats.fToPCount}次 </span>}
          {stats && stats.pToICount > 0 && <span>P→I: {stats.pToICount}次</span>}
        </div>
      </div>

      {/* 里程碑分布 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">能力里程碑分布</h3>
        <div className="h-32 w-full">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milestoneDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {milestoneDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无训练数据</div>
          )}
        </div>
      </div>

      {/* 最近练习 */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 px-1">最近练习</h3>
        {history.length > 0 ? (
          history.slice(0, 5).map((r, i) => {
            const level = r.overallLevel || 'F';
            const levelColor = level === 'I' ? 'text-green-600' : level === 'P' ? 'text-yellow-600' : 'text-red-600';
            const levelBg = level === 'I' ? 'bg-green-50' : level === 'P' ? 'bg-yellow-50' : 'bg-red-50';
            return (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{r.scenarioName}</p>
                  <p className="text-[10px] text-slate-400">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="px-2 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold">
                    {level === 'F' ? '🤝我要帮忙' : level === 'P' ? '💡提醒我呀' : '⭐我自己来'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.milestone || 'Level1'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">快去开始第一次训练吧</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
