import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  FileText,
  Download,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  Save,
  Tag
} from 'lucide-react';
import { ExtractedNotice, ActionTask } from '../types';

interface NoticeDetailSplitViewProps {
  notice: ExtractedNotice;
  onUpdateNotice: (updated: ExtractedNotice) => void;
  onDeleteNotice: (id: string) => void;
  onAddTask: (task: Omit<ActionTask, 'id'>) => void;
}

export const NoticeDetailSplitView: React.FC<NoticeDetailSplitViewProps> = ({
  notice,
  onUpdateNotice,
  onDeleteNotice,
  onAddTask,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ExtractedNotice>({ ...notice });
  const [saveToast, setSaveToast] = useState(false);

  // Sync formData when notice changes
  React.useEffect(() => {
    setFormData({ ...notice });
    setIsEditing(false);
  }, [notice]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.75), 2.5));
  };

  const handleSave = () => {
    onUpdateNotice({
      ...formData,
      userVerified: true,
    });
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handlePushAllActionsToPlanner = () => {
    if (formData.suggestedActions) {
      formData.suggestedActions.forEach((action) => {
        onAddTask({
          noticeId: formData.id,
          noticeTitle: formData.eventName || formData.title || 'Notice',
          title: action,
          dueDate: formData.date,
          priority: 'medium',
          category: 'preparation',
          completed: false,
        });
      });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Export event as .ics calendar file
  const handleExportICS = () => {
    const title = formData.eventName || formData.title || 'Campus Event';
    const description = `${formData.description || ''}\nVenue: ${formData.venue || 'TBD'}\nOrganized by: ${formData.organization || 'Campus'}`;
    const dateClean = (formData.date || '').replace(/-/g, '');
    const startTimeClean = (formData.startTime || '09:00').replace(/:/g, '') + '00';
    const endTimeClean = (formData.endTime || '10:00').replace(/:/g, '') + '00';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampusLens//Notice Event//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${formData.venue || 'Campus'}`,
      `DTSTART:${dateClean}T${startTimeClean}`,
      `DTEND:${dateClean}T${endTimeClean}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isSample = notice.source === 'sample_demo';

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Bar of the Split View */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
                isSample
                  ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50'
                  : 'bg-teal-950/60 text-teal-300 border-teal-700/50'
              }`}
            >
              {isSample ? (
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Sample Demo Notice
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Local Gemma 4 Inference
                </span>
              )}
            </span>

            {formData.userVerified ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Pending Verification
              </span>
            )}
          </div>

          <span className="text-xs text-slate-500 font-mono hidden md:inline">
            {formData.fileName}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs text-teal-400 font-medium animate-fade-in mr-2">
              Saved successfully!
            </span>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isEditing
                ? 'bg-teal-600 text-white border-teal-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isEditing ? 'Editing Mode Active' : 'Edit Extracted Fields'}
          </button>

          {isEditing && (
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Edits
            </button>
          )}

          <button
            onClick={handleExportICS}
            title="Download .ics calendar event"
            className="p-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteNotice(notice.id)}
            title="Delete this notice"
            className="p-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Body: Left = Image Viewer, Right = Extracted Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Notice Image Viewer */}
        <div className="lg:col-span-5 bg-[#080d1a] border-b lg:border-b-0 lg:border-r border-slate-800 p-4 flex flex-col justify-between relative group">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 text-xs text-slate-400">
            <span>Original Captured Notice</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-300 px-1">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.25)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 ml-1"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Zoomable Image Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto p-4 max-h-[580px] select-none">
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className="transition-transform duration-150 ease-out max-w-full"
            >
              <img
                src={notice.imageUrl}
                alt={notice.title || 'Notice Image'}
                className="rounded-lg shadow-xl border border-slate-700/80 max-h-[500px] object-contain w-auto mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Model Confidence / Extraction Note */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-300 font-medium">Model Inference Notes: </span>
              {formData.rawModelNotes || 'Processed via Gemma 4 vision parser.'}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Extracted Information */}
        <div className="lg:col-span-7 p-6 overflow-y-auto max-h-[700px] space-y-5 bg-[#0f172a]">
          {/* Notice Title & Organization Header */}
          <div className="space-y-2">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Notice Headline
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-semibold focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={formData.eventName || ''}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">
                      Organization / Faculty
                    </label>
                    <input
                      type="text"
                      value={formData.organization || ''}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                  {formData.organization || 'Campus Announcement'}
                </div>
                <h1 className="text-xl font-bold text-white mt-0.5">
                  {formData.eventName || formData.title || 'Untitled Event'}
                </h1>
                {formData.title && formData.eventName !== formData.title && (
                  <p className="text-xs text-slate-400 mt-0.5">{formData.title}</p>
                )}
              </div>
            )}

            {/* Description */}
            {isEditing ? (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {formData.description || 'No description provided in notice.'}
              </p>
            )}
          </div>

          {/* Schedule Grid: Date, Time, Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            {/* Date */}
            <div>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Event Date</span>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:border-teal-500"
                />
              ) : (
                <div className="text-sm font-semibold text-white font-mono">
                  {formData.date || <span className="text-rose-400 font-normal text-xs">Missing Date</span>}
                </div>
              )}
            </div>

            {/* Timing */}
            <div>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Timing</span>
              </div>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="14:00"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-16 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                  <span className="text-slate-500">-</span>
                  <input
                    type="text"
                    placeholder="17:00"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-16 px-1.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono"
                  />
                </div>
              ) : (
                <div className="text-sm font-semibold text-white font-mono">
                  {formData.startTime ? (
                    `${formData.startTime} – ${formData.endTime || 'End TBD'}`
                  ) : (
                    <span className="text-amber-400 font-normal text-xs">Timing not specified</span>
                  )}
                </div>
              )}
            </div>

            {/* Venue */}
            <div>
              <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Venue / Location</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.venue || ''}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white focus:border-teal-500"
                />
              ) : (
                <div className="text-xs font-medium text-slate-200">
                  {formData.venue || <span className="text-slate-500 italic">No venue listed</span>}
                </div>
              )}
            </div>
          </div>

          {/* Registration / Submission Deadline */}
          <div className="p-3.5 rounded-lg bg-[#0b132b] border border-amber-500/20 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-semibold text-amber-300 block">
                Registration / Submission Deadline
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.deadline || ''}
                  placeholder="e.g., 2026-10-16 23:59"
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:border-teal-500"
                />
              ) : (
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  {formData.deadline || 'No registration deadline stated (open attendance)'}
                </div>
              )}
            </div>
          </div>

          {/* Eligibility & Required Items */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-teal-400" />
              Eligibility &amp; Required Documents
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-2">
              <div>
                <span className="text-slate-400 font-medium">Eligibility Criteria: </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.eligibility || ''}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                  />
                ) : (
                  <span className="text-slate-200">{formData.eligibility || 'Open to all students'}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-medium block mb-1">Required Items / Clearances:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.requiredDocuments && formData.requiredDocuments.length > 0 ? (
                    formData.requiredDocuments.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200"
                      >
                        • {doc}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None specifically stated</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Next Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-teal-400" />
                Extracted Action Items
              </span>
              <button
                onClick={handlePushAllActionsToPlanner}
                className="text-xs text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1"
              >
                + Add All to Action Planner
              </button>
            </div>

            <div className="space-y-1.5">
              {formData.suggestedActions && formData.suggestedActions.length > 0 ? (
                formData.suggestedActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 group hover:border-slate-700 transition-colors"
                  >
                    <span>{action}</span>
                    <button
                      onClick={() =>
                        onAddTask({
                          noticeId: formData.id,
                          noticeTitle: formData.eventName || formData.title || 'Notice',
                          title: action,
                          dueDate: formData.date,
                          priority: 'medium',
                          category: 'preparation',
                          completed: false,
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded text-[11px] bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900 transition-all shrink-0 ml-2"
                    >
                      + Add task
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic p-2 bg-slate-900/40 rounded">
                  No automated actions extracted.
                </div>
              )}
            </div>
          </div>

          {/* Verification Warning Flags Banner */}
          {formData.verificationFlags && formData.verificationFlags.length > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Fields Requiring Verification</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {formData.verificationFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
              <div className="pt-1 text-[11px] text-amber-300/80">
                Double-check these points with your faculty or peer group before committing.
              </div>
            </div>
          )}

          {/* Supporting Text */}
          {formData.supportingText && (
            <div className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-lg text-xs text-slate-400">
              <span className="font-medium text-slate-300">Additional Notes: </span>
              {formData.supportingText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
