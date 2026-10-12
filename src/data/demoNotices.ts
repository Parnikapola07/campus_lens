import { ExtractedNotice, ActionTask } from '../types';

// Authentic SVG Poster 1: HackSprint 2026
const HACKATHON_POSTER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <linearGradient id="bgGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%230b132b"/>
      <stop offset="50%" stop-color="%231c2541"/>
      <stop offset="100%" stop-color="%230b132b"/>
    </linearGradient>
    <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="%230d9488"/>
      <stop offset="100%" stop-color="%2314b8a6"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1100" fill="url(%23bgGrad1)"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="%23334155" stroke-width="2" rx="16"/>
  
  <!-- Header Banner -->
  <text x="70" y="90" font-family="sans-serif" font-size="14" font-weight="700" fill="%2314b8a6" letter-spacing="3">DEPARTMENT OF COMPUTER SCIENCE &amp; ACM CHAPTER</text>
  <text x="70" y="115" font-family="sans-serif" font-size="12" fill="%2394a3b8">CAMPUS BULLETIN // CIRCULAR NO: CS/2026/OCT-08</text>
  
  <!-- Title -->
  <text x="70" y="210" font-family="sans-serif" font-size="52" font-weight="900" fill="%23ffffff">HACKSPRINT</text>
  <text x="70" y="270" font-family="sans-serif" font-size="52" font-weight="900" fill="%2314b8a6">2026</text>
  
  <rect x="70" y="300" width="660" height="4" fill="url(%23tealGrad)"/>
  
  <text x="70" y="345" font-family="sans-serif" font-size="20" font-weight="600" fill="%23e2e8f0">Annual 24-Hour Campus Innovation Hackathon</text>
  <text x="70" y="380" font-family="sans-serif" font-size="15" fill="%2394a3b8">Build AI, Cloud &amp; Web applications to solve real campus challenges.</text>
  
  <!-- Key Dates Box -->
  <rect x="70" y="420" width="660" height="180" fill="%231e293b" rx="12" stroke="%23475569" stroke-width="1"/>
  
  <text x="100" y="465" font-family="sans-serif" font-size="13" font-weight="700" fill="%2314b8a6">KEYNOTE &amp; OPENING CEREMONY</text>
  <text x="100" y="505" font-family="sans-serif" font-size="28" font-weight="800" fill="%23ffffff">Sunday, October 18, 2026</text>
  <text x="100" y="545" font-family="sans-serif" font-size="18" font-weight="600" fill="%23cbd5e1">14:00 – 17:00 (2:00 PM – 5:00 PM)</text>
  <text x="100" y="575" font-family="sans-serif" font-size="15" fill="%2394a3b8">Venue: Main Auditorium, Engineering Block B</text>

  <!-- Requirements Grid -->
  <rect x="70" y="630" width="315" height="190" fill="%23111827" rx="8" stroke="%23374151" stroke-width="1"/>
  <text x="95" y="665" font-family="sans-serif" font-size="14" font-weight="700" fill="%23f59e0b">REGISTRATION DEADLINE</text>
  <text x="95" y="700" font-family="sans-serif" font-size="18" font-weight="700" fill="%23ffffff">Oct 16, 2026 · 23:59</text>
  <text x="95" y="735" font-family="sans-serif" font-size="13" fill="%2394a3b8">Devpost portal closes strictly</text>
  <text x="95" y="760" font-family="sans-serif" font-size="13" fill="%2394a3b8">Teams of 2 to 4 students</text>
  <text x="95" y="795" font-family="sans-serif" font-size="13" font-weight="600" fill="%23cbd5e1">Fee: Free for enrolled students</text>

  <rect x="415" y="630" width="315" height="190" fill="%23111827" rx="8" stroke="%23374151" stroke-width="1"/>
  <text x="440" y="665" font-family="sans-serif" font-size="14" font-weight="700" fill="%2338bdf8">ELIGIBILITY &amp; ITEMS</text>
  <text x="440" y="700" font-family="sans-serif" font-size="15" font-weight="600" fill="%23ffffff">All Undergrad &amp; Grad Years</text>
  <text x="440" y="735" font-family="sans-serif" font-size="13" fill="%2394a3b8">• Valid Campus Physical ID Card</text>
  <text x="440" y="760" font-family="sans-serif" font-size="13" fill="%2394a3b8">• Laptop with charger &amp; GitHub ID</text>
  <text x="440" y="785" font-family="sans-serif" font-size="13" fill="%2394a3b8">• Discord RSVP confirmation code</text>

  <!-- Next Actions Callout -->
  <rect x="70" y="850" width="660" height="150" fill="%230f172a" rx="10" stroke="%231e293b"/>
  <text x="100" y="885" font-family="sans-serif" font-size="14" font-weight="700" fill="%2314b8a6">REQUIRED ACTIONS FOR PARTICIPANTS</text>
  <text x="100" y="915" font-family="sans-serif" font-size="14" fill="%23e2e8f0">1. Register team on Devpost portal before Oct 16 midnight</text>
  <text x="100" y="942" font-family="sans-serif" font-size="14" fill="%23e2e8f0">2. Join official Discord server for problem statement briefing</text>
  <text x="100" y="969" font-family="sans-serif" font-size="14" fill="%23e2e8f0">3. Check-in at Block B Auditorium at 13:30 for badge distribution</text>

  <!-- Footer -->
  <text x="70" y="1035" font-family="sans-serif" font-size="12" fill="%2364748b">Queries: acm-student@campus.edu · Dean of Student Affairs Office Approved</text>
