// src/pages/Login/components/ProductPreview.tsx
import React from 'react';
import { Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Ambient glows */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-navy/10 rounded-full blur-3xl" />

      {/* Main preview card */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/40">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 ml-2">
            schedule.dashboard
          </span>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: 'Classes', value: '24', color: 'text-navy' },
              { label: 'Professors', value: '12', color: 'text-cyan-600' },
              { label: 'Rooms', value: '8', color: 'text-amber-600' },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-slate-100"
              >
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {s.label}
                </p>
                <p className={`text-xl font-bold ${s.color} mt-0.5`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Weekly timetable */}
          <div className="bg-gradient-to-br from-slate-50/80 to-white rounded-xl p-3 border border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                This Week
              </span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-1.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                <div
                  key={d}
                  className="text-[9px] text-slate-400 font-bold text-center uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {[
                ['cyan', 'emerald', 'slate', 'amber', 'slate'],
                ['slate', 'cyan', 'emerald', 'slate', 'cyan'],
                ['emerald', 'slate', 'cyan', 'emerald', 'slate'],
              ].map((row, ri) => (
                <div key={ri} className="grid grid-cols-5 gap-1.5">
                  {row.map((color, ci) => (
                    <div
                      key={ci}
                      className={`h-6 rounded-lg border ${
                        color === 'cyan'
                          ? 'bg-cyan-50 border-cyan-200'
                          : color === 'emerald'
                          ? 'bg-emerald-50 border-emerald-200'
                          : color === 'amber'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span className="text-[9px] text-slate-500 font-medium">Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-slate-500 font-medium">Confirmed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[9px] text-slate-500 font-medium">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-3.5 max-w-[210px] animate-[floatIn_0.6s_ease-out_both]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Schedule updated
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              3 new classes added
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute -top-6 -left-4 lg:-left-8 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-3.5 max-w-[220px] animate-[floatIn_0.6s_ease-out_both]"
        style={{ animationDelay: '200ms' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Next event · 10:30 AM
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              Room 201 · Systems Analysis
            </p>
          </div>
        </div>
      </div>

      <div
        className="absolute -bottom-20 -left-2 lg:-left-4 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/10 p-3.5 max-w-[200px] animate-[floatIn_0.6s_ease-out_both]"
        style={{ animationDelay: '400ms' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              Today's schedule
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">80% complete</p>
            <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan to-navy rounded-full"
                style={{ width: '80%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatIn {
          from { transform: translateY(12px) scale(0.95); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductPreview;
