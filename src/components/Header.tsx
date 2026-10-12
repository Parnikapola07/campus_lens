import React from 'react';
import {
  UploadCloud,
  Layers,
  Laptop,
  Menu,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { OllamaStatus, DetectedConflict } from '../types';
import { OllamaStatusBadge } from './OllamaStatusBadge';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  ollamaStatus: OllamaStatus | null;
  statusLoading: boolean;
  onRefreshStatus: () => void;
  onOpenSetupModal: () => void;
  onOpenUpload: () => void;
  onLoadDemoData: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  ollamaStatus,
  statusLoading,
  onRefreshStatus,
  onOpenSetupModal,
  onOpenUpload,
  onLoadDemoData,
  onToggleMobileNav,
}) => {
  const tabTitles: Record<NavTab, string> = {
    overview: 'Overview & Intelligence Command',
    notices: 'Notice Gallery & Extractor',
    planner: 'Action Planner & Deliverables',
    conflicts: 'Conflict Detection Matrix',
  };

  return (
    <header className="h-16 px-6 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Zone 1: Breadcrumb Trail & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs truncate">
          <span className="font-semibold text-slate-400 hidden sm:inline">CampusLens</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="font-semibold text-white truncate">{tabTitles[currentTab]}</span>
        </div>
      </div>

      {/* Zone 2: Ollama Status Badge + Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Ollama Status pill */}
        <OllamaStatusBadge
          status={ollamaStatus}
          loading={statusLoading}
          onRefresh={onRefreshStatus}
          onOpenSetup={onOpenSetupModal}
        />

        {/* Windows Setup Guide button */}
        <button
          onClick={onOpenSetupModal}
          title="Windows Local Setup Guide"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <Laptop className="w-3.5 h-3.5 text-teal-400" />
          <span>Windows Guide</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors whitespace-nowrap"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Notice</span>
        </button>
      </div>
    </header>
  );
};