</svg>`;

// Authentic SVG Poster 2: Design Thinking Essentials (CONCURRENT CONFLICT WITH HACKSPRINT!)
const DESIGN_WORKSHOP_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <linearGradient id="bgGrad2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%231e1b4b"/>
      <stop offset="50%" stop-color="%23312e81"/>
      <stop offset="100%" stop-color="%231e1b4b"/>
    </linearGradient>
    <linearGradient id="amberGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="%23f59e0b"/>
      <stop offset="100%" stop-color="%23fbbf24"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1100" fill="url(%23bgGrad2)"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="%234338ca" stroke-width="2" rx="16"/>
  
  <!-- Header -->
  <text x="70" y="90" font-family="sans-serif" font-size="14" font-weight="700" fill="%23fbbf24" letter-spacing="3">DESIGN INNOVATION LAB &amp; GDG ON-CAMPUS</text>
  <text x="70" y="115" font-family="sans-serif" font-size="12" fill="%23c7d2fe">INTERACTIVE WORKSHOP SERIES // SESSION 04</text>
  
  <!-- Title -->
  <text x="70" y="210" font-family="sans-serif" font-size="46" font-weight="900" fill="%23ffffff">DESIGN THINKING</text>
  <text x="70" y="265" font-family="sans-serif" font-size="46" font-weight="900" fill="%23fbbf24">ESSENTIALS</text>
  
  <rect x="70" y="295" width="660" height="4" fill="url(%23amberGrad)"/>
  
  <text x="70" y="340" font-family="sans-serif" font-size="19" font-weight="600" fill="%23e0e7ff">Human-Centered Product &amp; UI/UX Prototyping</text>
  <text x="70" y="375" font-family="sans-serif" font-size="15" fill="%23c7d2fe">Hands-on fast sprint: Empathize, Define, Ideate, Prototype in Figma.</text>
  
  <!-- Schedule Box (SAME DATE OCT 18, 15:00 - 17:30 => 2 HR CONFLICT WITH HACKSPRINT!) -->
  <rect x="70" y="420" width="660" height="180" fill="%231e1e38" rx="12" stroke="%236366f1" stroke-width="1.5"/>
  
  <text x="100" y="465" font-family="sans-serif" font-size="13" font-weight="700" fill="%23fbbf24">HANDS-ON LAB SCHEDULE</text>
  <text x="100" y="505" font-family="sans-serif" font-size="28" font-weight="800" fill="%23ffffff">Sunday, October 18, 2026</text>
  <text x="100" y="545" font-family="sans-serif" font-size="18" font-weight="700" fill="%23f87171">15:00 – 17:30 (3:00 PM – 5:30 PM)</text>
  <text x="100" y="575" font-family="sans-serif" font-size="15" fill="%23c7d2fe">Venue: Design Studio Room 304, Media Wing</text>

  <!-- Requirements -->
  <rect x="70" y="630" width="315" height="190" fill="%2318182b" rx="8" stroke="%233730a3" stroke-width="1"/>
  <text x="95" y="665" font-family="sans-serif" font-size="14" font-weight="700" fill="%23f59e0b">SEAT CAPACITY &amp; RSVP</text>
  <text x="95" y="700" font-family="sans-serif" font-size="18" font-weight="700" fill="%23ffffff">Strict Limit: 40 Seats</text>
  <text x="95" y="735" font-family="sans-serif" font-size="13" fill="%23c7d2fe">RSVP Deadline: Oct 17 · 18:00</text>
  <text x="95" y="760" font-family="sans-serif" font-size="13" fill="%23c7d2fe">First-come first-served entry</text>
  <text x="95" y="795" font-family="sans-serif" font-size="13" font-weight="600" fill="%23a5b4fc">Certificate provided on finish</text>

  <rect x="415" y="630" width="315" height="190" fill="%2318182b" rx="8" stroke="%233730a3" stroke-width="1"/>
  <text x="440" y="665" font-family="sans-serif" font-size="14" font-weight="700" fill="%2338bdf8">PREREQUISITES</text>
  <text x="440" y="700" font-family="sans-serif" font-size="15" font-weight="600" fill="%23ffffff">All Majors Welcome</text>
  <text x="440" y="735" font-family="sans-serif" font-size="13" fill="%23c7d2fe">• Personal Laptop with Figma app</text>
  <text x="440" y="760" font-family="sans-serif" font-size="13" fill="%23c7d2fe">• Active Figma Education account</text>
  <text x="440" y="785" font-family="sans-serif" font-size="13" fill="%23c7d2fe">• Sketchbook / ballpoint pen</text>

  <!-- Instructions -->
  <rect x="70" y="850" width="660" height="150" fill="%23141428" rx="10" stroke="%23312e81"/>
  <text x="100" y="885" font-family="sans-serif" font-size="14" font-weight="700" fill="%23fbbf24">MANDATORY PRE-WORKSHOP ACTIONS</text>
  <text x="100" y="915" font-family="sans-serif" font-size="14" fill="%23e0e7ff">1. Reserve seat in GDG portal before Oct 17, 18:00</text>
  <text x="100" y="942" font-family="sans-serif" font-size="14" fill="%23e0e7ff">2. Download Figma Desktop App prior to coming to campus</text>
  <text x="100" y="969" font-family="sans-serif" font-size="14" fill="%23e0e7ff">3. Bring laptop fully charged (limited studio power sockets)</text>

  <!-- Footer -->
  <text x="70" y="1035" font-family="sans-serif" font-size="12" fill="%23818cf8">Organized by Design Innovation Lab · Media Wing 3rd Floor</text>
</svg>`;

