export type NoticeSource = 'local_ollama' | 'sample_demo';

export interface ExtractedNotice {
  id: string;
  imageUrl: string;
  fileName: string;
  uploadedAt: string;
  source: NoticeSource;
  title: string | null;
  organization: string | null;
  eventName: string | null;
  description: string | null;
  date: string | null; // e.g., '2026-10-18' or formatted date
  startTime: string | null; // e.g., '14:00'
  endTime: string | null; // e.g., '17:00'
  venue: string | null;
  deadline: string | null;
  eligibility: string | null;
  requiredDocuments: string[];
  suggestedActions: string[];
  supportingText: string | null;
  verificationFlags: string[];
  rawModelNotes?: string;
  userVerified?: boolean;
}

export type ConflictType = 'direct_overlap' | 'tight_transition' | 'incomplete_schedule';
export type ConflictSeverity = 'high' | 'medium' | 'low';

export interface ConflictNoticeRef {
  id: string;
  title: string;
  eventName: string;
  date: string;
  timeString: string;
  venue: string;
}

export interface DetectedConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  noticeA: ConflictNoticeRef;
  noticeB: ConflictNoticeRef;
  date: string;
  overlapMinutes?: number;
  overlapWindow?: string;
  explanation: string;
  resolutionRecommendation: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'registration' | 'preparation' | 'submission' | 'attendance' | 'verification';

export interface ActionTask {
  id: string;
  noticeId: string;
  noticeTitle: string;
  title: string;
  dueDate: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  completed: boolean;
  notes?: string;
}

export interface OllamaStatus {
  connected: boolean;
  httpStatus?: number | null;
  statusText?: string;
  baseUrl: string;
  model: string;
  availableModels: string[];
  modelInstalled?: boolean;
  modelReady?: boolean;
  checkedEndpoint?: string;
  latencyMs?: number;
  message?: string;
  error?: string;
  isCloudPreview?: boolean;
  advice?: string;
}
