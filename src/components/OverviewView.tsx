import React from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ListTodo,
  FileText,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Layers,
  UploadCloud,
  CheckSquare,
  Square
} from 'lucide-react';
import { ExtractedNotice, DetectedConflict, ActionTask } from '../types';

interface OverviewViewProps {
  notices: ExtractedNotice[];
  conflicts: DetectedConflict[];
  tasks: ActionTask[];
  onSelectNotice: (noticeId: string) => void;
  onNavigateTab: (tab: 'notices' | 'planner' | 'conflicts') => void;
  onToggleTask: (taskId: string) => void;
  onLoadDemoData: () => void;
  onOpenUpload: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  notices,
  conflicts,
  tasks,
  onSelectNotice,
  onNavigateTab,
  onToggleTask,
  onLoadDemoData,
  onOpenUpload,
}) => {
  const directOverlaps = conflicts.filter((c) => c.type === 'direct_overlap');
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Sort upcoming events by date
  const upcomingNotices = [...notices]
    .filter((n) => n.date)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Student Intelligence Command Center
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            CampusLens — Notice to Next Action
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Autonomous visual notices extractor powered by your local{' '}
            <code className="text-teal-300 font-mono">gemma4:e2b</code> model. Detects schedule collisions, extracts critical deadlines, and prioritizes actionable tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onLoadDemoData}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Load Demo Data</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 transition-colors shadow-lg shadow-teal-950"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notice</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Conflict Alert Banner */}
      {directOverlaps.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-200 uppercase tracking-wider">
                Critical Scheduling Collisions Detected ({directOverlaps.length})
              </div>
              <p className="text-xs text-rose-300/90 mt-0.5">
                {directOverlaps[0].explanation}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('conflicts')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/80 hover:bg-rose-800 text-white border border-rose-700 shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <span>Resolve Collisions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Captured Notices */}
        <div
          onClick={() => onNavigateTab('notices')}
          className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Captured Notices</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{notices.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>
              {notices.filter((n) => n.source === 'local_ollama').length} Local ·{' '}
              {notices.filter((n) => n.source === 'sample_demo').length} Demo
            </span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Upcoming Events */}
        <div
          onClick={() => onNavigateTab('notices')}
          className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Upcoming Events</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{upcomingNotices.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Next: {upcomingNotices[0]?.date || 'None'}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Pending Tasks */}
        <div
          onClick={() => onNavigateTab('planner')}
          className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Tasks</span>
            <ListTodo className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{pendingTasks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{completedTasks.length} Completed</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Detected Conflicts */}
        <div
          onClick={() => onNavigateTab('conflicts')}
          className={`p-4 rounded-xl border cursor-pointer transition-all shadow-md group ${
            directOverlaps.length > 0
              ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-700'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Schedule Conflicts</span>
            <AlertTriangle
              className={`w-4 h-4 ${directOverlaps.length > 0 ? 'text-rose-400' : 'text-slate-500'}`}
            />
          </div>
          <div
            className={`text-2xl font-bold font-mono ${
              directOverlaps.length > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {conflicts.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className={directOverlaps.length > 0 ? 'text-rose-300' : ''}>
              {directOverlaps.length} Direct Overlaps
            </span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Upcoming Timeline & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upcoming Events Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                Upcoming Campus Events Timeline
              </h2>
              <p className="text-xs text-slate-400">
                Sorted chronologically by event date and start time
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingNotices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No campus events scheduled yet. Upload a notice to extract events.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingNotices.map((notice) => {
                const hasConflict = conflicts.some(
                  (c) =>
                    (c.noticeA.id === notice.id || c.noticeB.id === notice.id) &&
                    c.type === 'direct_overlap'
                );

                return (
                  <div
                    key={notice.id}
                    onClick={() => onSelectNotice(notice.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                      hasConflict
                        ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                          {notice.date}
                        </span>
                        {notice.startTime && (
                          <span className="text-[11px] font-mono text-slate-300">
                            {notice.startTime} – {notice.endTime || 'End TBD'}
                          </span>
                        )}
                        {hasConflict && (
                          <span className="text-[10px] font-semibold text-rose-400 uppercase bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800/60">
                            Conflict
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                        {notice.eventName || notice.title}
                      </h3>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {notice.venue && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {notice.venue}
                          </span>
                        )}
                        {notice.deadline && (
                          <span className="flex items-center gap-1 text-amber-400 truncate">
                            <Clock className="w-3 h-3 shrink-0" />
                            Deadline: {notice.deadline}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Priority Task List (5 cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-amber-400" />
                Priority Action Items
              </h2>
              <p className="text-xs text-slate-400">
                Extracted tasks requiring student attention
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
            >
              Planner <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No tasks added yet. Upload a notice to generate actions automatically.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-teal-400 hover:text-teal-300 shrink-0"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-xs block truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate block">
                        {task.noticeTitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-medium uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                      task.priority === 'high'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