// Authentic SVG Poster 3: Examination Notice CS-302
const EXAM_NOTICE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <linearGradient id="bgGrad3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%230f172a"/>
      <stop offset="50%" stop-color="%231e293b"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1100" fill="url(%23bgGrad3)"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="%2364748b" stroke-width="2" rx="16"/>
  
  <!-- University Seal Header -->
  <text x="70" y="90" font-family="serif" font-size="15" font-weight="700" fill="%2394a3b8" letter-spacing="2">OFFICE OF THE CONTROLLER OF EXAMINATIONS</text>
  <text x="70" y="115" font-family="sans-serif" font-size="12" fill="%2364748b">OFFICIAL NOTIFICATION // REF: COE/MIDTERM/FALL-26/089</text>
  
  <!-- Title -->
  <text x="70" y="195" font-family="serif" font-size="38" font-weight="700" fill="%23f1f5f9">MID-TERM EXAMINATION</text>
  <text x="70" y="245" font-family="sans-serif" font-size="28" font-weight="700" fill="%2338bdf8">CS-302: COMPUTER NETWORKS</text>
  
  <rect x="70" y="275" width="660" height="3" fill="%2338bdf8"/>
  
  <text x="70" y="320" font-family="sans-serif" font-size="16" fill="%23cbd5e1">B.Tech / B.S. Computer Science &amp; Engineering — Semester V</text>
  
  <!-- Exam Slot Box -->
  <rect x="70" y="360" width="660" height="180" fill="%231e293b" rx="10" stroke="%23475569" stroke-width="1"/>
  
  <text x="100" y="405" font-family="sans-serif" font-size="13" font-weight="700" fill="%2338bdf8">EXAMINATION SCHEDULE &amp; TIME SLOT</text>
  <text x="100" y="445" font-family="sans-serif" font-size="28" font-weight="800" fill="%23ffffff">Thursday, October 22, 2026</text>
  <text x="100" y="485" font-family="sans-serif" font-size="18" font-weight="600" fill="%23e2e8f0">09:30 – 12:30 (Morning Session · 3 Hours)</text>
  <text x="100" y="515" font-family="sans-serif" font-size="15" fill="%2394a3b8">Venue: Examination Hall 4A, Central Examination Complex</text>

  <!-- Clearances & Deadlines -->
  <rect x="70" y="570" width="315" height="210" fill="%23111827" rx="8" stroke="%23374151" stroke-width="1"/>
  <text x="95" y="605" font-family="sans-serif" font-size="14" font-weight="700" fill="%23ef4444">HALL TICKET DEADLINE</text>
  <text x="95" y="640" font-family="sans-serif" font-size="18" font-weight="700" fill="%23ffffff">Oct 20, 2026 · 17:00</text>
  <text x="95" y="675" font-family="sans-serif" font-size="13" fill="%2394a3b8">Physical hall ticket collection</text>
  <text x="95" y="700" font-family="sans-serif" font-size="13" fill="%2394a3b8">from Dept. Admin Window #3</text>
  <text x="95" y="735" font-family="sans-serif" font-size="13" font-weight="600" fill="%23f87171">No digital copies accepted!</text>
  <text x="95" y="760" font-family="sans-serif" font-size="12" fill="%2364748b">Late fee applies after 17:00</text>

  <rect x="415" y="570" width="315" height="210" fill="%23111827" rx="8" stroke="%23374151" stroke-width="1"/>
  <text x="440" y="605" font-family="sans-serif" font-size="14" font-weight="700" fill="%23f59e0b">MANDATORY PROTOCOLS</text>
  <text x="440" y="640" font-family="sans-serif" font-size="15" font-weight="600" fill="%23ffffff">Minimum 75% Attendance</text>
  <text x="440" y="675" font-family="sans-serif" font-size="13" fill="%2394a3b8">• Printed Physical Hall Ticket</text>
  <text x="440" y="700" font-family="sans-serif" font-size="13" fill="%2394a3b8">• University Photo Identity Card</text>
  <text x="440" y="725" font-family="sans-serif" font-size="13" fill="%2394a3b8">• Non-programmable calculator</text>
  <text x="440" y="750" font-family="sans-serif" font-size="13" fill="%23ef4444">• Smart devices strictly prohibited</text>

  <!-- Instructions -->
  <rect x="70" y="810" width="660" height="150" fill="%230f172a" rx="10" stroke="%23334155"/>
  <text x="100" y="845" font-family="sans-serif" font-size="14" font-weight="700" fill="%2338bdf8">ACTION ITEMS FOR CANDIDATES</text>
  <text x="100" y="875" font-family="sans-serif" font-size="14" fill="%23e2e8f0">1. Verify attendance eligibility with CS Department Coordinator</text>
  <text x="100" y="902" font-family="sans-serif" font-size="14" fill="%23e2e8f0">2. Collect and laminate physical hall ticket before Oct 20, 17:00</text>
  <text x="100" y="929" font-family="sans-serif" font-size="14" fill="%23e2e8f0">3. Arrive at Hall 4A by 09:00 AM (doors seal at 09:20 AM)</text>

  <!-- Footer -->
  <text x="70" y="1015" font-family="sans-serif" font-size="12" fill="%2364748b">Issued by Controller of Examinations · Approved by Academic Council</text>
