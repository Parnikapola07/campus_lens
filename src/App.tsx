import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ExtractedNotice,
  ActionTask,
  OllamaStatus,
  DetectedConflict
} from './types';
import { SAMPLE_NOTICES, generateInitialTasks } from './data/demoNotices';
import { detectConflicts } from './utils/conflictDetector';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { NoticeUploader } from './components/NoticeUploader';
import { NoticeDetailSplitView } from './components/NoticeDetailSplitView';
import { ActionPlannerView } from './components/ActionPlannerView';
import { ConflictsView } from './components/ConflictsView';
import { WindowsSetupModal } from './components/WindowsSetupModal';
import {
  FileText,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
  Laptop
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [notices, setNotices] = useState<ExtractedNotice[]>(() => {
    // Load from localStorage or initialize with demo notices
    const saved = localStorage.getItem('campuslens_notices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return SAMPLE_NOTICES;
  });

  const [tasks, setTasks] = useState<ActionTask[]>(() => {
    const saved = localStorage.getItem('campuslens_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return generateInitialTasks(SAMPLE_NOTICES);
  });

  const [selectedNoticeId, setSelectedNoticeId] = useState<string>(
    SAMPLE_NOTICES[0]?.id || ''
  );

  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('campuslens_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('campuslens_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Real-time deterministic schedule conflicts
  const conflicts = useMemo(() => {
    return detectConflicts(notices);
  }, [notices]);

  // Selected notice object
  const activeNotice = useMemo(() => {
    return notices.find((n) => n.id === selectedNoticeId) || notices[0] || null;
  }, [notices, selectedNoticeId]);

  // Check Ollama connection status
  const checkOllamaStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/ollama/status');
      if (res.ok) {
        const data = await res.json();
        setOllamaStatus(data);
      } else {
        setOllamaStatus({
          connected: false,
          baseUrl: 'http://localhost:11434',
          model: 'gemma4:e2b',
          availableModels: [],
          error: `Adapter responded with HTTP ${res.status}`,
        });
      }
    } catch (err: unknown) {
      setOllamaStatus({
        connected: false,
        baseUrl: 'http://localhost:11434',
        model: 'gemma4:e2b',
        availableModels: [],
        error: err instanceof Error ? err.message : 'Network error checking Ollama',
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    checkOllamaStatus();
  }, [checkOllamaStatus]);

  const handleUpdateOllamaConfig = async (baseUrl: string, model: string) => {
    try {
      const res = await fetch('/api/ollama/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, model }),
      });
      if (res.ok) {
        await checkOllamaStatus();
      }
    } catch (err) {
      console.error('Failed to update Ollama config:', err);
    }
  };

  const handleNoticeExtracted = (newNotice: ExtractedNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
    setSelectedNoticeId(newNotice.id);

    // Automatically create tasks from extracted actions
    if (newNotice.suggestedActions) {
      const newTasks: ActionTask[] = newNotice.suggestedActions.map((action, idx) => ({
        id: `task-${newNotice.id}-${idx}`,
        noticeId: newNotice.id,
        noticeTitle: newNotice.eventName || newNotice.title || 'Notice',
        title: action,
        dueDate: newNotice.date,
        priority: 'medium',
        category: 'preparation',
        completed: false,
      }));
      setTasks((prev) => [...newTasks, ...prev]);
    }

    setCurrentTab('notices');
    setIsUploadModalOpen(false);
  };

  const handleLoadSample = (sample: ExtractedNotice) => {
    // If not already in notices, add it
    if (!notices.some((n) => n.id === sample.id)) {
      setNotices((prev) => [sample, ...prev]);
    }
    setSelectedNoticeId(sample.id);
    setCurrentTab('notices');
    setIsUploadModalOpen(false);
  };

  const handleLoadDemoData = () => {
    setNotices(SAMPLE_NOTICES);
    setTasks(generateInitialTasks(SAMPLE_NOTICES));
    setSelectedNoticeId(SAMPLE_NOTICES[0].id);
    setCurrentTab('overview');
  };

  const handleUpdateNotice = (updated: ExtractedNotice) => {
    setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setTasks((prev) => prev.filter((t) => t.noticeId !== id));
    if (selectedNoticeId === id) {
      const remaining = notices.filter((n) => n.id !== id);
      if (remaining.length > 0) {
        setSelectedNoticeId(remaining[0].id);
      }
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (newTask: Omit<ActionTask, 'id'>) => {
    const taskWithId: ActionTask = {
      ...newTask,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTasks((prev) => [taskWithId, ...prev]);
  };

  const handleSelectNoticeAndNavigate = (noticeId: string) => {
    setSelectedNoticeId(noticeId);
    setCurrentTab('notices');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            noticesCount={notices.length}
            tasksCount={tasks.length}
            conflicts={conflicts}
            ollamaStatus={ollamaStatus}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
            onLoadDemoData={handleLoadDemoData}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-10 w-72 h-full bg-[#0a0f1d]">
              <Sidebar
                currentTab={currentTab}
                onTabChange={(tab) => {
                  setCurrentTab(tab);
                  setMobileNavOpen(false);
                }}
                noticesCount={notices.length}
                tasksCount={tasks.length}
                conflicts={conflicts}
                ollamaStatus={ollamaStatus}
                onOpenSetupModal={() => {
                  setIsSetupModalOpen(true);
                  setMobileNavOpen(false);
                }}
                onLoadDemoData={() => {
                  handleLoadDemoData();
                  setMobileNavOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentTab={currentTab}
            ollamaStatus={ollamaStatus}
            statusLoading={statusLoading}
            onRefreshStatus={checkOllamaStatus}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onLoadDemoData={handleLoadDemoData}
            onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* VIEW 1: Overview */}
            {currentTab === 'overview' && (
              <OverviewView
                notices={notices}
                conflicts={conflicts}
                tasks={tasks}
                onSelectNotice={handleSelectNoticeAndNavigate}
                onNavigateTab={setCurrentTab}
                onToggleTask={handleToggleTask}
                onLoadDemoData={handleLoadDemoData}
                onOpenUpload={() => setIsUploadModalOpen(true)}
              />
            )}

            {/* VIEW 2: My Notices & Extractor */}
            {currentTab === 'notices' && (
              <div className="space-y-6">
                {/* Notice Uploader Card */}
                <NoticeUploader
                  ollamaStatus={ollamaStatus}
                  onNoticeExtracted={handleNoticeExtracted}
                  onLoadSample={handleLoadSample}
                  onOpenSetupGuide={() => setIsSetupModalOpen(true)}
                />

                {/* Notices Gallery / Carousel Strip */}
                {notices.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        Extracted Notices Gallery ({notices.length})
                      </span>
                      <span>Select a notice below to inspect side-by-side</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {notices.map((n) => {
                        const isSelected = n.id === activeNotice?.id;
                        const isSample = n.source === 'sample_demo';

                        return (
                          <div
                            key={n.id}
                            onClick={() => setSelectedNoticeId(n.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-slate-900 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                                : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                                  isSample
                                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                                    : 'bg-teal-950 text-teal-300 border-teal-800'
                                }`}
                              >
                                {isSample ? 'Sample Demo' : 'Local Ollama'}
                              </span>

                              <span className="text-[11px] font-mono text-slate-400">
                                {n.date || 'Date TBD'}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {n.eventName || n.title}
                            </h4>

                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {n.venue || 'Venue TBD'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Side-by-Side Split View */}
                {activeNotice ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        Side-by-Side Visual Verification Inspector
                      </span>
                    </div>

                    <NoticeDetailSplitView
                      notice={activeNotice}
                      onUpdateNotice={handleUpdateNotice}
                      onDeleteNotice={handleDeleteNotice}
                      onAddTask={handleAddTask}
                    />
                  </div>
                ) : (
                  <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
                    No notices ingested. Upload a notice image or load sample notices above.
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: Action Planner */}
            {currentTab === 'planner' && (
              <ActionPlannerView
                tasks={tasks}
                notices={notices}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                onSelectNotice={handleSelectNoticeAndNavigate}
              />
            )}

            {/* VIEW 4: Schedule Conflicts */}
            {currentTab === 'conflicts' && (
              <ConflictsView
                conflicts={conflicts}
                notices={notices}
                onSelectNotice={handleSelectNoticeAndNavigate}
              />
            )}
          </main>
        </div>
      </div>

      {/* Windows Local Ollama Setup & Configuration Modal */}
      <WindowsSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        status={ollamaStatus}
        onUpdateConfig={handleUpdateOllamaConfig}
        onRefreshStatus={checkOllamaStatus}
      />

      {/* Quick Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">Upload Campus Notice</h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <NoticeUploader
              ollamaStatus={ollamaStatus}
              onNoticeExtracted={handleNoticeExtracted}
              onLoadSample={handleLoadSample}
              onOpenSetupGuide={() => {
                setIsUploadModalOpen(false);
                setIsSetupModalOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
