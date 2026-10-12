import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Configurable Ollama endpoint & model from environment (defaulting to 127.0.0.1 for Windows IPv4 reliability)
let ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
let ollamaModel = process.env.OLLAMA_MODEL || 'gemma4:e2b';

// Increase payload limits for base64 notice posters
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers for local execution flexibility
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to strip markdown code fences from AI model response
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    }
    const lastFence = cleaned.lastIndexOf('```');
    if (lastFence !== -1) {
      cleaned = cleaned.substring(0, lastFence);
    }
    cleaned = cleaned.trim();
  }
  return cleaned;
}

// Resilient Node.js fetch helper for local Ollama
// Handles Windows localhost IPv6 (::1) vs IPv4 (127.0.0.1) resolution differences
async function fetchOllama(endpointPath: string, options: RequestInit = {}, timeoutMs = 5000) {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;
  const base = ollamaBaseUrl.replace(/\/+$/, '');
  const primaryUrl = `${base}${cleanPath}`;

  // Candidates list to handle Windows IPv4 vs IPv6 issues
  const candidates: string[] = [primaryUrl];
  if (base.includes('localhost')) {
    candidates.push(`${base.replace('localhost', '127.0.0.1')}${cleanPath}`);
  } else if (base.includes('127.0.0.1')) {
    candidates.push(`${base.replace('127.0.0.1', 'localhost')}${cleanPath}`);
  }

  let lastError: unknown = null;

  for (const url of candidates) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // If successful or received an HTTP status from Ollama, this host is reachable
      const parsedUrl = new URL(url);
      const workingBase = `${parsedUrl.protocol}//${parsedUrl.host}`;
      if (workingBase !== ollamaBaseUrl && response.ok) {
        ollamaBaseUrl = workingBase;
      }

      return { response, url, error: null };
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
    }
  }

  return { response: null, url: primaryUrl, error: lastError };
}