</svg>`;

export const SAMPLE_NOTICES: ExtractedNotice[] = [
  {
    id: 'demo-notice-1',
    imageUrl: HACKATHON_POSTER_SVG,
    fileName: 'HackSprint_2026_Flyer.png',
    uploadedAt: '2026-10-12T00:00:00.000Z',
    source: 'sample_demo',
    title: 'HackSprint 2026 — Annual 24-Hour Campus Hackathon',
    organization: 'Department of Computer Science & ACM Chapter',
    eventName: 'HackSprint 2026 Opening & Keynote Ceremony',
    description: 'Annual flagship student hackathon bringing multidisciplinary teams together to build AI and Cloud applications for campus challenges.',
    date: '2026-10-18',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Main Auditorium, Engineering Block B',
    deadline: '2026-10-16 23:59',
    eligibility: 'All enrolled undergraduate and postgraduate students from all faculties',
    requiredDocuments: [
      'Physical Student ID Card',
      'Laptop with power adapter',
      'GitHub Account username',
      'Devpost confirmation email',
    ],
    suggestedActions: [
      'Form team of 2-4 and submit registration on Devpost portal before Oct 16',
      'Join official Discord server for problem track announcements',
      'Collect registration badge at Block B Auditorium lobby at 13:30',
    ],
    supportingText: 'Free admission for verified campus students. Mentors from Google Cloud and local startups present.',
    verificationFlags: [
      'Verify if team member cross-faculty eligibility requires separate approval',
    ],
    rawModelNotes: 'High clarity poster. Date, times, and venue confidently recognized.',
    userVerified: true,
  },
  {
    id: 'demo-notice-2',
    imageUrl: DESIGN_WORKSHOP_SVG,
    fileName: 'Design_Thinking_Workshop_Poster.png',
    uploadedAt: '2026-10-12T00:01:00.000Z',
    source: 'sample_demo',
    title: 'Design Thinking Essentials — UI/UX Product Sprint',
    organization: 'Design Innovation Lab & GDG On-Campus',
    eventName: 'Design Thinking Essentials Hands-on Workshop',
    description: 'Intensive practical session covering user research, low-fidelity wireframing, and Figma prototyping for digital student services.',
    date: '2026-10-18', // Intentionally overlaps with HackSprint on Oct 18!
    startTime: '15:00', // 15:00 - 17:30 overlaps with 14:00 - 17:00 by 2 full hours!
    endTime: '17:30',
    venue: 'Design Studio Room 304, Media Wing',
    deadline: '2026-10-17 18:00',
    eligibility: 'Strictly capped at 40 participants; priority to beginner & intermediate designers',
    requiredDocuments: [
      'Laptop with Figma desktop app installed',
      'Figma student education account active',
      'Drawing pad or notebook with pen',
    ],
    suggestedActions: [
      'Reserve workshop seat on GDG community portal before Oct 17, 18:00',
      'Pre-install Figma desktop client before attending (campus Wi-Fi bandwidth limits)',
      'Review pre-reading design sprint PDF sent via RSVP email',
    ],
    supportingText: 'Interactive Figma component kits and completion certificate provided.',
    verificationFlags: [
      'Seat limit is 40 participants; confirm if waitlist auto-converts',
    ],
    rawModelNotes: 'Overlaps directly with HackSprint on 2026-10-18 from 15:00 to 17:00.',
    userVerified: true,
  },
  {
    id: 'demo-notice-3',
    imageUrl: EXAM_NOTICE_SVG,
    fileName: 'Exam_Circular_CS302_Midterm.png',
    uploadedAt: '2026-10-12T00:02:00.000Z',
    source: 'sample_demo',
    title: 'Mid-Term Examination Notice — CS-302 Computer Networks',
    organization: 'Office of the Controller of Examinations',
    eventName: 'Mid-Term Exam CS-302',
    description: 'Official academic mid-semester examination covering TCP/IP protocol stack, routing algorithms, and network transport layer.',
    date: '2026-10-22',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Examination Hall 4A, Central Examination Complex',
    deadline: '2026-10-20 17:00',
    eligibility: 'Enrolled CS-302 Semester V students with >=75% course attendance',
    requiredDocuments: [
      'Physical printed Hall Ticket with seal',
      'University Photo Identity Card',
      'Non-programmable scientific calculator (approved list)',
      'Black/Blue ballpoint pens',
    ],
    suggestedActions: [
      'Verify course attendance record with CS department office',
      'Collect physical stamped hall ticket from Admin Window #3 before Oct 20, 17:00',
      'Arrive at Examination Hall 4A 30 minutes early (doors close at 09:20)',
    ],
    supportingText: 'Zero tolerance for unauthorized electronic devices or smartwatch wearables.',
    verificationFlags: [
      'Check if medical leave certificate clears borderline attendance before Oct 18',
    ],
    rawModelNotes: 'Official academic notice. Date 2026-10-22 09:30-12:30 recognized.',
    userVerified: true,
  },
];

export function generateInitialTasks(notices: ExtractedNotice[]): ActionTask[] {
  const tasks: ActionTask[] = [];

  notices.forEach((notice) => {
    // Generate tasks from deadline
    if (notice.deadline) {
      tasks.push({
        id: `task-deadline-${notice.id}`,
        noticeId: notice.id,
        noticeTitle: notice.eventName || notice.title || 'Notice',
        title: `Submit / Register before deadline: ${notice.deadline}`,
        dueDate: notice.deadline.split(' ')[0] || notice.date,
        priority: 'high',
        category: 'registration',
        completed: false,
        notes: `Extracted from notice: ${notice.title}`,
      });
    }

    // Generate tasks from suggested actions
    notice.suggestedActions.forEach((action, idx) => {
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let category: ActionTask['category'] = 'preparation';

      const lower = action.toLowerCase();
      if (lower.includes('register') || lower.includes('portal') || lower.includes('rsvp')) {
        priority = 'high';
        category = 'registration';
      } else if (lower.includes('hall ticket') || lower.includes('badge') || lower.includes('id card')) {
        priority = 'high';
        category = 'verification';
      } else if (lower.includes('install') || lower.includes('laptop') || lower.includes('figma')) {
        priority = 'medium';
        category = 'preparation';
      } else if (lower.includes('attend') || lower.includes('arrive') || lower.includes('check-in')) {
        priority = 'medium';
        category = 'attendance';
      }

      tasks.push({
        id: `task-${notice.id}-${idx}`,
        noticeId: notice.id,
        noticeTitle: notice.eventName || notice.title || 'Notice',
        title: action,
        dueDate: notice.date,
        priority,
        category,
        completed: idx === 0 && notice.id === 'demo-notice-1', // leave one done as example
        notes: `Sourced from: ${notice.organization || 'Notice'}`,
      });
    });

    // Generate task for verification flag if exists
    if (notice.verificationFlags && notice.verificationFlags.length > 0) {
      tasks.push({
        id: `task-verify-${notice.id}`,
        noticeId: notice.id,
        noticeTitle: notice.eventName || notice.title || 'Notice',
        title: `Verify prerequisite: ${notice.verificationFlags[0]}`,
        dueDate: notice.date,
        priority: 'medium',
        category: 'verification',
        completed: false,
        notes: 'Flagged for student manual confirmation',
      });
    }
  });

  return tasks;
}
