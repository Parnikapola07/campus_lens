import React from 'react';
import {
  LayoutDashboard,
  FileText,
  ListTodo,
  AlertTriangle,
  UploadCloud,
  Cpu,
  Laptop,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { OllamaStatus, DetectedConflict } from '../types';

export type NavTab = 'overview' | 'notices' | 'planner' | 'conflicts';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  noticesCount: number;
  tasksCount: number;
  conflicts: DetectedConflict[];
  ollamaStatus: OllamaStatus | null;
  onOpenSetupModal: () => void;
  onLoadDemoData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  noticesCount,
  tasksCount,
  conflicts,
  ollamaStatus,
  onOpenSetupModal,
  onLoadDemoData,
}) => {
  const directOverlaps = conflicts.filter((c) => c.type === 'direct_overlap');

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'notices' as NavTab,
      label: 'My Notices',
      icon: FileText,
      badge: noticesCount > 0 ? noticesCount : null,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'planner' as NavTab,
      label: 'Action Planner',
      icon: ListTodo,
      badge: tasksCount > 0 ? tasksCount : null,
      badgeColor: 'bg-teal-950 text-teal-300 border border-teal-800/40',
    },
    {
      id: 'conflicts' as NavTab,
      label: 'Schedule Conflicts',
      icon: AlertTriangle,
      badge: directOverlaps.length > 0 ? directOverlaps.length : null,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800/60',
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Zone */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-[#0a0f1d]" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-none">
                CampusLens
              </div>
              <div className="text-[10px] text-teal-400 font-medium tracking-wider uppercase mt-1">
                Notice to Next Action
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-950/70 text-teal-300 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Panel */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Quick Demo Data Loader */}
        <button
          onClick={onLoadDemoData}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Load Demo Notices</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">3 Posters</span>
        </button>

        {/* Windows Setup Guide Link */}
        <button
          onClick={onOpenSetupModal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-teal-400" />
            <span>Windows Setup Guide</span>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </button>

        {/* Ollama Connection Indicator Card */}
        <div
          onClick={onOpenSetupModal}
          className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Local Ollama</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                ollamaStatus?.connected ? 'bg-teal-400' : 'bg-amber-400'
              }`}
            />
          </div>

          <div className="text-xs font-mono font-medium text-slate-200 truncate">
            {ollamaStatus?.model || 'gemma4:e2b'}
          </div>

          <div className="text-[10px] text-slate-500 mt-1 truncate">
            {ollamaStatus?.connected ? 'Running on localhost' : 'Click to connect Windows'}
          </div>
        </div>
      </div>
    </aside>
  );
};
