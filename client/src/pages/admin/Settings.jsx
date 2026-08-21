import React from 'react';
import Badge from '../../components/common/Badge';
import { FiSettings, FiShield, FiCheckCircle, FiLock } from 'react-icons/fi';

const roleMatrix = [
  {
    role: 'admin',
    name: 'Administrator',
    description: 'Complete system control, user role management, system settings, theory, practical & PDF import.',
    permissions: ['* Full Override Access'],
  },
  {
    role: 'hr',
    name: 'HR Manager',
    description: 'Candidate directory, assessment assignment, evaluation status, and result reports.',
    permissions: [
      'candidate.view',
      'candidate.create',
      'candidate.update',
      'candidate.delete',
      'assessment.view',
      'assessment.assign',
      'result.view',
    ],
  },
  {
    role: 'theory',
    name: 'Theory Evaluator',
    description: 'Theory question bank creation, MCQ categorization, theory exam configuration.',
    permissions: [
      'theory.question.view',
      'theory.question.create',
      'theory.question.update',
      'theory.question.delete',
      'assessment.view',
      'result.view',
    ],
  },
  {
    role: 'practical',
    name: 'Practical Evaluator',
    description: 'Practical coding task bank, instructions, technology tags, and task scoring.',
    permissions: [
      'practical.question.view',
      'practical.question.create',
      'practical.question.update',
      'practical.question.delete',
      'assessment.view',
      'result.view',
    ],
  },
];

const Settings = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Role & Permission Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized role-based permission matrix and Admin security overrides.
          </p>
        </div>
        <Badge variant="admin">Security Enforced</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleMatrix.map((item) => (
          <div key={item.role} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiShield className="text-indigo-400 text-lg" />
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
              </div>
              <Badge variant={item.role}>{item.role}</Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Granted Permissions:</p>
              <div className="flex flex-wrap gap-1.5">
                {item.permissions.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    <FiCheckCircle className="text-emerald-400 text-xs" />
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
