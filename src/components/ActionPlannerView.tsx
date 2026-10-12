import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  Filter,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  Download
} from 'lucide-react';
import { ActionTask, TaskPriority, TaskCategory, ExtractedNotice } from '../types';

interface ActionPlannerViewProps {
  tasks: ActionTask[];
  notices: ExtractedNotice[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<ActionTask, 'id'>) => void;
  onSelectNotice: (noticeId: string) => void;
}

export const ActionPlannerView: React.FC<ActionPlannerViewProps> = ({
  tasks,
  notices,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onSelectNotice,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newNoticeId, setNewNoticeId] = useState<string>(notices[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('preparation');

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'pending' && t.completed) return false;
    if (statusFilter === 'completed' && !t.completed) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const linkedNotice = notices.find((n) => n.id === newNoticeId);

    onAddTask({
      noticeId: newNoticeId || 'manual',
      noticeTitle: linkedNotice ? (linkedNotice.eventName || linkedNotice.title || 'Notice') : 'Custom Task',
      title: newTitle.trim(),
      dueDate: newDueDate || null,
      priority: newPriority,
      category: newCategory,
      completed: false,
    });

    setNewTitle('');
    setNewDueDate('');
    setIsAddingTask(false);
  };

  const handleExportMarkdown = () => {
    const lines = [
      '# CampusLens Action Checklist',
      `Generated on ${new Date().toLocaleDateString()}`,
      `Total Tasks: ${tasks.length} | Completed: ${completedCount}`,
      '',
      '## Tasks',
      ...tasks.map(
        (t) =>
          `- [${t.completed ? 'x' : ' '}] **${t.title}** (Priority: ${t.priority.toUpperCase()}${
            t.dueDate ? `, Due: ${t.dueDate}` : ''
          }) — Sourced from: ${t.noticeTitle}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusLens_Checklist_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-teal-400" />
            Action Planner &amp; Task Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Convert extracted circulars into prioritized student deliverables, registrations, and submission tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Checklist (.md)
          </button>

          <button
            onClick={() => setIsAddingTask(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Action Item
          </button>
        </div>
      </div>

      {/* Progress & Quick Filters Strip */}
      <div className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Action Completion Rate:</span>
            <span className="text-xs font-mono font-semibold text-teal-400">
              {completedCount} of {tasks.length} ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-slate-800 text-teal-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-slate-800 text-emerald-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-300"
          />
        </div>

        {/* Secondary Category & Priority Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="registration">Registration</option>
              <option value="preparation">Preparation</option>
              <option value="submission">Submission</option>
              <option value="attendance">Attendance</option>
              <option value="verification">Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Task Modal / Inline Drawer */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="p-5 bg-[#0f172a] border border-teal-500/40 rounded-xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">Create New Action Task</h3>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Task Title / Action</label>
              <input
                type="text"
                required
                placeholder="e.g., Collect physical hall ticket before deadline"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Linked Notice</label>
                <select
                  value={newNoticeId}
                  onChange={(e) => setNewNoticeId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                >
                  <option value="">(No specific notice)</option>
                  {notices.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.eventName || n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400">
          No tasks found matching your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isHigh = task.priority === 'high';

            return (
              <div
                key={task.id}
                className={`p-3.5 bg-[#0f172a] border rounded-xl flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'border-slate-800/60 opacity-60 bg-slate-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Left: Checkbox + Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="text-teal-400 hover:text-teal-300 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-teal-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs font-medium block truncate ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {/* Meta info unboxed with · separators (Anti-slop zero pill rule) */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                      {task.noticeId && task.noticeId !== 'manual' ? (
                        <button
                          onClick={() => onSelectNotice(task.noticeId)}
                          className="hover:text-teal-300 hover:underline flex items-center gap-1 truncate text-slate-400"
                        >
                          <span>{task.noticeTitle}</span>
                        </button>
                      ) : (
                        <span>Custom Task</span>
                      )}

                      {task.dueDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {task.dueDate}
                          </span>
                        </>
                      )}

                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Priority tag & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded border ${
                      isHigh
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800/40'
                        : task.priority === 'medium'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
