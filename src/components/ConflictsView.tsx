import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Info,
  ChevronRight,
  ShieldCheck,
  Split,
  Compass,
  ArrowRight
} from 'lucide-react';
import { DetectedConflict, ExtractedNotice } from '../types';

interface ConflictsViewProps {
  conflicts: DetectedConflict[];
  notices: ExtractedNotice[];
  onSelectNotice: (noticeId: string) => void;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({
  conflicts,
  notices,
  onSelectNotice,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'direct_overlap' | 'incomplete_schedule'>('all');

  const filteredConflicts = conflicts.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const directOverlapsCount = conflicts.filter((c) => c.type === 'direct_overlap').length;
  const incompleteCount = conflicts.filter((c) => c.type === 'incomplete_schedule').length;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Schedule Conflict Matrix &amp; Collision Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic calendar verification. Identifies overlapping time intervals and evaluates venue travel constraints.
          </p>
        </div>

        {/* Filter segmented buttons (Anti-slop clean segmented button) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Issues ({conflicts.length})
          </button>
          <button
            onClick={() => setFilterType('direct_overlap')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'direct_overlap'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Time Collisions ({directOverlapsCount})
          </button>
          <button
            onClick={() => setFilterType('incomplete_schedule')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'incomplete_schedule'
                ? 'bg-amber-950 text-amber-300 border border-amber-800/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incomplete Timings ({incompleteCount})
          </button>
        </div>
      </div>

      {/* No Conflicts State */}
      {conflicts.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-base font-semibold text-white">No Schedule Collisions Detected</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            All verified notices take place on distinct dates or non-overlapping hours. You are free of double-booking!
          </p>
        </div>
      ) : filteredConflicts.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
          No conflicts matching this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((conflict) => {
            const isOverlap = conflict.type === 'direct_overlap';
            const noticeAData = notices.find((n) => n.id === conflict.noticeA.id);
            const noticeBData = notices.find((n) => n.id === conflict.noticeB.id);

            return (
              <div
                key={conflict.id}
                className={`bg-[#0f172a] border rounded-xl overflow-hidden shadow-xl transition-all ${
                  isOverlap
                    ? 'border-rose-800/50 hover:border-rose-700'
                    : 'border-amber-800/40 hover:border-amber-700'
                }`}
              >
                {/* Conflict Card Header */}
                <div
                  className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                    isOverlap
                      ? 'bg-rose-950/30 border-rose-900/40'
                      : 'bg-amber-950/20 border-amber-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                        isOverlap
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-700/60'
                          : 'bg-amber-900/80 text-amber-200 border border-amber-700/60'
                      }`}
                    >
                      {isOverlap ? 'Direct Time Collision' : 'Incomplete Timing Flag'}
                    </span>

                    <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date: <span className="font-mono text-white">{conflict.date}</span>
                    </span>

                    {conflict.overlapMinutes && (
                      <span className="text-xs text-rose-300 font-mono">
                        Overlap: <strong>{conflict.overlapMinutes} min</strong>
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    Severity: <strong className="text-slate-200 uppercase">{conflict.severity}</strong>
                  </span>
                </div>

                {/* Conflict Visual Side-by-Side Comparison */}
                <div className="p-6 space-y-5">
                  {/* Explanation Banner */}
                  <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                    <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">{conflict.explanation}</p>
                      {conflict.overlapWindow && (
                        <p className="text-rose-300 font-mono mt-1">
                          Exact Overlapping Interval: {conflict.overlapWindow}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Notice Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event A */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase text-teal-400 tracking-wider">
                          Commitment A
                        </span>
                        <button
                          onClick={() => onSelectNotice(conflict.noticeA.id)}
                          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline"
                        >
                          View Notice <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {conflict.noticeA.eventName}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-white">{conflict.noticeA.timeString}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-300">{conflict.noticeA.venue}</span>
                        </div>
                      </div>

                      {noticeAData && (
                        <p className="text-xs text-slate-400 line-clamp-2 pt-1 border-t border-slate-800">
                          {noticeAData.description}
                        </p>
                      )}
                    </div>

                    {/* Event B */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase text-amber-400 tracking-wider">
                          Commitment B
                        </span>
                        <button
                          onClick={() => onSelectNotice(conflict.noticeB.id)}
                          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 hover:underline"
                        >
                          View Notice <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-white line-clamp-1">
                        {conflict.noticeB.eventName}
                      </h3>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-white">{conflict.noticeB.timeString}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-300">{conflict.noticeB.venue}</span>
                        </div>
                      </div>

                      {noticeBData && (
                        <p className="text-xs text-slate-400 line-clamp-2 pt-1 border-t border-slate-800">
                          {noticeBData.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resolution Strategy Recommendation */}
                  <div className="p-3.5 rounded-lg bg-[#0b132b] border border-teal-500/30 flex items-start gap-3">
                    <Compass className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-teal-300 block mb-0.5">
                        Actionable Resolution Advice:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {conflict.resolutionRecommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