// Health check handler for /api/ollama/health and /api/ollama/status
async function handleOllamaHealthCheck(_req: express.Request, res: express.Response) {
  res.setHeader('Content-Type', 'application/json');

  const isCloudPreview = !process.env.RUNNING_LOCALLY && (
    process.env.K_SERVICE !== undefined ||
    process.env.APP_URL?.includes('.run.app') ||
    process.env.HOST_URL?.includes('.run.app')
  );

  const startTime = Date.now();
  const { response, url, error } = await fetchOllama(
    '/api/tags',
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
    5000
  );

  const latencyMs = Date.now() - startTime;

  // Connection failure / network unreachable (e.g. ECONNREFUSED)
  if (error || !response) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorCause = (error as any)?.cause ? JSON.stringify((error as any).cause) : '';
    const fullError = errorCause ? `${errorMsg} (${errorCause})` : errorMsg;

    return res.status(503).json({
      connected: false,
      httpStatus: 503,
      statusText: 'Service Unavailable',
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels: [],
      modelInstalled: false,
      modelReady: false,
      error: `Cannot connect to Ollama at ${url}: ${fullError}`,
      checkedEndpoint: url,
      isCloudPreview,
      advice: isCloudPreview
        ? 'You are running in the cloud preview container. Localhost points to this container, not your Windows laptop. Run CampusLens locally via `npm run dev` on Windows to connect to your local Ollama!'
        : `Ensure Ollama is running on your Windows laptop (run 'ollama serve' or check Windows taskbar icon) and listening at http://127.0.0.1:11434.`,
    });
  }

  // Ollama responded with non-200 HTTP code
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    return res.status(response.status).json({
      connected: false,
      httpStatus: response.status,
      statusText: response.statusText,
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels: [],
      modelInstalled: false,
      modelReady: false,
      error: `Ollama returned HTTP ${response.status} (${response.statusText})${errorText ? `: ${errorText}` : ''}`,
      checkedEndpoint: url,
      isCloudPreview,
    });
  }

  // Ollama is online with HTTP 200
  try {
    const data = await response.json();
    const availableModels: string[] = Array.isArray(data.models)
      ? data.models.map((m: any) => m.name || m.model).filter(Boolean)
      : [];

    // Verify whether configured model name matches an installed model
    const cleanConfigured = ollamaModel.trim().toLowerCase();
    const modelInstalled = availableModels.some((m: string) => {
      const cleanM = m.trim().toLowerCase();
      return (
        cleanM === cleanConfigured ||
        cleanM === `${cleanConfigured}:latest` ||
        cleanM.split(':')[0] === cleanConfigured.split(':')[0]
      );
    });

    return res.status(200).json({
      connected: true,
      httpStatus: 200,
      statusText: 'OK',
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels,
      modelInstalled,
      modelReady: modelInstalled,
      latencyMs,
      checkedEndpoint: url,
      isCloudPreview: false,
      message: modelInstalled
        ? `Connected to Ollama on ${ollamaBaseUrl}. Model '${ollamaModel}' is verified and ready.`
        : `Connected to Ollama on ${ollamaBaseUrl}, but model '${ollamaModel}' was not found in installed models: [${availableModels.join(', ') || 'none'}]. Run 'ollama pull ${ollamaModel}' in PowerShell.`,
    });
  } catch (parseErr) {
    return res.status(502).json({
      connected: false,
      httpStatus: 502,
      statusText: 'Bad Gateway',
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels: [],
      modelInstalled: false,
      modelReady: false,
      error: `Failed to parse /api/tags JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
      checkedEndpoint: url,
    });
  }
}

// Handler for dynamic Ollama configuration update
function handleOllamaConfig(req: express.Request, res: express.Response) {
  res.setHeader('Content-Type', 'application/json');
  const { baseUrl, model } = req.body;
  if (baseUrl && typeof baseUrl === 'string') {
    ollamaBaseUrl = baseUrl.trim();
  }
  if (model && typeof model === 'string') {
    ollamaModel = model.trim();
  }
  return res.json({
    success: true,
    baseUrl: ollamaBaseUrl,
    model: ollamaModel,
  });
}

// Notice visual extraction via Ollama Chat API
async function handleOllamaExtract(req: express.Request, res: express.Response) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { imageBase64, modelOverride } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'Missing required imageBase64 data in request body.',
      });
    }

    // Clean base64 string (strip data:image/png;base64, prefix if present)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

    const activeModel = (modelOverride || ollamaModel).trim();

    const promptText = `You are CampusLens, an AI vision extractor for campus bulletin notices, event posters, exam circulars, and workshop flyers.

Analyze this notice image thoroughly. Extract all legible details, dates, timings, venues, requirements, and deadlines.
Return ONLY a valid JSON object matching the schema below. If any field is missing or unreadable from the image, set its value to null.

Schema:
{
  "title": "Notice headline or title, or null",
  "organization": "Organizing club, department, student chapter, or university body, or null",
  "eventName": "Event name, or null",
  "description": "Concise 1-2 sentence description of what the notice entails",
  "date": "Event date in YYYY-MM-DD format if identifiable, else readable date text, or null",
  "startTime": "Start time e.g. 14:00 or 02:00 PM, or null",
  "endTime": "End time e.g. 17:00 or 05:00 PM, or null",
  "venue": "Room number, auditorium, building, campus wing, or online link, or null",
  "deadline": "Registration or submission deadline with date/time, or null",
  "eligibility": "Target students, academic year, branch, or eligibility requirements, or null",
  "requiredDocuments": ["List of items required e.g. Student ID, Laptop, Resume, or empty array"],
  "suggestedActions": ["3-5 actionable student tasks derived directly from this notice"],
  "supportingText": "Important fees, contact emails, website links, or QR code instructions, or null",
  "verificationFlags": ["List any ambiguous, blurry, or missing key details that require manual confirmation"],
  "rawModelNotes": "Brief 1-sentence note about extraction quality and confidence"
}

Do NOT wrap in markdown explanation. Return strictly raw valid JSON.`;

    const ollamaPayload = {
      model: activeModel,
      messages: [
        {
          role: 'user',
          content: promptText,
          images: [cleanBase64],
        },
      ],
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1,
      },
    };

    // Send request to Ollama /api/chat through Node.js backend
    const { response, url, error } = await fetchOllama(
      '/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ollamaPayload),
      },
      120000 // 120 second timeout for vision inference on CPU/GPU
    );

    if (error || !response) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return res.status(503).json({
        error: `Cannot reach Ollama at ${url}: ${errorMsg}`,
        httpStatus: 503,
        endpoint: url,
        model: activeModel,
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `Ollama API error (${response.status}): ${errorText || response.statusText}`,
        httpStatus: response.status,
        endpoint: url,
        model: activeModel,
      });
    }

    const data = await response.json();
    const rawContent = data.message?.content || '';

    if (!rawContent) {
      return res.status(500).json({
        error: 'Empty response returned from Ollama model.',
      });
    }

    const cleanedJsonStr = cleanJsonResponse(rawContent);
    let parsedData: Record<string, unknown>;

    try {
      parsedData = JSON.parse(cleanedJsonStr);
    } catch {
      // Fallback: search for first { and last }
      const firstBrace = cleanedJsonStr.indexOf('{');
      const lastBrace = cleanedJsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        parsedData = JSON.parse(cleanedJsonStr.substring(firstBrace, lastBrace + 1));
      } else {
        return res.status(500).json({
          error: 'Failed to parse JSON response from Gemma model.',
          rawContent,
        });
      }
    }

    // Ensure array types for required fields
    const normalizedData = {
      title: parsedData.title ?? null,
      organization: parsedData.organization ?? null,
      eventName: parsedData.eventName ?? parsedData.title ?? null,
      description: parsedData.description ?? 'Notice extracted via Ollama Gemma vision.',
      date: parsedData.date ?? null,
      startTime: parsedData.startTime ?? null,
      endTime: parsedData.endTime ?? null,
      venue: parsedData.venue ?? null,
      deadline: parsedData.deadline ?? null,
      eligibility: parsedData.eligibility ?? null,
      requiredDocuments: Array.isArray(parsedData.requiredDocuments) ? parsedData.requiredDocuments : [],
      suggestedActions: Array.isArray(parsedData.suggestedActions) && parsedData.suggestedActions.length > 0
        ? parsedData.suggestedActions
        : ['Review notice details and verify schedule'],
      supportingText: parsedData.supportingText ?? null,
      verificationFlags: Array.isArray(parsedData.verificationFlags) ? parsedData.verificationFlags : [],
      rawModelNotes: parsedData.rawModelNotes ?? 'Processed via local Ollama inference.',
    };

    return res.json({
      success: true,
      modelUsed: activeModel,
      data: normalizedData,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isTimeout = errorMessage.includes('aborted');

    return res.status(500).json({
      error: isTimeout
        ? 'Inference timed out after 120 seconds. Ensure your local GPU/RAM is adequate for gemma4:e2b.'
        : `Ollama inference failed: ${errorMessage}`,
      endpoint: `${ollamaBaseUrl}/api/chat`,
      model: ollamaModel,
    });
  }
}

// 1. Explicit Express API Router
const apiRouter = express.Router();
apiRouter.get('/ollama/health', handleOllamaHealthCheck);
apiRouter.get('/ollama/status', handleOllamaHealthCheck);
apiRouter.post('/ollama/config', handleOllamaConfig);
apiRouter.post('/ollama/extract', handleOllamaExtract);

// Mount API routes
app.use('/api', apiRouter);

// Direct fallback registration on app to prevent routing bypass
app.get('/api/ollama/health', handleOllamaHealthCheck);
app.get('/api/ollama/status', handleOllamaHealthCheck);
app.post('/api/ollama/config', handleOllamaConfig);
app.post('/api/ollama/extract', handleOllamaExtract);

// Strict API catch-all guard: Any unhandled /api/* route MUST return JSON 404, NEVER HTML!
app.all('/api/*', (_req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: _req.originalUrl || _req.url,
  });
});

// Mount Vite middleware in development or serve static in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[CampusLens] Server running at http://0.0.0.0:${PORT}`);
  console.log(`[CampusLens] Ollama adapter configured for ${ollamaBaseUrl} using model ${ollamaModel}`);
});
