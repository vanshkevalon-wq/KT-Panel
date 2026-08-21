import React from 'react';

const Badge = ({ variant = 'info', children, size = 'normal' }) => {
  const variants = {
    admin: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    hr: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    theory: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    practical: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    published: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    draft: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    passed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    failed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    pdf: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    manual: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  const style = variants[variant] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <span
      className={`inline-flex items-center font-bold tracking-wider uppercase border rounded-md px-2 py-0.5 text-[10px] ${style}`}
    >
      {children}
    </span>
  );
};

export default Badge;
