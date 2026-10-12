import { ExtractedNotice, DetectedConflict, ConflictNoticeRef } from '../types';

/**
 * Converts various time formats (e.g. "14:00", "2:00 PM", "9:30 AM", "17:30")
 * to minutes elapsed from midnight (0 - 1439).
 */
export function parseMinutesFromMidnight(timeStr: string | null): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toLowerCase();

  // Match standard 24h format "14:00" or "09:30"
  const match24 = clean.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const mins = parseInt(match24[2], 10);
    return hours * 60 + mins;
  }

  // Match 12h format "2:00 pm", "09:30 am", "2pm", "11:45am"
  const match12 = clean.match(/^([0-1]?[0-9])(?::([0-5][0-9]))?\s*(am|pm)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const mins = match12[2] ? parseInt(match12[2], 10) : 0;
    const meridian = match12[3];

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    return hours * 60 + mins;
  }

  // Fallback: look for embedded time patterns in strings like "Starts at 2:00 PM"
  const embedded = clean.match(/([0-1]?[0-9]):([0-5][0-9])\s*(am|pm)?/);
  if (embedded) {
    let hours = parseInt(embedded[1], 10);
    const mins = parseInt(embedded[2], 10);
    const meridian = embedded[3];
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  return null;
}

/**
 * Formats minute count back to a clean readable 24h and 12h string.
 */
export function formatMinutes(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const meridian = h24 >= 12 ? 'PM' : 'AM';
  return `${h24 < 10 ? `0${h24}` : h24}:${mm} (${h12}:${mm} ${meridian})`;
}

/**
 * Formats duration in human readable hours/minutes.
 */
export function formatDurationMinutes(duration: number): string {
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr`;
  return `${mins} min`;
}

/**
 * Normalizes date strings for comparison.
 */
export function normalizeDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  // Check for YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  // Check for common formats e.g. Oct 18, 2026 or 18/10/2026
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return trimmed.toLowerCase();
}

function buildNoticeRef(notice: ExtractedNotice): ConflictNoticeRef {
  return {
    id: notice.id,
    title: notice.title || notice.eventName || 'Untitled Notice',
    eventName: notice.eventName || notice.title || 'Campus Event',
    date: notice.date || 'Unspecified Date',
    timeString: [notice.startTime, notice.endTime].filter(Boolean).join(' - ') || 'Time Unspecified',
    venue: notice.venue || 'Venue Unspecified',
  };
}

/**
 * Deterministic schedule conflict analysis.
 * Analyzes only concrete facts extracted from notices.
 */
export function detectConflicts(notices: ExtractedNotice[]): DetectedConflict[] {
  const conflicts: DetectedConflict[] = [];

  for (let i = 0; i < notices.length; i++) {
    for (let j = i + 1; j < notices.length; j++) {
      const a = notices[i];
      const b = notices[j];

      // If either notice has no date, we cannot reliably prove an overlap
      if (!a.date || !b.date) continue;

      const dateA = normalizeDate(a.date);
      const dateB = normalizeDate(b.date);

      // Must be on the exact same date
      if (dateA !== dateB) continue;

      const startA = parseMinutesFromMidnight(a.startTime);
      const endA = parseMinutesFromMidnight(a.endTime);
      const startB = parseMinutesFromMidnight(b.startTime);
      const endB = parseMinutesFromMidnight(b.endTime);

      const refA = buildNoticeRef(a);
      const refB = buildNoticeRef(b);

      // Case 1: Both events have complete start and end times
      if (startA !== null && endA !== null && startB !== null && endB !== null) {
        // Direct overlap occurs when StartA < EndB and StartB < EndA
        if (startA < endB && startB < endA) {
          const overlapStartMin = Math.max(startA, startB);
          const overlapEndMin = Math.min(endA, endB);
          const overlapMinutes = overlapEndMin - overlapStartMin;

          if (overlapMinutes > 0) {
            const overlapWindow = `${formatMinutes(overlapStartMin)} to ${formatMinutes(overlapEndMin)}`;
            const durationText = formatDurationMinutes(overlapMinutes);

            const explanation = `Direct time collision on ${a.date}: "${refA.eventName}" (${refA.timeString}) and "${refB.eventName}" (${refB.timeString}) overlap by ${durationText} (from ${overlapWindow}).`;

            let recommendation = `Conflict spans ${durationText}. `;
            if (refA.venue !== refB.venue) {
              recommendation += `Events take place in different locations ("${refA.venue}" vs "${refB.venue}"). You will need to choose one or split attendance with a teammate.`;
            } else {
              recommendation += `Both events are in the same venue ("${refA.venue}"). Check if one session is optional.`;
            }

            conflicts.push({
              id: `conflict-${a.id}-${b.id}`,
              type: 'direct_overlap',
              severity: overlapMinutes >= 60 ? 'high' : 'medium',
              noticeA: refA,
              noticeB: refB,
              date: a.date,
              overlapMinutes,
              overlapWindow,
              explanation,
              resolutionRecommendation: recommendation,
            });
            continue;
          }
        }

        // Case 2: No direct overlap, but tight transition between distinct venues
        const isSeqAB = endA <= startB;
        const isSeqBA = endB <= startA;
        const gap = isSeqAB ? startB - endA : isSeqBA ? startA - endB : -1;

        if (gap >= 0 && gap <= 15 && refA.venue !== refB.venue && refA.venue !== 'Venue Unspecified' && refB.venue !== 'Venue Unspecified') {
          conflicts.push({
            id: `tight-${a.id}-${b.id}`,
            type: 'tight_transition',
            severity: 'low',
            noticeA: refA,
            noticeB: refB,
            date: a.date,
            explanation: `Tight transition on ${a.date}: Only ${gap} minutes between "${refA.eventName}" and "${refB.eventName}".`,
            resolutionRecommendation: `Travel time from "${refA.venue}" to "${refB.venue}" may exceed ${gap} minutes. Plan transit ahead.`,
          });
        }
      } else {
        // Case 3: Both scheduled on the same date, but one or both lack specific start/end times
        const missingDetails: string[] = [];
        if (startA === null || endA === null) missingDetails.push(`"${refA.eventName}"`);
        if (startB === null || endB === null) missingDetails.push(`"${refB.eventName}"`);

        conflicts.push({
          id: `incomplete-${a.id}-${b.id}`,
          type: 'incomplete_schedule',
          severity: 'medium',
          noticeA: refA,
          noticeB: refB,
          date: a.date,
          explanation: `Same-day schedule uncertainty on ${a.date}: Both events are on the same calendar date, but duration or exact timings are missing for ${missingDetails.join(' and ')}.`,
          resolutionRecommendation: 'Review the notice or verify with the organizer to confirm exact timings before assuming availability.',
        });
      }
    }
  }

  return conflicts;
}
