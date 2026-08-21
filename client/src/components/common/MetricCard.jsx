import React from 'react';

const MetricCard = ({ title, value, icon: Icon, trend, color = 'indigo', subtext }) => {
  const iconColors = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  const iconColorClass = iconColors[color] || iconColors.indigo;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden transition hover:border-slate-700 duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl ${iconColorClass}`}>
            <Icon />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center space-x-1.5 text-[11px] font-medium text-slate-400">
          <span className="text-emerald-400 font-bold">{trend}</span>
          <span>vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
