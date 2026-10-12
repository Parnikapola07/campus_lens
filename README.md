# CampusLens — From Notice to Next Action

> Transform visual campus event posters, examination announcements, workshop notices, and registration forms into structured events, conflict-free schedules, and actionable tasks using local **Ollama** (`gemma4:e2b`).

CampusLens is a full-stack student dashboard engineered for privacy and zero cloud AI lock-in. Visual notices are processed entirely on your local machine using Gemma vision models running via Ollama.

---

## Key Features

1. **Local Vision AI Ingestion**
   - Direct integration with local Ollama chat API (`http://localhost:11434/api/chat`) using `gemma4:e2b`.
   - Sends base64 image data directly to Gemma vision for structured extraction without cloud API keys.
   - Fallback and diagnostic indicators explaining connection status and troubleshooting.

2. **Side-by-Side Verification Inspector**
   - View the original captured notice next to the extracted structured data.
   - Zoom in/out and full image pan.
   - Inline editing for notice title, organization, dates, timings, venues, deadlines, and eligibility criteria.
   - One-click iCalendar (`.ics`) export for Google Calendar / Apple Calendar.

3. **Deterministic Conflict Detection Engine**
   - Strict programmatic evaluation of dates and time intervals (no AI hallucinations).
   - Computes exact overlap intervals (e.g. "120 min overlap from 15:00 to 17:00").
   - Evaluates venue transition constraints (e.g., tight travel times between campus wings).
   - Flags missing or incomplete timings for manual verification.

4. **Action Planner Pipeline**
   - Automatically generates prioritized tasks from notice deadlines, eligibility criteria, and instructions.
   - Categorized by Registration, Preparation, Submission, Attendance, and Verification.
   - Interactive completion tracking with progress metrics.
   - Export actionable checklists to Markdown (`.md`).

5. **Demo Mode with Pre-configured Schedule Collisions**
   - 3 pre-built authentic campus notices (HackSprint 2026, Design Thinking Sprint, CS-302 Exam Schedule).
   - HackSprint 2026 and Design Thinking Sprint take place on October 18, 2026 with a direct 2-hour collision (15:00 - 17:00), allowing instant testing of the conflict detector.

---

## Windows Setup & Local Execution Guide

CampusLens runs full-stack locally on your Windows laptop. Follow these steps:

### Prerequisites
- Windows 10/11
- [Node.js](https://nodejs.org/) (version 18+ or 20+ LTS recommended)
- [Ollama for Windows](https://ollama.com/download/windows) installed and running

---

### Step 1: Start Ollama and Verify `gemma4:e2b`

Open PowerShell or Command Prompt on your Windows laptop and run:

```powershell
# Pull the model if not already downloaded
ollama pull gemma4:e2b

# Run the model to verify it works
ollama run gemma4:e2b
```

To verify Ollama's API is listening locally on port 11434, open your browser or run:
```powershell
curl http://localhost:11434/api/tags
```
You should see a JSON response listing your downloaded models including `gemma4:e2b`.

---

### Step 2: Download or Clone CampusLens

Clone the repository or extract the exported zip folder onto your Windows machine:

```powershell
git clone <repository-url> campuslens
cd campuslens
```

---

### Step 3: Configure Environment Variables

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

The default values in `.env` are pre-configured for your Windows setup:
```env
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="gemma4:e2b"
PORT=3000
```

---

### Step 4: Install Dependencies & Run

Install the required npm packages:

```powershell
npm install
```

Launch the local full-stack development server:

```powershell
npm run dev
```

This starts:
- The Express backend server at `http://localhost:3000` with the Ollama adapter and CORS protection.
- The Vite frontend dashboard mounted seamlessly on `http://localhost:3000`.

---

### Step 5: Open in Your Browser

Navigate to:
```
http://localhost:3000
```

You will see:
- The top-right badge shows: **`Ollama: gemma4:e2b`** with a green connected indicator.
- Upload any JPG, PNG, or WebP poster to extract details.
- Or click **Load Demo Data** to explore the pre-loaded overlapping notices.

---

## Why Local Execution Matters (Cloud Sandbox vs. Laptop)

When viewing this project in a hosted cloud container (such as the Google AI Studio cloud preview), `localhost` refers to the cloud container itself. Because the cloud container cannot access `http://localhost:11434` on your physical laptop's private network, the connection indicator in the cloud preview will show disconnected.

Running CampusLens locally on your Windows machine via `npm run dev` connects directly to your local Ollama instance on `127.0.0.1:11434` with low latency and 100% data privacy.

---

## Troubleshooting on Windows

1. **Connection Refused (`ECONNREFUSED 127.0.0.1:11434`)**
   - Ensure the Ollama app icon is running in your Windows taskbar system tray.
   - Run `ollama serve` in a dedicated terminal if the background service is stopped.

2. **CORS or Browser Restrictions**
   - The frontend never connects directly to Ollama. All requests are proxied securely through the local Express server at `/api/ollama/*`, preventing browser CORS issues.

3. **Inference Timeouts or High RAM Usage**
   - Gemma 4 runs efficiently on modern laptop CPUs and GPUs. If inference takes longer on large images, CampusLens includes an extended 90-second timeout window.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, tsx
- **Local AI**: Ollama Chat API (`/api/chat`) running `gemma4:e2b`
- **Conflict Algorithm**: Deterministic TypeScript interval intersection engine
