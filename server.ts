import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Configurable Ollama endpoint & model from environment
let ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
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

// 1. Ollama status & model check
app.get('/api/ollama/status', async (_req, res) => {
  const isCloudPreview = !process.env.RUNNING_LOCALLY && (
    process.env.K_SERVICE !== undefined ||
    process.env.APP_URL?.includes('.run.app') ||
    process.env.HOST_URL?.includes('.run.app')
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const targetUrl = `${ollamaBaseUrl.replace(/\/+$/, '')}/api/tags`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(200).json({
        connected: false,
        baseUrl: ollamaBaseUrl,
        model: ollamaModel,
        availableModels: [],
        error: `Ollama returned HTTP ${response.status}: ${response.statusText}`,
        isCloudPreview,
      });
    }

    const data = await response.json();
    const availableModels = Array.isArray(data.models)
      ? data.models.map((m: { name: string }) => m.name)
      : [];
    const modelReady = availableModels.some((m: string) =>
      m === ollamaModel || m.startsWith(ollamaModel.split(':')[0])
    );

    return res.json({
      connected: true,
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels,
      modelReady,
      isCloudPreview: false,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isConnRefused = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed') || errorMessage.includes('aborted');

    return res.status(200).json({
      connected: false,
      baseUrl: ollamaBaseUrl,
      model: ollamaModel,
      availableModels: [],
      error: isConnRefused
        ? `Cannot connect to Ollama at ${ollamaBaseUrl}. Ollama is either not running or inaccessible from this network.`
        : errorMessage,
      isCloudPreview,
      advice: isCloudPreview
        ? 'You are running in the cloud preview container. Localhost points to this container, not your Windows laptop. Run CampusLens locally via `npm run dev` to connect to your local Ollama!'
        : 'Ensure Ollama is running (`ollama serve` or `ollama run gemma4:e2b`).',
    });
  }
});

// 2. Dynamic Ollama configuration update (for testing custom local IPs or models)
app.post('/api/ollama/config', (req, res) => {
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
});

// 3. Notice visual extraction via Ollama Chat API
app.post('/api/ollama/extract', async (req, res) => {
  try {
    const { imageBase64, modelOverride } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({
        error: 'Missing required imageBase64 data in request body.',
      });
    }

    // Clean base64 string (strip data:image/png;base64, prefix if present)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const activeModel = modelOverride || ollamaModel;
    const chatEndpoint = `${ollamaBaseUrl.replace(/\/+$/, '')}/api/chat`;

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

    const controller = new AbortController();
    // 90 second timeout for local vision inference on CPU/GPU
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `Ollama API error (${response.status}): ${errorText || response.statusText}`,
        endpoint: chatEndpoint,
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
        ? 'Inference timed out after 90 seconds. Ensure your local GPU/RAM is adequate for gemma4:e2b.'
        : `Ollama inference failed: ${errorMessage}`,
      endpoint: `${ollamaBaseUrl}/api/chat`,
      model: ollamaModel,
    });
  }
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
